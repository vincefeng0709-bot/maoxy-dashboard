import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  id?: string
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({
  children,
  className = '',
  id,
  hover = false,
  onClick,
}: Props) {
  return (
    <motion.div
      id={id}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      className={[
        'rounded-2xl border',
        'bg-white/70 dark:bg-white/5',
        'border-white/60 dark:border-white/10',
        'backdrop-blur-xl',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
