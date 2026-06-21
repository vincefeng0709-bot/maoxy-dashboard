import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import type { SearchEngine, SearchEngineConfig } from '../../types'

const ENGINES: SearchEngineConfig[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: '用 Google 搜索...',
    color: '#4285F4',
  },
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下...',
    color: '#2932E1',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    placeholder: '搜索 GitHub...',
    color: '#24292f',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    url: 'https://scholar.google.com/scholar?q=',
    placeholder: '搜索学术论文...',
    color: '#1967D2',
  },
  {
    id: 'pubmed',
    name: 'PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=',
    placeholder: '搜索 PubMed...',
    color: '#326599',
  },
]

export default function SearchCenter() {
  const [engine, setEngine] = useState<SearchEngine>('google')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const current = ENGINES.find((e) => e.id === engine)!

  const handleSearch = () => {
    if (!query.trim()) return
    window.open(current.url + encodeURIComponent(query.trim()), '_blank')
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <GlassCard id="search" className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Search size={16} className="text-zinc-400" />
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          搜索中心
        </h2>
      </div>

      {/* Engine switcher */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {ENGINES.map((eng) => (
          <motion.button
            key={eng.id}
            onClick={() => {
              setEngine(eng.id)
              inputRef.current?.focus()
            }}
            whileTap={{ scale: 0.95 }}
            className={[
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150',
              engine === eng.id
                ? 'text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
            ].join(' ')}
            style={
              engine === eng.id
                ? { backgroundColor: eng.color }
                : undefined
            }
          >
            {eng.name}
          </motion.button>
        ))}
      </div>

      {/* Search input */}
      <AnimatePresence mode="wait">
        <motion.div
          key={engine}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={current.placeholder}
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-claude-400/40 transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSearch}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm transition-all"
            style={{ backgroundColor: current.color }}
          >
            搜索
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </GlassCard>
  )
}
