import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Trash2, ExternalLink, FileText, Rss, Play } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { generateId } from '../../utils'
import type { ReadingItem } from '../../types'

const typeConfig = {
  paper: { label: '论文', icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  blog: { label: '博客', icon: Rss, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  video: { label: '视频', icon: Play, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
}

type ReadingType = 'paper' | 'blog' | 'video'

export default function ReadingList() {
  const [items, setItems] = useLocalStorage<ReadingItem[]>('reading-list', [])
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<ReadingType | 'all'>('all')
  const [form, setForm] = useState({ title: '', url: '', type: 'paper' as ReadingType })

  const addItem = () => {
    if (!form.title.trim() || !form.url.trim()) return
    const url = form.url.startsWith('http') ? form.url : `https://${form.url}`
    setItems((prev) => [
      { id: generateId(), title: form.title, url, type: form.type, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setForm({ title: '', url: '', type: 'paper' })
    setModalOpen(false)
  }

  const deleteItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter)

  return (
    <>
      <GlassCard id="reading" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              阅读清单
            </h2>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{items.length}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={13} />
            添加
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {(['all', 'paper', 'blog', 'video'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={[
                'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                filter === t
                  ? 'bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
              ].join(' ')}
            >
              {t === 'all' ? '全部' : typeConfig[t].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-zinc-400 dark:text-zinc-600 py-8"
              >
                暂无内容 📚
              </motion.p>
            ) : (
              filtered.map((item) => {
                const cfg = typeConfig[item.type]
                const Icon = cfg.icon
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2 group rounded-xl p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className={`flex-shrink-0 rounded-lg p-1.5 mt-0.5 ${cfg.color}`}>
                      <Icon size={12} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-claude-500 transition-colors flex items-start gap-1"
                      >
                        <span className="line-clamp-2">{item.title}</span>
                        <ExternalLink size={11} className="flex-shrink-0 mt-0.5 text-zinc-400" />
                      </a>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="添加到阅读清单">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">类型</label>
            <div className="flex gap-2">
              {(['paper', 'blog', 'video'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={[
                    'flex-1 py-2 rounded-xl text-sm font-medium transition-all border',
                    form.type === t
                      ? 'border-claude-400 bg-claude-50 dark:bg-claude-900/20 text-claude-600 dark:text-claude-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800',
                  ].join(' ')}
                >
                  {typeConfig[t].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">标题 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="内容标题"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">URL *</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={addItem}
              disabled={!form.title.trim() || !form.url.trim()}
            >
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
