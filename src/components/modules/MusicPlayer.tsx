import { useState } from 'react'
import { Music, Pencil } from 'lucide-react'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import type { MusicConfig } from '../../types'

const DEFAULT_CONFIG: MusicConfig = { platform: 'apple', appleUrl: '', spotifyUrl: '' }

/** 把用户粘贴的普通链接转换为可嵌入的 embed 链接 */
function toEmbedUrl(platform: 'apple' | 'spotify', url: string): string | null {
  try {
    const u = new URL(url)
    if (platform === 'apple') {
      if (!u.hostname.endsWith('music.apple.com')) return null
      return `https://embed.music.apple.com${u.pathname}${u.search}`
    }
    if (u.hostname !== 'open.spotify.com') return null
    if (u.pathname.startsWith('/embed/')) return url
    return `https://open.spotify.com/embed${u.pathname.split('?')[0]}?utm_source=generator`
  } catch {
    return null
  }
}

const PLACEHOLDER: Record<'apple' | 'spotify', string> = {
  apple: '粘贴 Apple Music 歌单/专辑链接，如 https://music.apple.com/cn/playlist/...',
  spotify: '粘贴 Spotify 歌单/专辑链接，如 https://open.spotify.com/playlist/...',
}

export default function MusicPlayer() {
  const [config, setConfig] = useLocalStorage<MusicConfig>('music-config', DEFAULT_CONFIG)
  const [input, setInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  const platform = config.platform ?? 'apple'
  const savedUrl = platform === 'apple' ? config.appleUrl : config.spotifyUrl
  const embedUrl = savedUrl ? toEmbedUrl(platform, savedUrl) : null
  const showInput = editing || !embedUrl

  const switchPlatform = (p: 'apple' | 'spotify') => {
    setConfig((c) => ({ ...DEFAULT_CONFIG, ...c, platform: p }))
    setInput('')
    setError('')
    setEditing(false)
  }

  const handleSave = () => {
    const url = input.trim()
    if (!url) return
    if (!toEmbedUrl(platform, url)) {
      setError(platform === 'apple' ? '链接无效，请粘贴 music.apple.com 的链接' : '链接无效，请粘贴 open.spotify.com 的链接')
      return
    }
    setConfig((c) => ({
      ...DEFAULT_CONFIG,
      ...c,
      [platform === 'apple' ? 'appleUrl' : 'spotifyUrl']: url,
    }))
    setInput('')
    setError('')
    setEditing(false)
  }

  return (
    <GlassCard id="music" className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Music size={15} className="text-zinc-400" />
          <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            音乐
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
            {(['apple', 'spotify'] as const).map((p) => (
              <button
                key={p}
                onClick={() => switchPlatform(p)}
                className={[
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                  platform === p
                    ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
                ].join(' ')}
              >
                {p === 'apple' ? 'Apple Music' : 'Spotify'}
              </button>
            ))}
          </div>
          {embedUrl && !editing && (
            <button
              onClick={() => { setEditing(true); setInput(savedUrl) }}
              title="更换歌单"
              className="rounded-lg p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>

      {showInput ? (
        <div className="flex flex-col gap-2 py-4">
          <input
            type="url"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={PLACEHOLDER[platform]}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            {editing && (
              <Button variant="secondary" size="sm" onClick={() => { setEditing(false); setError('') }}>
                取消
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!input.trim()}>
              保存
            </Button>
          </div>
          {platform === 'spotify' && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Spotify 播放需要你的网络能访问 open.spotify.com
            </p>
          )}
        </div>
      ) : (
        <iframe
          key={embedUrl!}
          src={embedUrl!}
          width="100%"
          height={platform === 'apple' ? 450 : 352}
          frameBorder="0"
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          loading="lazy"
          className="rounded-xl"
          title="music player"
        />
      )}
    </GlassCard>
  )
}
