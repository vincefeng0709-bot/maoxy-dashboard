import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-claude-500 hover:bg-claude-600 text-white shadow-sm shadow-claude-500/20',
  secondary:
    'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200',
  ghost:
    'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
  danger:
    'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center gap-1.5 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
