import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Site config (config/site-config.json): which sections/sources are live
const siteConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'config/site-config.json'), 'utf8'))
const PRESEASON = siteConfig.phase === 'preseason'
const sectionOn = (id) => siteConfig.sections?.[id] === 'on'

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

// Generate SEO meta tags for a route
function getSeoMetaTags(route) {
  const baseUrl = 'https://www.tourneyodds.info'
  const data = loadTeamData()
  
  // Default/homepage meta
  if (route === '/') {
    return {
      title: 'NCAA Basketball Tournament Odds Machine',
      description: PRESEASON
        ? `${siteConfig.season} preseason ratings for all 360+ Division I teams. Bubble chances and projected seeds arrive as the season's ratings are released.`
        : "Latest rankings, bubble chances and projected seeds for all 360+ Division I teams. Updated daily.",
      url: baseUrl
    }
  }
  
  // Latest rankings page
  if (route === '/latest-rankings') {
    return {
      title: 'Latest Rankings — NCAA Basketball Tournament Odds Machine',
      description: PRESEASON
        ? `${siteConfig.season} preseason ratings for all 360+ Division I basketball teams; tournament odds and team-sheet metrics are added as they are released.`
        : 'View tournament odds and team-sheet metrics for all 360+ Division I basketball teams.',
      url: `${baseUrl}/latest-rankings`
    }
  }
  
  // Bracket page
  if (route === '/bracket') {
    return {
      title: 'Projected Bracket — NCAA Basketball Tournament Odds Machine',
      description: sectionOn('bracket.table')
        ? 'Tournament seed projections based on current team-sheet metrics'
        : 'Projected NCAA Tournament bracket — coming soon as team-sheet metrics are released this season.',
      url: `${baseUrl}/bracket`
    }
  }
  
  // Bubble watch page
  if (route === '/bubble-watch') {
    return {
      title: 'Bubble Watch — NCAA Basketball Tournament Odds Machine',
      description: sectionOn('bubble.dashboard')
        ? 'Updated projections and critical upcoming games for teams chasing at-large bids'
        : 'Bubble Watch — coming soon as team-sheet metrics are released this season.',
      url: `${baseUrl}/bubble-watch`
    }
  }
  
  // Conferences page
  if (route === '/conferences') {
    return {
      title: 'Conference Breakdown — NCAA Basketball Tournament Odds Machine',
      description: sectionOn('conf.standings')
        ? 'Updated tournament projections and current standings for all 32 Division I conferences.'
        : `Every Division I conference for ${siteConfig.season}. Standings and bid projections are coming soon.`,
      url: `${baseUrl}/conferences`
    }
  }
  
  // Compare resumes page
  if (route === '/compare-resumes') {
    return {
      title: 'Compare Resumes — NCAA Basketball Tournament Odds Machine',
      description: 'Side-by-side team resumes. Compare rankings, metrics, quadrant records, and tournament odds for up to 8 teams.',
      url: `${baseUrl}/compare-resumes`
    }
  }
  
  // Team page
  const slug = route.replace('/', '')
  const team = data.teams?.find(t => t.slug === slug)
  
  if (team) {
    const hasOdds = team.tournamentOdds !== null && team.tournamentOdds !== undefined && sectionOn('team.odds')
    const odds = hasOdds ? team.tournamentOdds.toFixed(1) : null
    const net = team.net || '—'
    const kenpom = team.kenpomRank || '—'
    const bpi = team.bpi || '—'
    const torvik = team.torvikRank || '—'
    const sor = team.sor || '—'
    const kpi = team.kpi || '—'
    const wab = team.wab || '—'
    return {
      title: `${team.displayName} — NCAA Basketball Tournament Odds`,
      description: hasOdds
        ? `Current odds for ${team.displayName}: ${odds}% chance to make the NCAA Tournament as an at-large team. NET ${net} | Kenpom ${kenpom} | BPI ${bpi} | Torvik ${torvik} | SOR ${sor} | KPI ${kpi} | WAB ${wab}`
        : `${team.displayName} ${siteConfig.season} preseason ratings: Kenpom ${kenpom} | Torvik ${torvik}. NCAA Tournament odds and the remaining team-sheet metrics are coming soon.`,
      url: `${baseUrl}/${team.slug}`
    }
  }
  
  // Fallback
  return {
    title: 'NCAA Basketball Tournament Odds Machine',
    description: PRESEASON
      ? `${siteConfig.season} preseason ratings for all 360+ Division I teams.`
      : "Latest rankings, bubble chances and projected seeds for all 360+ Division I teams. Updated daily.",
    url: baseUrl + route
  }
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