import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, RefreshCw } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export default function GitHubContrib() {
  const [username, setUsername] = useLocalStorage('github-username', '')
  const [input, setInput] = useState('')
  const [imgKey, setImgKey] = useState(0)
  const [editing, setEditing] = useState(!username)

  const apply = () => {
    const val = input.trim() || username
    if (!val) return
    setUsername(val)
    setInput('')
    setEditing(false)
    setImgKey((k) => k + 1)
  }

  const refresh = () => setImgKey((k) => k + 1)

  return (
    <GlassCard id="github" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Github size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            GitHub 贡献图
          </h2>
        </div>
        <div className="flex gap-1">
          {username && (
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCw size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? '取消' : '更改用户名'}
          </Button>
        </div>
      </div>

      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="输入 GitHub 用户名..."
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
          />
          <Button variant="primary" size="sm" onClick={apply}>
            确认
          </Button>
        </motion.div>
      )}

      {username ? (
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              @{username}
            </p>
            <img
              key={imgKey}
              src={`https://ghchart.rshah.org/d4892a/${username}`}
              alt={`${username} 的 GitHub 贡献图`}
              className="w-full rounded-lg dark:opacity-90"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-claude-500 hover:text-claude-600 transition-colors"
            >
              查看完整 GitHub 主页 →
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Github size={32} className="text-zinc-200 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            输入 GitHub 用户名以显示贡献热力图
          </p>
        </div>
      )}
    </GlassCard>
  )
}
