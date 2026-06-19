import type { RivalryStats } from './rivalryStats'

// Brand palette (mirrors src/index.css custom properties).
const CREAM = '#EFE4B8'
const PAPER = '#FBF8EC'
const RED = '#C0272D'
const NAVY = '#0B2244'
const GOLD = '#D4A016'
const INK = '#180F07'
const BORDER = '#C8B87A'

const firstName = (label: string) => label.split(' ')[0]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`failed to load image: ${src}`))
    img.src = src
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draw a photo inside a circle using object-fit: cover with a top-biased crop,
 *  matching the on-page avatar (object-position center 22%). */
function drawAvatar(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number,
  ringColor: string,
  leading: boolean,
) {
  const d = radius * 2
  const scale = Math.max(d / img.width, d / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = cx - dw / 2
  const dy = cy - radius - (dh - d) * 0.22

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.fillStyle = CREAM
  ctx.fill()
  if (!leading) {
    ctx.filter = 'grayscale(0.35)'
  }
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.filter = 'none'
  ctx.restore()

  // Gold halo for the leader.
  if (leading) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 9, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(212, 160, 22, 0.35)'
    ctx.lineWidth = 14
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = leading ? GOLD : ringColor
  ctx.lineWidth = leading ? 8 : 5
  ctx.stroke()
}

/** Render the VS scoreboard to a shareable PNG blob (1080×1080). */
export async function buildShareImage(stats: RivalryStats, elradSrc: string, eldadSrc: string): Promise<Blob> {
  const S = 1080
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no 2d context')

  // Make sure Heebo is loaded so the canvas text matches the site.
  if (document.fonts?.ready) {
    try {
      await document.fonts.load('800 64px Heebo')
      await document.fonts.ready
    } catch {
      /* fall back to system font */
    }
  }

  const [elrad, eldad] = await Promise.all([loadImage(elradSrc), loadImage(eldadSrc)])

  // Background card.
  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = PAPER
  roundRect(ctx, 40, 40, S - 80, S - 80, 48)
  ctx.fill()
  ctx.strokeStyle = BORDER
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.direction = 'rtl'

  // Header.
  ctx.fillStyle = NAVY
  ctx.font = '800 78px Heebo, system-ui, sans-serif'
  ctx.fillText('⚔️ קרב האל[רד]דים', S / 2, 165)
  ctx.fillStyle = GOLD
  ctx.font = '700 34px Heebo, system-ui, sans-serif'
  ctx.fillText('אלרד נגד אלדד · המאבק החשוב באמת', S / 2, 220)

  // Sides: Eldad (b) on the left, Elrad (a) on the right — matches the RTL page.
  const radius = 150
  const cy = 470
  const leftX = 310 // Eldad (b)
  const rightX = S - 310 // Elrad (a)
  const aLeading = stats.leader === 'a'
  const bLeading = stats.leader === 'b'

  drawAvatar(ctx, eldad, leftX, cy, radius, RED, bLeading)
  drawAvatar(ctx, elrad, rightX, cy, radius, NAVY, aLeading)

  // Crowns on the leader.
  ctx.font = '90px system-ui, sans-serif'
  if (bLeading) ctx.fillText('👑', leftX + 20, cy - radius - 18)
  if (aLeading) ctx.fillText('👑', rightX + 20, cy - radius - 18)

  const drawSide = (x: number, side: 'a' | 'b') => {
    const s = side === 'a' ? stats.a : stats.b
    ctx.fillStyle = '#6b5d3a'
    ctx.font = '600 32px Heebo, system-ui, sans-serif'
    ctx.fillText(`מקום ${s.rank}`, x, cy + radius + 60)
    ctx.fillStyle = INK
    ctx.font = '800 44px Heebo, system-ui, sans-serif'
    ctx.fillText(firstName(s.label), x, cy + radius + 110)
    ctx.fillStyle = stats.leader === side ? GOLD : NAVY
    ctx.font = '800 96px "Bebas Neue", Heebo, system-ui, sans-serif'
    ctx.fillText(String(s.total), x, cy + radius + 205)
  }
  drawSide(leftX, 'b')
  drawSide(rightX, 'a')

  // Centre VS + gap.
  ctx.fillStyle = NAVY
  ctx.font = '800 70px Heebo, system-ui, sans-serif'
  ctx.fillText('VS', S / 2, cy - 10)
  if (stats.leader !== 'tie') {
    ctx.fillStyle = RED
    ctx.font = '800 40px Heebo, system-ui, sans-serif'
    ctx.fillText(`פער ${stats.gap}`, S / 2, cy + 50)
  } else {
    ctx.fillStyle = RED
    ctx.font = '800 40px Heebo, system-ui, sans-serif'
    ctx.fillText('תיקו', S / 2, cy + 50)
  }

  // Footer strip.
  ctx.fillStyle = NAVY
  roundRect(ctx, 40, S - 150, S - 80, 110, 0)
  ctx.fill()
  ctx.fillStyle = CREAM
  ctx.font = '700 40px Heebo, system-ui, sans-serif'
  ctx.fillText('hahimur.vercel.app/rivalry', S / 2, S - 80)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
