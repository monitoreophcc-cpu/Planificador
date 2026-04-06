/**
 * localStorage helpers for lightweight UI flags and preferences.
 * These are intentionally separate from IndexedDB state persistence.
 */

const THEME_KEY = 'control-puntos:theme'
const TUTORIAL_KEY = 'control-puntos:tutorial-seen'
const FLAG_PREFIX = 'control-puntos:flag:'

const isBrowser =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function getThemeMode(): 'light' | 'dark' | null {
  if (!isBrowser) return null

  try {
    const theme = localStorage.getItem(THEME_KEY)
    if (theme === 'light' || theme === 'dark') {
      return theme
    }
    return null
  } catch (error) {
    console.error('Failed to get theme mode:', error)
    return null
  }
}

export function setThemeMode(mode: 'light' | 'dark'): void {
  if (!isBrowser) return

  try {
    localStorage.setItem(THEME_KEY, mode)
  } catch (error) {
    console.error('Failed to set theme mode:', error)
  }
}

export function getHasSeenTutorial(): boolean {
  if (!isBrowser) return false

  try {
    return localStorage.getItem(TUTORIAL_KEY) === 'true'
  } catch (error) {
    console.error('Failed to get tutorial status:', error)
    return false
  }
}

export function setHasSeenTutorial(seen: boolean): void {
  if (!isBrowser) return

  try {
    localStorage.setItem(TUTORIAL_KEY, String(seen))
  } catch (error) {
    console.error('Failed to set tutorial status:', error)
  }
}

export function getFlag(key: string): boolean {
  if (!isBrowser) return false

  try {
    return localStorage.getItem(FLAG_PREFIX + key) === 'true'
  } catch (error) {
    console.error(`Failed to get flag ${key}:`, error)
    return false
  }
}

export function setFlag(key: string, value: boolean): void {
  if (!isBrowser) return

  try {
    localStorage.setItem(FLAG_PREFIX + key, String(value))
  } catch (error) {
    console.error(`Failed to set flag ${key}:`, error)
  }
}

export function clearUIFlags(): void {
  if (!isBrowser) return

  try {
    localStorage.removeItem(THEME_KEY)
    localStorage.removeItem(TUTORIAL_KEY)

    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith(FLAG_PREFIX)) {
        localStorage.removeItem(key)
      }
    }
  } catch (error) {
    console.error('Failed to clear UI flags:', error)
  }
}
