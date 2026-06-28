import { defineConfig } from 'vitest/config'
import type { PluginOption, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'

// Dev-only: serve the real api/*.ts handlers under `npm run dev`, since Vite
// alone doesn't run Vercel functions. Production/CI are unaffected — this runs
// only inside `configureServer`. Lets the live overlay be tested locally.
function devApi(): PluginOption {
  const routes = ['/api/live-scores', '/api/ko-summary']
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      for (const route of routes) {
        server.middlewares.use(route, async (req: IncomingMessage, res: ServerResponse) => {
          try {
            const url = new URL(req.url ?? '', 'http://localhost')
            const handler = (await server.ssrLoadModule(`${route}.ts`)).default
            const vRes = {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status(code: number) { res.statusCode = code; return this },
              json(body: unknown) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(body))
                return this
              },
            }
            await handler({ method: req.method, query: Object.fromEntries(url.searchParams) }, vRes)
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
  build: {
    // Downlevel to a broadly-supported baseline so older mobile browsers can
    // parse the bundle. Without this, esbuild keeps ES2021+ syntax (??=, ||=,
    // &&=) verbatim, and any browser that can't parse it fails to start the
    // whole app — a blank screen with no error. Covers iOS 14 / Chrome 87 (2020).
    target: ['es2019', 'chrome87', 'edge88', 'firefox78', 'safari14', 'ios14'],
    // The bundle is mostly prediction data that gzips ~7:1 (~124 kB on the wire)
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    pool: 'threads',
    // userEvent-driven tests finish in well under a second solo, but the
    // default 5s ceiling gets starved when the whole suite runs in parallel.
    // Give headroom for scheduling contention — a genuine hang still fails.
    testTimeout: 15000,
  },
})
