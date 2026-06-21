import { useEffect, useState } from 'react'
import type { ThemeMode } from '../types'

export function useTheme(mode: ThemeMode) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const applyTheme = (dark: boolean) => {
      setIsDark(dark)
      if (dark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    if (mode === 'dark') {
      applyTheme(true)
      return
    }

    if (mode === 'light') {
      applyTheme(false)
      return
    }

    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    applyTheme(mq.matches)

    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  return isDark
}
