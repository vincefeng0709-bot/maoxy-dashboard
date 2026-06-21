export function getGreeting(hour: number): string {
  if (hour >= 0 && hour < 6) return '深夜好'
  if (hour >= 6 && hour < 9) return '早上好'
  if (hour >= 9 && hour < 12) return '上午好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return '晴天'
  if (code <= 3) return '多云'
  if (code <= 49) return '有雾'
  if (code <= 59) return '毛毛雨'
  if (code <= 69) return '雨'
  if (code <= 79) return '雪'
  if (code <= 84) return '阵雨'
  if (code <= 94) return '雷阵雨'
  return '强雷雨'
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 49) return '🌫️'
  if (code <= 59) return '🌦️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '❄️'
  if (code <= 84) return '🌦️'
  if (code <= 94) return '⛈️'
  return '🌩️'
}

export function exportJSON(data: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
