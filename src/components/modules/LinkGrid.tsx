import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, ExternalLink, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { generateId } from '../../utils'
import type { LinkItem } from '../../types'

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function SiteIcon({ url, emoji }: { url: string; emoji?: string }) {
  const [failed, setFailed] = useState(false)

  if (emoji) {
    return <span className="text-base leading-none w-5 h-5 flex items-center justify-center">{emoji}</span>
  }

  if (failed) {
    return <Globe size={16} className="text-zinc-400 flex-shrink-0" />
  }

  const domain = getDomain(url)
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      width={16}
      height={16}
      className="w-4 h-4 rounded-sm flex-shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  )
}

interface Props {
  id: string
  title: string
  icon: LucideIcon
  storageKey: string
  defaults: LinkItem[]
  onDeleteSection?: () => void
}

export default function LinkGrid({ id, title, icon: Icon, storageKey, defaults, onDeleteSection }: Props) {
  const [links, setLinks] = useLocalStorage<LinkItem[]>(storageKey, defaults)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LinkItem | null>(null)
  const [form, setForm] = useState({ name: '', url: '', emoji: '' })

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', url: '', emoji: '' })
    setModalOpen(true)
  }

  const openEdit = (item: LinkItem) => {
    setEditTarget(item)
    setForm({ name: item.name, url: item.url, emoji: item.emoji ?? '' })
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) return
    const url = form.url.startsWith('http') ? form.url : `https://${form.url}`
    if (editTarget) {
      setLinks((prev) =>
        prev.map((l) =>
          l.id === editTarget.id
            ? { ...l, name: form.name, url, emoji: form.emoji }
            : l
        )
      )
    } else {
      setLinks((prev) => [
        ...prev,
        { id: generateId(), name: form.name, url, emoji: form.emoji },
      ])
    }
    setModalOpen(false)
  }

  const handleDelete = (itemId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== itemId))
  }

  return (
    <>
      <GlassCard id={id} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <div className="flex gap-1">
            {onDeleteSection && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm(`确认删除「${title}」分类？其中的链接也会一并删除。`)) {
                    onDeleteSection()
                  }
                }}
              >
                <Trash2 size={13} />
                删除分类
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={openAdd}>
              <Plus size={13} />
              添加
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {links.map((link) => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="group relative"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-zinc-50/80 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-100 dark:border-zinc-700/50 transition-all group/link"
                >
                  <SiteIcon url={link.url} emoji={link.emoji} />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate flex-1">
                    {link.name}
                  </span>
                  <ExternalLink
                    size={11}
                    className="text-zinc-300 dark:text-zinc-600 group-hover/link:text-zinc-400 dark:group-hover/link:text-zinc-400 flex-shrink-0"
                  />
                </a>
                {/* edit/delete overlay */}
                <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                  <button
                    onClick={(e) => { e.preventDefault(); openEdit(link) }}
                    className="rounded-md p-1 bg-white/90 dark:bg-zinc-800/90 shadow text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Pencil size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(link.id) }}
                    className="rounded-md p-1 bg-white/90 dark:bg-zinc-800/90 shadow text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? '编辑链接' : '添加链接'}
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="w-20">
              <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Emoji</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                placeholder="🔗"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-center outline-none focus:ring-2 focus:ring-claude-400/40"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="网站名称"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">URL *</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSave}
              disabled={!form.name.trim() || !form.url.trim()}
            >
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
