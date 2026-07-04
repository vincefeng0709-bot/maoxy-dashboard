import { useState, useEffect, useCallback } from 'react'
import { Newspaper, RefreshCw, Pencil, ExternalLink } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { apiFetch } from '../../hooks/useCloudSync'
import type { ArxivConfig } from '../../types'

interface Paper {
  id: string
  title: string
  authors: string
  published: string
  link: string
}

const CACHE_TTL = 30 * 60 * 1000 // 30 分钟

async function fetchArxiv(query: string): Promise<Paper[]> {
  const cacheKey = `arxiv-cache-${query}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const { time, papers } = JSON.parse(cached) as { time: number; papers: Paper[] }
      if (Date.now() - time < CACHE_TTL) return papers
    }
  } catch { /* ignore */ }

  // arXiv API 不带 CORS 头，浏览器无法直接请求，通过自己的 API 服务器中转
  const res = await apiFetch(`/arxiv?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`arXiv API ${res.status}`)
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml')
  const papers: Paper[] = [...xml.querySelectorAll('entry')].map((entry) => {
    const authors = [...entry.querySelectorAll('author name')].map((n) => n.textContent ?? '')
    return {
      id: entry.querySelector('id')?.textContent ?? '',
      title: (entry.querySelector('title')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      authors: authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' 等' : ''),
      published: (entry.querySelector('published')?.textContent ?? '').slice(0, 10),
      link: entry.querySelector('id')?.textContent ?? '',
    }
  })
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), papers }))
  } catch { /* ignore */ }
  return papers
}

export default function ArxivFeed() {
  const [config, setConfig] = useLocalStorage<ArxivConfig>('arxiv-config', { query: '' })
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const query = config.query.trim()

  const load = useCallback(async (q: string, force = false) => {
    if (!q) return
    if (force) sessionStorage.removeItem(`arxiv-cache-${q}`)
    setLoading(true)
    setError('')
    try {
      setPapers(await fetchArxiv(q))
    } catch {
      setError('获取失败，可能是网络问题，点击刷新重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (query) load(query)
  }, [query, load])

  const handleSave = () => {
    const q = input.trim()
    if (!q) return
    setConfig({ query: q })
    setEditing(false)
  }

  const showInput = editing || !query

  return (
    <GlassCard id="arxiv" className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={15} className="text-zinc-400" />
          <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            arXiv 最新论文
          </h2>
        </div>
        {query && !editing && (
          <div className="flex items-center gap-0.5">
            <span className="font-mono text-[11px] text-zinc-300 dark:text-zinc-600 mr-1 max-w-32 truncate">
              {query}
            </span>
            <button
              onClick={() => { setEditing(true); setInput(query) }}
              title="修改订阅"
              className="rounded-lg p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => load(query, true)}
              title="刷新"
              disabled={loading}
              className="rounded-lg p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {showInput ? (
        <div className="flex flex-col gap-2 py-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="订阅关键词，如 cat:cs.LG 或 all:protein structure"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            支持 arXiv 检索语法：cat:分类（如 cs.LG、q-bio.BM）、all:关键词、ti:标题词，可用 AND/OR 组合
          </p>
          <div className="flex gap-2">
            {editing && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>取消</Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!input.trim()}>
              订阅
            </Button>
          </div>
        </div>
      ) : loading && papers.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-300 dark:text-zinc-600">加载中...</div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-red-400">{error}</div>
      ) : (
        <div className="flex flex-col gap-1">
          {papers.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-snug line-clamp-2">
                  {p.title}
                </p>
                <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                  {p.published} · {p.authors}
                </p>
              </div>
              <ExternalLink
                size={11}
                className="text-transparent group-hover:text-zinc-400 flex-shrink-0 mt-1 transition-colors"
              />
            </a>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
