import { useState } from 'react'
import {
  Plus,
  FolderOpen, Star, Heart, Bookmark, Globe,
  Zap, Coffee, Music, Gamepad2, Briefcase, GraduationCap,
  ShoppingCart, Camera, Palette, Terminal, Database, Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { generateId } from '../../utils'
import type { CustomSection } from '../../types'

export const ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: 'FolderOpen', icon: FolderOpen },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Bookmark', icon: Bookmark },
  { name: 'Globe', icon: Globe },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'Music', icon: Music },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Camera', icon: Camera },
  { name: 'Palette', icon: Palette },
  { name: 'Terminal', icon: Terminal },
  { name: 'Database', icon: Database },
  { name: 'Layers', icon: Layers },
]

export function getIconComponent(name: string): LucideIcon {
  return ICON_OPTIONS.find((o) => o.name === name)?.icon ?? FolderOpen
}

export function useCustomSections() {
  return useLocalStorage<CustomSection[]>('custom-sections', [])
}

export default function CustomSectionAddButton() {
  const [, setSections] = useCustomSections()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', iconName: 'FolderOpen' })

  const addSection = () => {
    if (!form.title.trim()) return
    const id = generateId()
    setSections((prev) => [
      ...prev,
      {
        id,
        title: form.title.trim(),
        iconName: form.iconName,
        storageKey: `custom-links-${id}`,
        createdAt: new Date().toISOString(),
      },
    ])
    setForm({ title: '', iconName: 'FolderOpen' })
    setModalOpen(false)
  }

  return (
    <>
      <GlassCard
        hover
        onClick={() => setModalOpen(true)}
        className="p-5 border-dashed border-zinc-200 dark:border-zinc-700 cursor-pointer group"
      >
        <div className="flex flex-col items-center justify-center gap-2 py-4 text-zinc-400 dark:text-zinc-500 group-hover:text-claude-500 transition-colors">
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={18} />
          </div>
          <span className="text-sm font-medium">添加自定义分类</span>
          <span className="text-xs">创建你自己的链接板块</span>
        </div>
      </GlassCard>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="新建分类板块"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">
              分类名称 *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
              placeholder="例如：娱乐、学习、购物..."
              autoFocus
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 block">
              选择图标
            </label>
            <div className="grid grid-cols-9 gap-1.5">
              {ICON_OPTIONS.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => setForm((f) => ({ ...f, iconName: name }))}
                  className={[
                    'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                    form.iconName === name
                      ? 'bg-claude-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                  ].join(' ')}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={addSection}
              disabled={!form.title.trim()}
            >
              创建
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
