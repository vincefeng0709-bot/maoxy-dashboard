import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Menu, X } from 'lucide-react'
import {
  Bot,
  Code2,
  FlaskConical,
  BookMarked,
} from 'lucide-react'

import Sidebar from './components/layout/Sidebar'
import HeroSection from './components/modules/HeroSection'
import SearchCenter from './components/modules/SearchCenter'
import LinkGrid from './components/modules/LinkGrid'
import CustomSectionAddButton, {
  useCustomSections,
  getIconComponent,
} from './components/modules/CustomSectionManager'
import TodoModule from './components/modules/TodoModule'
import MusicPlayer from './components/modules/MusicPlayer'
import PomodoroTimer from './components/modules/PomodoroTimer'
import CountdownList from './components/modules/CountdownList'
import ArxivFeed from './components/modules/ArxivFeed'
import AuroraBackground from './components/ui/AuroraBackground'
import QuickNotes from './components/modules/QuickNotes'
import GitHubContrib from './components/modules/GitHubContrib'
import WeatherModule from './components/modules/WeatherModule'
import ReadingList from './components/modules/ReadingList'
import SettingsPanel from './components/modules/SettingsPanel'
import { pullFromCloud, pushToCloud } from './hooks/useCloudSync'

import { useLocalStorage, DATA_CHANGED_EVENT } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'

import {
  DEFAULT_AI_TOOLS,
  DEFAULT_DEV_LINKS,
  DEFAULT_RESEARCH_LINKS,
  DEFAULT_BLOG_LINKS,
} from './data/defaults'

import type { Settings } from './types'

