import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
