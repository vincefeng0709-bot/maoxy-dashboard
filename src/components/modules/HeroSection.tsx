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
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {greeting}，{userName} 👋
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1">
            {formatDate(now)}
          </p>
          <motion.p
            key={formatTime(now).slice(0, 5)}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            className="font-mono text-5xl font-bold tracking-tighter text-zinc-800 dark:text-zinc-100 mt-3"
          >
            {formatTime(now)}
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