const DEFAULT_SETTINGS: Settings = {
  userName: '毛心颖',
  theme: 'system',
  githubUsername: '',
  weatherCity: '',
  wallpaper: 'aurora',
  enabledModules: {
    search: true,
    aiTools: true,
    devCenter: true,
    research: true,
    blog: true,
    todo: true,
    notes: true,
    github: true,
    weather: true,
    reading: true,
    music: true,
    pomodoro: true,
    countdown: true,
    arxiv: true,
  },
}

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    'dashboard-settings',
    DEFAULT_SETTINGS
  )
  const [customSections, setCustomSections] = useCustomSections()
  const [syncState, setSyncState] = useState<{
    status: 'idle' | 'syncing' | 'ok' | 'error'
    error?: string
    lastSync?: Date
  }>({ status: 'idle' })

  // 启动时从云端拉取数据；只有云端和本地不一致时才刷新，天然避免无限刷新
  useEffect(() => {
    pullFromCloud().then((r) => {
      if (r.ok && r.changed) window.location.reload()
    })
  }, [])

  // 数据变化后防抖 2 秒自动推送
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const onChange = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        setSyncState((s) => ({ ...s, status: 'syncing' }))
        const r = await pushToCloud()
        setSyncState((s) => ({
          status: r.ok ? 'ok' : 'error',
          error: r.error,
          lastSync: r.ok ? new Date() : s.lastSync,
        }))
      }, 2000)
    }
    window.addEventListener(DATA_CHANGED_EVENT, onChange)
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, onChange)
      if (timer) clearTimeout(timer)
    }
  }, [])

  // 页面隐藏/关闭时立即推送（fetch keepalive 保证请求发出）
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') pushToCloud()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  }, [])

  const handlePush = async () => {
    setSyncState((s) => ({ ...s, status: 'syncing' }))
    const r = await pushToCloud()
    setSyncState((s) => ({
      status: r.ok ? 'ok' : 'error',
      error: r.error,
      lastSync: r.ok ? new Date() : s.lastSync,
    }))
  }

  const handlePull = async () => {
    setSyncState((s) => ({ ...s, status: 'syncing' }))
    const r = await pullFromCloud()
    if (r.ok && r.changed) {
      window.location.reload()
      return
    }
    setSyncState((s) => ({
      status: r.ok ? 'ok' : 'error',
      error: r.error,
      lastSync: r.ok ? new Date() : s.lastSync,
    }))
  }

  const deleteCustomSection = (id: string, storageKey: string) => {
    setCustomSections((prev) => prev.filter((s) => s.id !== id))
    localStorage.removeItem(storageKey)
  }
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const mainRef = useRef<HTMLElement>(null)

  useTheme(settings.theme)

  // Intersection observer for active nav highlight
  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-section') ?? '')
          }
        })
      },
      { threshold: 0.3 }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // 旧版本存储的设置可能缺少新增的模块开关，用默认值补齐
  const em = { ...DEFAULT_SETTINGS.enabledModules, ...settings.enabledModules }
  const wallpaper = settings.wallpaper ?? 'aurora'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {wallpaper === 'aurora' && <AuroraBackground />}

      {/* Sidebar */}
      <Sidebar
        onSettingsOpen={() => setSettingsOpen(true)}
        activeSection={activeSection}
        syncStatus={syncState.status}
        lastSync={syncState.lastSync}
      />

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-claude-400 to-claude-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <SettingsIcon size={16} />
          </button>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main
        ref={mainRef}
        className="md:pl-16 pt-14 md:pt-0 min-h-screen"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-20">

          {/* Hero */}
          <div data-section="hero">
            <HeroSection userName={settings.userName} />
          </div>

          <div className="flex flex-col gap-4">
            {/* Search */}
            {em.search && (
              <div data-section="search">
                <SearchCenter />
              </div>
            )}

            {/* 2-column grid for card modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {em.aiTools && (
                <div data-section="ai">
                  <LinkGrid
                    id="ai-tools"
                    title="AI 工具中心"
                    icon={Bot}
                    storageKey="ai-tools"
                    defaults={DEFAULT_AI_TOOLS}
                  />
                </div>
              )}

              {em.devCenter && (
                <div data-section="dev">
                  <LinkGrid
                    id="dev-center"
                    title="开发中心"
                    icon={Code2}
                    storageKey="dev-links"
                    defaults={DEFAULT_DEV_LINKS}
                  />
                </div>
              )}

              {em.research && (
                <div data-section="research">
                  <LinkGrid
                    id="research"
                    title="科研中心"
                    icon={FlaskConical}
                    storageKey="research-links"
                    defaults={DEFAULT_RESEARCH_LINKS}
                  />
                </div>
              )}

              {em.blog && (
                <div data-section="blog">
                  <LinkGrid
                    id="blog"
                    title="博客中心"
                    icon={BookMarked}
                    storageKey="blog-links"
                    defaults={DEFAULT_BLOG_LINKS}
                  />
                </div>
              )}
            </div>

            {/* Custom sections */}
            {customSections.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {customSections.map((section) => {
                  const Icon = getIconComponent(section.iconName)
                  return (
                    <div key={section.id} data-section={`custom-${section.id}`}>
                      <LinkGrid
                        id={`custom-${section.id}`}
                        title={section.title}
                        icon={Icon}
                        storageKey={section.storageKey}
                        defaults={[]}
                        onDeleteSection={() => deleteCustomSection(section.id, section.storageKey)}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add custom section button */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CustomSectionAddButton />
            </div>

            {/* Pomodoro + Countdown row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {em.pomodoro && (
                <div data-section="pomodoro">
                  <PomodoroTimer />
                </div>
              )}
              {em.countdown && (
                <div data-section="countdown">
                  <CountdownList />
                </div>
              )}
            </div>

            {/* Music + arXiv row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {em.music && (
                <div data-section="music">
                  <MusicPlayer />
                </div>
              )}
              {em.arxiv && (
                <div data-section="arxiv">
                  <ArxivFeed />
                </div>
              )}
            </div>

            {/* Todo + Weather row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {em.todo && (
                <div data-section="todo">
                  <TodoModule />
                </div>
              )}
              {em.weather && (
                <div data-section="weather">
                  <WeatherModule />
                </div>
              )}
            </div>

            {/* Notes */}
            {em.notes && (
              <div data-section="notes">
                <QuickNotes />
              </div>
            )}

            {/* GitHub + Reading row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {em.github && (
                <div data-section="github">
                  <GitHubContrib />
                </div>
              )}
              {em.reading && (
                <div data-section="reading">
                  <ReadingList />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 pb-4 text-center font-mono text-[11px] tracking-wide text-zinc-300 dark:text-zinc-700"
          >
            MAOXY DASHBOARD · {new Date().getFullYear()}
            {syncState.lastSync && ` · synced ${syncState.lastSync.toLocaleTimeString('zh-CN', { hour12: false })}`}
          </motion.footer>
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel
        settings={settings}
        onUpdate={setSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        syncState={syncState}
        onPush={handlePush}
        onPull={handlePull}
      />
    </div>
  )
}
