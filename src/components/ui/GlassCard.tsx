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
      whileHover={hover ? { y: -2 } : undefined}
      className={[
        'rounded-2xl border',
        'bg-white dark:bg-zinc-900',
        'border-zinc-200/80 dark:border-zinc-800',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
        'hover:border-zinc-300/80 dark:hover:border-zinc-700',
        'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]',
        'transition-[border-color,box-shadow] duration-150',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
