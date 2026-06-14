import { useState, useEffect } from 'react'
import { USERS } from '../users'

const ME_KEY = 'hahimur.me'
const ME_EVENT = 'currentUserChanged'

const read = () => localStorage.getItem(ME_KEY) ?? ''

/**
 * The participant the viewer has identified as "me", persisted in localStorage
 * so every page reads and writes the same source of truth. Consumers stay in
 * sync within a page (via a custom event) and across tabs (via `storage`),
 * so the global picker and anything reading `currentUser` never drift apart.
 */
export function useCurrentUser() {
  const [me, setMe] = useState(read)

  useEffect(() => {
    const sync = () => setMe(read())
    window.addEventListener(ME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(ME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const currentUser = USERS.find(u => u.label === me)

  const pickMe = (label: string) => {
    if (label) localStorage.setItem(ME_KEY, label)
    else localStorage.removeItem(ME_KEY)
    window.dispatchEvent(new Event(ME_EVENT))
  }

  return { me, currentUser, pickMe }
}
