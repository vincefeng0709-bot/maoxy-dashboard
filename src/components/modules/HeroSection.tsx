import { motion } from 'framer-motion'
import { useTime } from '../../hooks/useTime'
import { getGreeting, formatDate, formatTime } from '../../utils'

interface Props {
  userName: string
}

export default function HeroSection({ userName }: Props) {
  const now = useTime()
  const greeting = getGreeting(now.getHours())

  return (
    <section id="hero" className="px-6 pt-10 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex flex-col">
          <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-claude-600 dark:text-claude-400">
            <span className="w-1.5 h-1.5 rounded-full bg-claude-500" />
            {formatDate(now)}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mt-3">
            {greeting}，{userName} 👋
          </h1>
          <motion.p
            key={formatTime(now).slice(0, 5)}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="font-mono text-5xl md:text-6xl font-bold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50 mt-4"
          >
            {formatTime(now)}
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
