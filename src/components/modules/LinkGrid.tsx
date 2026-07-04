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

  return (
    <span className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
      {emoji ? (
        <span className="text-sm leading-none">{emoji}</span>
      ) : failed ? (
        <Globe size={13} className="text-zinc-400" />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`}
          alt=""
          width={16}
          height={16}
          className="w-4 h-4 rounded-sm object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
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

type ConfirmTarget =
  | { type: 'section' }
  | { type: 'link'; id: string; name: string }
  | null

export default function LinkGrid({ id, title, icon: Icon, storageKey, defaults, onDeleteSection }: Props) {
  const [links, setLinks] = useLocalStorage<LinkItem[]>(storageKey, defaults)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LinkItem | null>(null)
  const [form, setForm] = useState({ name: '', url: '', emoji: '' })
  const [formError, setFormError] = useState('')
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null)

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', url: '', emoji: '' })
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (item: LinkItem) => {
    setEditTarget(item)
    setForm({ name: item.name, url: item.url, emoji: item.emoji ?? '' })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.url.trim()) return
    const raw = form.url.trim()
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    try {
      const parsed = new URL(url)
      if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
        throw new Error('invalid')
      }
    } catch {
      setFormError('URL 格式不正确，请检查后重试')
      return
    }
    if (links.some((l) => l.url === url && l.id !== editTarget?.id)) {
      setFormError('该链接已存在于此分类中')
      return
    }
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

  const handleConfirm = () => {
    if (!confirmTarget) return
    if (confirmTarget.type === 'section') {
      onDeleteSection?.()
    } else {
      setLinks((prev) => prev.filter((l) => l.id !== confirmTarget.id))
    }
    setConfirmTarget(null)
  }

  return (
    <>
      <GlassCard id={id} className="p-4 md:p-5 group/card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon size={15} className="text-zinc-400" />
            <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-0.5">
            {onDeleteSection && (
              <button
                onClick={() => setConfirmTarget({ type: 'section' })}
                title="删除分类"
                className="rounded-lg p-1.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover/card:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 size={13} />
              </button>
            )}
            <Button variant="ghost" size="sm" onClick={openAdd}>
              <Plus size={13} />
              添加
            </Button>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-300 dark:text-zinc-600">
            暂无链接，点击右上角「添加」
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <AnimatePresence mode="popLayout">
              {links.map((link) => (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="group relative"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors duration-150 group/link"
                  >
                    <SiteIcon url={link.url} emoji={link.emoji} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate flex-1">
                      {link.name}
                    </span>
                    <ExternalLink
                      size={11}
                      className="text-transparent group-hover/link:text-zinc-400 flex-shrink-0 transition-colors"
                    />
                  </a>
                  {/* edit/delete overlay */}
                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                    <button
                      onClick={(e) => { e.preventDefault(); openEdit(link) }}
                      className="rounded-md p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setConfirmTarget({ type: 'link', id: link.id, name: link.name })
                      }}
                      className="rounded-md p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      {/* 添加/编辑链接 */}
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
                placeholder="留空用官方图标"
                maxLength={4}
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
              onChange={(e) => { setForm((f) => ({ ...f, url: e.target.value })); setFormError('') }}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>
          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              className="flex-1 justify-center"
              onClick={() => setModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1 justify-center"
              onClick={handleSave}
              disabled={!form.name.trim() || !form.url.trim()}
            >
              保存
            </Button>
          </div>
        </div>
      </Modal>

      {/* 删除确认 */}
      <Modal
        isOpen={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
        title={confirmTarget?.type === 'section' ? '删除分类' : '删除链接'}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {confirmTarget?.type === 'section'
              ? `确认删除「${title}」分类？其中的所有链接也会一并删除，此操作无法撤销。`
              : `确认删除「${confirmTarget?.type === 'link' ? confirmTarget.name : ''}」？`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 justify-center"
              onClick={() => setConfirmTarget(null)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              className="flex-1 justify-center"
              onClick={handleConfirm}
            >
              <Trash2 size={13} />
              删除
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
