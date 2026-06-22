import { useCallback, useRef } from 'react'

const API_BASE = 'https://api.xinymao.cn'
const SYNC_TOKEN = 'maoxy-secret-token'

const SYNC_KEYS = [
  'dashboard-settings',
  'todos',
  'quick-note',
  'reading-list',
  'ai-tools',
  'dev-links',
  'research-links',
  'blog-links',
  'custom-sections',
  'github-username',
  'weather-city',
]

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-sync-token': SYNC_TOKEN,
      ...options?.headers,
    },
  })
}

export async function pushToCloud(): Promise<boolean> {
  try {
    const data: Record<string, unknown> = {}
    // 动态收集自定义分类的 storageKey
    const customKeys: string[] = []
    const rawSections = localStorage.getItem('custom-sections')
    if (rawSections) {
      try {
        const sections = JSON.parse(rawSections) as { storageKey: string }[]
        sections.forEach((s) => { if (s.storageKey) customKeys.push(s.storageKey) })
      } catch { /* ignore */ }
    }
    ;[...SYNC_KEYS, ...customKeys].forEach((k) => {
      const v = localStorage.getItem(k)
      if (v) data[k] = JSON.parse(v)
    })
    const res = await apiFetch('/data', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function pullFromCloud(): Promise<boolean> {
  try {
    const res = await apiFetch('/data')
    if (!res.ok) return false
    const data = await res.json() as Record<string, unknown>
    if (Object.keys(data).length === 0) return false
    Object.entries(data).forEach(([k, v]) => {
      localStorage.setItem(k, JSON.stringify(v))
    })
    return true
  } catch {
    return false
  }
}

export function useCloudSync() {
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const schedulePush = useCallback(() => {
    if (pushTimer.current) clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushToCloud()
    }, 2000)
  }, [])

  return { schedulePush, pushToCloud, pullFromCloud }
}
