/**
 * macOS 风格的流光渐变背景：几团大而柔和的色彩缓慢漂移，
 * 低饱和低透明度，保证卡片内容的可读性。
 */
export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="aurora-blob w-[45rem] h-[45rem] -top-48 -left-32 bg-claude-300/30 dark:bg-claude-700/15" style={{ animationDelay: '0s' }} />
      <div className="aurora-blob w-[40rem] h-[40rem] top-1/4 -right-40 bg-sky-200/40 dark:bg-indigo-800/20" style={{ animationDelay: '-8s' }} />
      <div className="aurora-blob w-[38rem] h-[38rem] bottom-0 left-1/4 bg-violet-200/30 dark:bg-violet-800/15" style={{ animationDelay: '-16s' }} />
    </div>
  )
}
