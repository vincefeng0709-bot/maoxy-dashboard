import { useState, useCallback, useEffect, useRef } from 'react'

// 同 key 的多个 hook 实例之间保持同步
const STORAGE_EVENT = 'dashboard-storage-change'
// 任意数据变化的全局通知（供云同步防抖推送使用）
export const DATA_CHANGED_EVENT = 'dashboard-data-changed'
// 本地数据最后修改时间戳，用于和云端比较新旧
export const LOCAL_UPDATED_AT_KEY = 'local-updated-at'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue)

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialRef.current
    } catch {
      return initialRef.current
    }
  })

  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent<{ key: string }>).detail?.key !== key) return
      try {
        const item = window.localStorage.getItem(key)
        setStoredValue(item ? (JSON.parse(item) as T) : initialRef.current)
      } catch {
        // ignore
      }
    }
    window.addEventListener(STORAGE_EVENT, handler)
    return () => window.removeEventListener(STORAGE_EVENT, handler)
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 以 localStorage 为准读取当前值，保证多实例下函数式更新不丢数据
        const raw = window.localStorage.getItem(key)
        const prev = raw ? (JSON.parse(raw) as T) : initialRef.current
        const next = value instanceof Function ? value(prev) : value
        window.localStorage.setItem(key, JSON.stringify(next))
        window.localStorage.setItem(LOCAL_UPDATED_AT_KEY, String(Date.now()))
        setStoredValue(next)
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
        window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail: { key } }))
      } catch {
        // ignore write errors
      }
    },
    [key]
  )

  return [storedValue, setValue] as const
}
