import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hourglass, Plus, Trash2 } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { generateId } from '../../utils'
import type { CountdownItem } from '../../types'

function daysUntil(date: string): number {
  const target = new Date(date + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function dayStyle(days: number): string {
  if (days < 0) return 'text-zinc-300 dark:text-zinc-600'
  if (days <= 3) return 'text-red-500'
  if (days <= 7) return 'text-claude-500'
  return 'text-zinc-700 dark:text-zinc-200'
}

export default function CountdownList() {
  const [items, setItems] = useLocalStorage<CountdownItem[]>('countdowns', [])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', date: '' })

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return
    setItems((prev) => [
      ...prev,
      { id: generateId(), title: form.title.trim(), date: form.date, createdAt: new Date().toISOString() },
    ])
    setForm({ title: '', date: '' })
    setModalOpen(false)
  }

  return (
    <>
      <GlassCard id="countdown" className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hourglass size={15} className="text-zinc-400" />
            <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              倒计时
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={13} />
            添加
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-300 dark:text-zinc-600">
            添加重要日期，如论文投稿截止、组会汇报...
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {sorted.map((item) => {
                const days = daysUntil(item.date)
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/60"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${days < 0 ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>
                        {item.title}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                        {item.date}
                      </p>
                    </div>
                    <span className={`font-mono text-sm font-semibold tabular-nums ${dayStyle(days)}`}>
                      {days > 0 && `D-${days}`}
                      {days === 0 && '今天'}
                      {days < 0 && `已过 ${-days} 天`}
                    </span>
                    <button
                      onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                      className="rounded-md p-1 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="添加倒计时">
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">事件名称 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="例如：NeurIPS 投稿截止"
              autoFocus
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">日期 *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1 justify-center" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1 justify-center"
              onClick={handleAdd}
              disabled={!form.title.trim() || !form.date}
            >
              添加
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
