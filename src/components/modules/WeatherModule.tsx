import { useState, useEffect, useCallback } from 'react'
import { Cloud, RefreshCw, Droplets, Wind, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import Button from '../ui/Button'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getWeatherDescription, getWeatherEmoji } from '../../utils'
import type { WeatherData } from '../../types'

export default function WeatherModule() {
  const [city, setCity] = useLocalStorage('weather-city', '')
  const [input, setInput] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(!city)

  const fetchWeather = useCallback(async (cityName: string) => {
    if (!cityName) return
    setLoading(true)
    setError('')
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=zh&format=json`
      )
      const geoData = await geoRes.json() as {
        results?: { latitude: number; longitude: number; name: string }[]
      }
      if (!geoData.results?.length) {
        setError('未找到该城市，请检查城市名称')
        setLoading(false)
        return
      }
      const { latitude, longitude, name } = geoData.results[0]
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      )
      const wData = await wRes.json() as {
        current: {
          temperature_2m: number
          relative_humidity_2m: number
          weather_code: number
          wind_speed_10m: number
        }
      }
      setWeather({
        temperature: Math.round(wData.current.temperature_2m),
        humidity: wData.current.relative_humidity_2m,
        weatherCode: wData.current.weather_code,
        windSpeed: Math.round(wData.current.wind_speed_10m),
        city: name,
      })
    } catch {
      setError('获取天气失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (city) fetchWeather(city)
  }, [city, fetchWeather])

  const apply = () => {
    const val = input.trim()
    if (!val) return
    setCity(val)
    setInput('')
    setEditing(false)
    fetchWeather(val)
  }

  return (
    <GlassCard id="weather" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-zinc-400" />
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            天气
          </h2>
        </div>
        <div className="flex gap-1">
          {city && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchWeather(city)}
              disabled={loading}
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? '取消' : '更改城市'}
          </Button>
        </div>
      </div>

      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="输入城市名称（中文或英文）..."
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-claude-400/40 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400"
          />
          <Button variant="primary" size="sm" onClick={apply}>
            确认
          </Button>
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw size={20} className="text-zinc-400 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500 dark:text-red-400 text-center py-4">
          {error}
        </p>
      )}

      {weather && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-end gap-3">
            <span className="text-5xl">{getWeatherEmoji(weather.weatherCode)}</span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                  {weather.temperature}
                </span>
                <span className="text-xl text-zinc-500 dark:text-zinc-400">°C</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {getWeatherDescription(weather.weatherCode)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            <MapPin size={11} />
            <span>{weather.city}</span>
          </div>
          <div className="flex gap-4 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
              <Droplets size={13} className="text-blue-400" />
              <span>湿度 {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-300">
              <Wind size={13} className="text-zinc-400" />
              <span>风速 {weather.windSpeed} km/h</span>
            </div>
          </div>
        </motion.div>
      )}

      {!weather && !loading && !error && !city && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Cloud size={32} className="text-zinc-200 dark:text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            输入城市名称以显示天气
          </p>
        </div>
      )}
    </GlassCard>
  )
}
