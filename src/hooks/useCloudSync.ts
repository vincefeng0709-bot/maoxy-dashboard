import { LOCAL_UPDATED_AT_KEY } from './useLocalStorage'

const API_BASE = 'https://api.xinymao.cn'
// 注意：前端打包后 token 对外可见，仅用于防止随意扫描，不是真正的身份认证
const SYNC_TOKEN = 'mx-57a3c5c3783b54ffd0bd0f09277e3bd6'

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
  'music-config',
  'countdowns',
  'arxiv-config',
]

export interface SyncResult {
  ok: boolean
  /** 拉取时云端数据是否与本地不同（需要刷新页面） */
  changed?: boolean
  /** 失败时的可读原因 */
  error?: string
}

function statusError(status: number): string {
  if (status === 401) return '认证失败：token 不匹配，请检查服务器配置'
  if (status >= 500) return `服务器错误（${status}），请稍后重试`
  return `请求失败（${status}）`
}

export async function apiFetch(path: string, options?: RequestInit) {
  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-sync-token': SYNC_TOKEN,
        ...options?.headers,
      },
    })
  // 网络偶发断连时自动重试两次
  try {
    return await doFetch()
  } catch {
    await new Promise((r) => setTimeout(r, 800))
    try {
      return await doFetch()
    } catch {
      await new Promise((r) => setTimeout(r, 1500))
      return doFetch()
    }
  }
}

/** 收集自定义分类的动态 storageKey */
function getCustomKeys(): string[] {
  const keys: string[] = []
  try {
    const raw = localStorage.getItem('custom-sections')
    if (raw) {
      const sections = JSON.parse(raw) as { storageKey?: string }[]
      sections.forEach((s) => {
        if (s.storageKey) keys.push(s.storageKey)
      })
    }
  } catch {
    // custom-sections 损坏时跳过，不影响其余数据同步
  }
  return keys
}

function collectLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  ;[...SYNC_KEYS, ...getCustomKeys()].forEach((k) => {
    try {
      const v = localStorage.getItem(k)
      if (v) data[k] = JSON.parse(v)
    } catch {
      // 单个 key 损坏时跳过，不拖垮整次推送
    }
  })
  const localAt = Number(localStorage.getItem(LOCAL_UPDATED_AT_KEY) ?? 0)
  data._updatedAt = localAt || Date.now()
  return data
}

export async function pushToCloud(): Promise<SyncResult> {
  try {
    const res = await apiFetch('/data', {
      method: 'POST',
      body: JSON.stringify(collectLocalData()),
      // keepalive 保证页面关闭时请求仍能发出
      keepalive: true,
    })
    if (!res.ok) return { ok: false, error: statusError(res.status) }
    return { ok: true }
  } catch {
    return { ok: false, error: '网络连接失败，请检查网络后重试' }
  }
}

export async function pullFromCloud(): Promise<SyncResult> {
  try {
    const res = await apiFetch('/data')
    if (!res.ok) return { ok: false, error: statusError(res.status) }
    const data = (await res.json()) as Record<string, unknown>
    const keys = Object.keys(data).filter((k) => k !== '_updatedAt')
    if (keys.length === 0) return { ok: true, changed: false }

    // 本地比云端新（比如上次推送失败）：反向推送，避免覆盖本地修改
    const remoteAt = Number(data._updatedAt ?? 0)
    const localAt = Number(localStorage.getItem(LOCAL_UPDATED_AT_KEY) ?? 0)
    if (localAt > remoteAt) {
      const pushed = await pushToCloud()
      return { ok: pushed.ok, changed: false, error: pushed.error }
    }

    let changed = false
    keys.forEach((k) => {
      const next = JSON.stringify(data[k])
      if (localStorage.getItem(k) !== next) {
        localStorage.setItem(k, next)
        changed = true
      }
    })

    // 清理已在别的设备上删除的自定义分类残留数据
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('custom-links-') && !(k in data)) {
        localStorage.removeItem(k)
        changed = true
      }
    }

    if (changed) {
      localStorage.setItem(LOCAL_UPDATED_AT_KEY, String(remoteAt || Date.now()))
    }
    return { ok: true, changed }
  } catch {
    return { ok: false, error: '网络连接失败，请检查网络后重试' }
  }
}
