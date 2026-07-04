export interface LinkItem {
  id: string
  name: string
  url: string
  emoji?: string
  color?: string
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface ReadingItem {
  id: string
  title: string
  url: string
  type: 'paper' | 'blog' | 'video'
  createdAt: string
}

export type ThemeMode = 'system' | 'light' | 'dark'

export type WallpaperMode = 'plain' | 'aurora'

export interface Settings {
  userName: string
  theme: ThemeMode
  githubUsername: string
  weatherCity: string
  wallpaper?: WallpaperMode
  enabledModules: {
    search: boolean
    aiTools: boolean
    devCenter: boolean
    research: boolean
    blog: boolean
    todo: boolean
    notes: boolean
    github: boolean
    weather: boolean
    reading: boolean
    music?: boolean
    pomodoro?: boolean
    countdown?: boolean
    arxiv?: boolean
  }
}

export interface CountdownItem {
  id: string
  title: string
  date: string
  createdAt: string
}

export interface MusicConfig {
  platform: 'apple' | 'spotify'
  appleUrl: string
  spotifyUrl: string
}

export interface ArxivConfig {
  query: string
}

export type SearchEngine = 'google' | 'baidu' | 'github' | 'scholar' | 'pubmed'

export interface SearchEngineConfig {
  id: SearchEngine
  name: string
  url: string
  placeholder: string
  color: string
}

export interface CustomSection {
  id: string
  title: string
  iconName: string
  storageKey: string
  createdAt: string
}

export interface WeatherData {
  temperature: number
  humidity: number
  weatherCode: number
  windSpeed: number
  city: string
}
