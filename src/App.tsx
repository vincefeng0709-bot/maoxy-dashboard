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
import TodoModule from './components/modules/TodoModule'
import QuickNotes from './components/modules/QuickNotes'
import GitHubContrib from './components/modules/GitHubContrib'
import WeatherModule from './components/modules/WeatherModule'
import ReadingList from './components/modules/ReadingList'
import SettingsPanel from './components/modules/SettingsPanel'

import { useLocalStorage } from './hooks/useLocalStorage'
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
  },
}

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    'dashboard-settings',
    DEFAULT_SETTINGS
  )
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

  const { enabledModules: em } = settings

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-stone-50 to-amber-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-claude-200/20 dark:bg-claude-900/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-100/20 dark:bg-blue-900/5 blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar
        onSettingsOpen={() => setSettingsOpen(true)}
        activeSection={activeSection}
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
            className="mt-16 pb-4 text-center text-xs text-zinc-300 dark:text-zinc-700"
          >
            Maoxy Dashboard · Built with ❤️ · {new Date().getFullYear()}
          </motion.footer>
        </div>
      </main>

      {/* Settings panel */}
      <SettingsPanel
        settings={settings}
        onUpdate={setSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
