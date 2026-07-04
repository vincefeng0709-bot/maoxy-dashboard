import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  User,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import Button from '../ui/Button'
import { exportJSON } from '../../utils'
import type { Settings as SettingsType, ThemeMode } from '../../types'

interface SyncState {
  status: 'idle' | 'syncing' | 'ok' | 'error'
  error?: string
  lastSync?: Date
}

interface Props {
  settings: SettingsType
  onUpdate: (s: SettingsType) => void
  isOpen: boolean
  onClose: () => void
  syncState?: SyncState
  onPush?: () => void
  onPull?: () => void
}

const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: '跟随系统', icon: Monitor },
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
]

const moduleLabels: Record<string, string> = {
  search: '搜索中心',
  aiTools: 'AI 工具中心',
  devCenter: '开发中心',
  research: '科研中心',
  blog: '博客中心',
  pomodoro: '番茄钟',
  countdown: '倒计时',
  music: '音乐播放器',
  arxiv: 'arXiv 论文',
  todo: '今日待办',
  notes: '快速笔记',
  github: 'GitHub 贡献图',
  weather: '天气',
  reading: '阅读清单',
}

export default function SettingsPanel({
  settings, onUpdate, isOpen, onClose,
  syncState = { status: 'idle' }, onPush, onPull,
}: Props) {
  const [userName, setUserName] = useState(settings.userName)

  const updateModule = (key: string, value: boolean) => {
    onUpdate({
      ...settings,
      enabledModules: { ...settings.enabledModules, [key]: value },
    })
  }

  const handleExport = () => {
    const data: Record<string, unknown> = { settings }
    const keys = [
      'todos', 'quick-note', 'reading-list',
      'ai-tools', 'dev-links', 'research-links', 'blog-links',
      'github-username', 'weather-city', 'custom-sections',
    ]
    // 自定义分类的链接数据
    try {
      const sections = JSON.parse(localStorage.getItem('custom-sections') ?? '[]') as { storageKey?: string }[]
      sections.forEach((s) => { if (s.storageKey) keys.push(s.storageKey) })
    } catch { /* ignore */ }
    keys.forEach((k) => {
      try {
        const v = localStorage.getItem(k)
        if (v) data[k] = JSON.parse(v)
      } catch { /* ignore */ }
    })
    exportJSON(data, `maoxy-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as Record<string, unknown>
          if (data.settings) onUpdate(data.settings as SettingsType)
          Object.entries(data).forEach(([k, v]) => {
            if (k !== 'settings') localStorage.setItem(k, JSON.stringify(v))
          })
          // 标记本地为最新，防止刷新后被云端旧数据覆盖
          localStorage.setItem('local-updated-at', String(Date.now()))
          window.location.reload()
        } catch {
          alert('导入失败：JSON 格式错误')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="ml-auto relative z-10 w-80 h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border-l border-zinc-100 dark:border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">设置</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
              {/* User Name */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <User size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    用户名称
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="你的名字"
                    className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onUpdate({ ...settings, userName })}
                  >
                    保存
                  </Button>
                </div>
              </section>

              {/* Theme */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sun size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    主题
                  </h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {themeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => onUpdate({ ...settings, theme: value })}
                      className={[
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                        settings.theme === value
                          ? 'bg-claude-50 dark:bg-claude-900/20 text-claude-600 dark:text-claude-400 border border-claude-200 dark:border-claude-800/50'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-transparent',
                      ].join(' ')}
                    >
                      <Icon size={15} />
                      {label}
                      {settings.theme === value && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-claude-500" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Wallpaper */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    背景
                  </h3>
                </div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'aurora', label: '流光渐变' },
                    { value: 'plain', label: '纯色' },
                  ] as const).map(({ value, label }) => {
                    const active = (settings.wallpaper ?? 'aurora') === value
                    return (
                      <button
                        key={value}
                        onClick={() => onUpdate({ ...settings, wallpaper: value })}
                        className={[
                          'flex-1 rounded-xl px-3 py-2.5 text-sm transition-all border',
                          active
                            ? 'bg-claude-50 dark:bg-claude-900/20 text-claude-600 dark:text-claude-400 border-claude-200 dark:border-claude-800/50'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-transparent',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Modules toggle */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <ToggleRight size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    模块开关
                  </h3>
                </div>
                <div className="flex flex-col gap-1">
                  {Object.keys(moduleLabels).map((key) => {
                    // 旧数据里可能没有新增模块的开关，缺省视为开启
                    const enabled = (settings.enabledModules as Record<string, boolean | undefined>)[key] ?? true
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 px-1 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <span className="text-sm text-zinc-700 dark:text-zinc-200">
                          {moduleLabels[key]}
                        </span>
                        <button
                          onClick={() => updateModule(key, !enabled)}
                          className="transition-colors"
                        >
                          {enabled ? (
                            <ToggleRight size={22} className="text-claude-500" />
                          ) : (
                            <ToggleLeft size={22} className="text-zinc-300 dark:text-zinc-600" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Cloud Sync */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    云端同步
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={onPush}
                    disabled={syncState.status === 'syncing'}
                    className="flex-1 justify-center"
                  >
                    <Upload size={13} />
                    {syncState.status === 'syncing' ? '同步中...' : '推送到云端'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onPull}
                    disabled={syncState.status === 'syncing'}
                    className="flex-1 justify-center"
                  >
                    <Download size={13} />
                    从云端拉取
                  </Button>
                </div>
                {syncState.status === 'error' && (
                  <div className="mt-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      同步失败：{syncState.error ?? '未知错误'}
                    </p>
                    <button
                      onClick={onPush}
                      className="text-xs font-medium text-red-600 dark:text-red-400 underline underline-offset-2 mt-1"
                    >
                      重试
                    </button>
                  </div>
                )}
                {syncState.status === 'ok' && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-2">
                    ✓ 已同步{syncState.lastSync && ` · ${syncState.lastSync.toLocaleTimeString('zh-CN', { hour12: false })}`}
                  </p>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                  修改后自动推送 · 打开页面自动拉取
                </p>
              </section>

              {/* Backup */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Download size={13} className="text-zinc-400" />
                  <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    数据备份
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="secondary" onClick={handleExport} className="w-full justify-center">
                    <Download size={14} />
                    导出 JSON
                  </Button>
                  <Button variant="secondary" onClick={handleImport} className="w-full justify-center">
                    <Upload size={14} />
                    导入 JSON
                  </Button>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                  导出包含所有待办、笔记、链接等数据
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
