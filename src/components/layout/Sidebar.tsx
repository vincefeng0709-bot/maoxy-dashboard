import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  Bot,
  Code2,
  FlaskConical,
  BookMarked,
  CheckSquare,
  FileText,
  Github,
  Cloud,
  BookOpen,
  Settings,
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: typeof LayoutDashboard
  anchor: string
}

const navItems: NavItem[] = [
  { id: 'hero', label: '主页', icon: LayoutDashboard, anchor: '#hero' },
  { id: 'search', label: '搜索', icon: Search, anchor: '#search' },
  { id: 'ai', label: 'AI 工具', icon: Bot, anchor: '#ai-tools' },
  { id: 'dev', label: '开发', icon: Code2, anchor: '#dev-center' },
  { id: 'research', label: '科研', icon: FlaskConical, anchor: '#research' },
  { id: 'blog', label: '博客', icon: BookMarked, anchor: '#blog' },
  { id: 'todo', label: '待办', icon: CheckSquare, anchor: '#todo' },
  { id: 'notes', label: '笔记', icon: FileText, anchor: '#notes' },
  { id: 'github', label: 'GitHub', icon: Github, anchor: '#github' },
  { id: 'weather', label: '天气', icon: Cloud, anchor: '#weather' },
  { id: 'reading', label: '阅读', icon: BookOpen, anchor: '#reading' },
]

interface Props {
  onSettingsOpen: () => void
  activeSection?: string
}

export default function Sidebar({ onSettingsOpen, activeSection }: Props) {
  const scrollTo = (anchor: string) => {
    const el = document.querySelector(anchor)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden md:flex flex-col w-16 fixed left-0 top-0 h-full z-40
        bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl
        border-r border-zinc-100 dark:border-zinc-800/60"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-14 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-claude-400 to-claude-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">M</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.anchor)}
              title={item.label}
              className={[
                'group relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-claude-50 dark:bg-claude-900/30 text-claude-600 dark:text-claude-400'
                  : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200',
              ].join(' ')}
            >
              <Icon size={16} />
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-claude-500"
                />
              )}
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="flex items-center justify-center h-14 border-t border-zinc-100 dark:border-zinc-800/60">
        <button
          onClick={onSettingsOpen}
          title="设置"
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
        >
          <Settings size={16} />
          <span className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            设置
          </span>
        </button>
      </div>
    </motion.aside>
  )
}
