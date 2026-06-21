import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Eye, Edit3, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import GlassCard from '../ui/GlassCard'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export default function QuickNotes() {
  const [note, setNote] = useLocalStorage('quick-note', '')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // auto-save with debounce
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 800)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [note])

  return (
    <GlassCard id="notes" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            快速笔记
          </h2>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-emerald-500"
              >
                <Check size={11} />
                已保存
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setPreview(false)}
            className={[
              'rounded-lg p-1.5 transition-colors',
              !preview
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
            ].join(' ')}
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => setPreview(true)}
            className={[
              'rounded-lg p-1.5 transition-colors',
              preview
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
            ].join(' ')}
          >
            <Eye size={13} />
          </button>
        </div>
      </div>

      <div className="min-h-48">
        {preview ? (
          <div className="prose prose-sm dark:prose-invert max-w-none min-h-48 text-zinc-700 dark:text-zinc-300">
            {note ? (
              <ReactMarkdown>{note}</ReactMarkdown>
            ) : (
              <p className="text-zinc-400 dark:text-zinc-600 italic">
                暂无内容，切换到编辑模式开始写作...
              </p>
            )}
          </div>
        ) : (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={'支持 Markdown 语法\n\n# 标题\n**加粗** *斜体*\n- 列表项\n\n开始记录你的想法...'}
            className="w-full min-h-48 resize-none bg-transparent text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-300 dark:placeholder-zinc-600 outline-none leading-relaxed font-mono"
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-2">
        <span className="text-xs text-zinc-400 dark:text-zinc-600">
          支持 Markdown · 自动保存
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-600">
          {note.length} 字符
        </span>
      </div>
    </GlassCard>
  )
}
