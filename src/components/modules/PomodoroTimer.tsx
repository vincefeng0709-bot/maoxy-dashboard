import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const WORK_PRESETS = [25, 45, 60]
const BREAK_MINUTES = 5

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 660
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // ignore
  }
}

function notify(message: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Maoxy Dashboard', { body: message })
  }
}

export default function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25)
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [rounds, setRounds] = useState(0)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const total = (mode === 'work' ? workMinutes : BREAK_MINUTES) * 60
  const progress = 1 - secondsLeft / total

  const switchMode = useCallback((next: 'work' | 'break', work: number) => {
    setMode(next)
    setSecondsLeft((next === 'work' ? work : BREAK_MINUTES) * 60)
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1
        // 一轮结束
        beep()
        if (modeRef.current === 'work') {
          notify('专注结束，休息 5 分钟 🍵')
          setRounds((r) => r + 1)
          setMode('break')
          return BREAK_MINUTES * 60
        }
        notify('休息结束，开始新一轮专注 🔥')
        setMode('work')
        return workMinutes * 60
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, workMinutes])

  // 运行时把剩余时间显示在浏览器标签页标题上
  useEffect(() => {
    if (!running) {
      document.title = 'Maoxy Dashboard'
      return
    }
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
    const s = String(secondsLeft % 60).padStart(2, '0')
    document.title = `${m}:${s} · ${mode === 'work' ? '专注中' : '休息中'}`
    return () => {
      document.title = 'Maoxy Dashboard'
    }
  }, [running, secondsLeft, mode])

  const handleStart = () => {
    if (!running && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setRunning((v) => !v)
  }

  const handleReset = () => {
    setRunning(false)
    switchMode('work', workMinutes)
  }

  const handleSkip = () => {
    switchMode(mode === 'work' ? 'break' : 'work', workMinutes)
  }

  const selectPreset = (m: number) => {
    setWorkMinutes(m)
    setRunning(false)
    setMode('work')
    setSecondsLeft(m * 60)
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const R = 54
  const CIRC = 2 * Math.PI * R

  return (
    <GlassCard id="pomodoro" className="p-4 md:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer size={15} className="text-zinc-400" />
          <h2 className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            番茄钟
          </h2>
        </div>
        <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
          {WORK_PRESETS.map((m) => (
            <button
              key={m}
              onClick={() => selectPreset(m)}
              className={[
                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                workMinutes === m
                  ? 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300',
              ].join(' ')}
            >
              {m}′
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative">
          <svg viewBox="0 0 120 120" className="w-44 h-44 -rotate-90">
            <circle
              cx="60" cy="60" r={R} fill="none" strokeWidth="5"
              className="stroke-zinc-100 dark:stroke-zinc-800"
            />
            <circle
              cx="60" cy="60" r={R} fill="none" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              className={mode === 'work' ? 'stroke-claude-500' : 'stroke-emerald-500'}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
              {mm}:{ss}
            </span>
            <span className={`text-xs font-medium mt-1 ${mode === 'work' ? 'text-claude-500' : 'text-emerald-500'}`}>
              {mode === 'work' ? '专注' : '休息'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleReset}
            title="重置"
            className="rounded-xl p-2.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleStart}
            title={running ? '暂停' : '开始'}
            className="rounded-2xl px-6 py-2.5 bg-claude-500 hover:bg-claude-600 text-white shadow-sm shadow-claude-500/20 transition-colors"
          >
            {running ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button
            onClick={handleSkip}
            title="跳过当前阶段"
            className="rounded-xl p-2.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {rounds > 0 && (
          <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 mt-3">
            今日完成 {rounds} 轮专注 🍅
          </p>
        )}
      </div>
    </GlassCard>
  )
}
