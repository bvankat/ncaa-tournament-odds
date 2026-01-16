import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import prerender from '@prerenderer/rollup-plugin'
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  const routes = ['/', '/all-teams']
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

// Generate SEO meta tags for a route
function getSeoMetaTags(route) {
  const baseUrl = 'https://www.tourneyodds.info'
  const data = loadTeamData()
  
  // Default/homepage meta
  if (route === '/') {
    return {
      title: 'NCAA Tournament Odds Machine',
      description: "On the bubble? Track NCAA men's basketball tournament selection odds and current team-sheet metrics for all 360+ Division I teams. Updated daily.",
      url: baseUrl
    }
  }
  
  // All teams page
  if (route === '/all-teams') {
    return {
      title: 'All Teams — NCAA Tournament Odds Machine',
      description: 'View tournament odds and team-sheet metrics for all 360+ Division I basketball teams.',
      url: `${baseUrl}/all-teams`
    }
  }
  
  // Team page
  const slug = route.replace('/', '')
  const team = data.teams?.find(t => t.slug === slug)
  
  if (team) {
    const odds = team.tournamentOdds?.toFixed(1) || '0'
    const net = team.net || '—'
    const kenpom = team.kenpom || '—'
    const bpi = team.bpi || '—'
    const torvik = team.torvik || '—'
    const sor = team.sor || '—'
    const kpi = team.kpi || '—'
    const wab = team.wab || '—'
    return {
      title: `${team.displayName} — NCAA Tournament Odds`,
      description: `Current odds for ${team.displayName}: ${odds}% chance to make the NCAA Tournament as an at-large team. NET ${net} | Kenpom ${kenpom} | BPI ${bpi} | Torvik ${torvik} | SOR ${sor} | KPI ${kpi} | WAB ${wab}`,
      url: `${baseUrl}/${team.slug}`
    }
  }
  
  // Fallback
  return {
    title: 'NCAA Tournament Odds Machine',
    description: "Track NCAA men's basketball tournament selection odds for all 360+ Division I teams.",
    url: baseUrl + route
  }
}

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: getRoutes(),
      renderer: new PuppeteerRenderer({
        renderAfterTime: 2000,
        maxConcurrentRoutes: 4,
        headless: true,
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
})