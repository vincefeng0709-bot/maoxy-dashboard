# Maoxy Dashboard

> 个人 AI 科研工作台 — 极简 · 高效 · 智能

## 功能模块

| 模块 | 功能 |
|------|------|
| 🕐 Hero 区域 | 欢迎语、实时时钟、当前日期 |
| 🔍 搜索中心 | Google / 百度 / GitHub / Scholar / PubMed |
| 🤖 AI 工具中心 | ChatGPT · Claude · Gemini · Grok · DeepSeek 等 |
| 💻 开发中心 | GitHub · Vercel · Cloudflare · Netlify 等 |
| 🔬 科研中心 | PubMed · arXiv · Overleaf · ResearchGate 等 |
| ✍️ 博客中心 | GitHub Pages · Hexo · Cloudflare Pages |
| ✅ 今日待办 | 任务增删改、进度条、localStorage 持久化 |
| 📝 快速笔记 | Markdown 编辑 + 实时预览，自动保存 |
| 📊 GitHub 贡献图 | 输入用户名展示贡献热力图 |
| 🌤️ 天气 | 基于 Open-Meteo 免费 API，无需 key |
| 📚 阅读清单 | 收藏论文 / 博客 / 视频，分类筛选 |
| ⚙️ 设置中心 | 主题切换、模块开关、数据导入导出 |

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

### 方法一：gh-pages 自动部署

1. 在 `vite.config.ts` 中确认 `base` 与你的仓库名一致：
   ```ts
   base: '/maoxy-dashboard/',
   ```

2. 在 `package.json` 的 `deploy` 脚本中已配置好，执行：
   ```bash
   npm run deploy
   ```

### 方法二：GitHub Actions 自动部署

在仓库根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

然后在仓库 Settings → Pages 中选择 `gh-pages` 分支。

## 技术栈

- **React 18** + **TypeScript**
- **Vite 5** — 极速构建
- **TailwindCSS 3** — 原子化样式
- **Framer Motion** — 流畅动效
- **Lucide React** — 精致图标
- **React Markdown** — Markdown 渲染
- **Open-Meteo API** — 免费天气数据（无需 API Key）

## 数据存储

所有数据均存储在浏览器 `localStorage`，无需后端。支持 JSON 导出/导入备份。

## 设计理念

- **毛玻璃 (Glassmorphism)** — `backdrop-blur` + 半透明背景
- **深色/浅色模式** — 跟随系统偏好，支持手动切换
- **自然动效** — Framer Motion 弹簧动画
- **极简主义** — 信息密度适中，无多余装饰

## License

MIT
