import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'
import { getPageMeta } from './src/lib/seo.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Site config (config/site-config.json): which sections/sources are live
const siteConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config/site-config.json'), 'utf8'))

// Detect if running on Vercel
const isVercel = process.env.VERCEL === '1'

// Get Chromium config based on environment
async function getChromiumConfig() {
  if (isVercel) {
    // On Vercel, use @sparticuz/chromium
    const chromium = await import('@sparticuz/chromium')
    return {
      headless: chromium.default.headless,
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
    }
  }
  // Locally, use default Puppeteer settings (will find local Chrome)
  return {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
}

// Load team data once at config time
let teamData = null
function loadTeamData() {
  if (teamData) return teamData
  try {
    const dataPath = path.join(__dirname, 'public', 'all_teams_rankings.json')
    teamData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    return teamData
  } catch (e) {
    console.warn('Could not load team data:', e.message)
    return { teams: [] }
  }
}

// Generate routes from team data
function getRoutes() {
  const routes = ['/', '/latest-rankings', '/bracket', '/bubble-watch', '/conferences', '/compare-resumes']
  const data = loadTeamData()
  
  if (data.teams) {
    for (const team of data.teams) {
      if (team.slug) {
        routes.push(`/${team.slug}`)
      }
    }
  }
  console.log(`Prerender: Found ${routes.length} routes to prerender`)
  
  return routes
}

// Determine OG image URL per route
function getOgImage(route) {
  const baseUrl = 'https://www.tourneyodds.info'
  if (route === '/bracket') return `${baseUrl}/api/og-bracket`
  if (route === '/bubble-watch') return `${baseUrl}/api/og-bubble`
  return `${baseUrl}/open-graph-image.png`
}

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function getSeoMetaTags(route) {
  const meta = getPageMeta(route, loadTeamData().teams || [], siteConfig)
  return { title: escapeHtml(meta.title), description: escapeHtml(meta.description), url: escapeHtml(meta.url) }
}

export default defineConfig(async () => {
  const chromiumConfig = await getChromiumConfig()
  
  return {
  plugins: [
    react(),
    prerender({
      routes: getRoutes(),
      renderer: new PuppeteerRenderer({
        renderAfterTime: 2000,
        maxConcurrentRoutes: 4,
        ...chromiumConfig,
      }),
      postProcess(renderedRoute) {
        const seo = getSeoMetaTags(renderedRoute.route)
        let html = renderedRoute.html
        
        // Replace title
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${seo.title}</title>`
        )
        
        // Replace meta description
        html = html.replace(
          /<meta name="description" content="[^"]*">/,
          `<meta name="description" content="${seo.description}">`
        )
        
        // Replace OG tags
        html = html.replace(
          /<meta property="og:url" content="[^"]*">/,
          `<meta property="og:url" content="${seo.url}">`
        )
        html = html.replace(
          /<meta property="og:title" content="[^"]*">/,
          `<meta property="og:title" content="${seo.title}">`
        )
        html = html.replace(
          /<meta property="og:description" content="[^"]*">/,
          `<meta property="og:description" content="${seo.description}">`
        )
        
        // Replace Twitter tags
        html = html.replace(
          /<meta property="twitter:url" content="[^"]*">/,
          `<meta property="twitter:url" content="${seo.url}">`
        )
        html = html.replace(
          /<meta name="twitter:title" content="[^"]*">/,
          `<meta name="twitter:title" content="${seo.title}">`
        )
        html = html.replace(
          /<meta name="twitter:description" content="[^"]*">/,
          `<meta name="twitter:description" content="${seo.description}">`
        )
        
        // Replace OG image (dynamic for bracket + bubble-watch, static otherwise)
        const ogImage = getOgImage(renderedRoute.route)
        html = html.replace(
          /<meta property="og:image" content="[^"]*">/,
          `<meta property="og:image" content="${ogImage}">`
        )
        html = html.replace(
          /<meta name="twitter:image" content="[^"]*">/,
          `<meta name="twitter:image" content="${ogImage}">`
        )

        // Add canonical URL
        html = html.replace(
          '</head>',
          `  <link rel="canonical" href="${seo.url}" />\n  </head>`
        )
        
        renderedRoute.html = html
        return renderedRoute
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}})