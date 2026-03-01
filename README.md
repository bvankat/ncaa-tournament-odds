# NCAA Tournament Odds

NCAA Men's Basketball Tournament selection probabilities for all 365 Division I teams, based on current team-sheet metrics and rankings.

## Overview

This app provides NCAA tournament odds calculated from key metrics (NET, BPI, SOR, KPI, WAB, KenPom, Torvik) by scraping official data sources. Features include:

- **Team Profiles** - Dedicated page for all 365 D1 teams with rankings, schedules, records, and projected seeds
- **Bracket Projection** - Full 68-team field with seeds, auto-bids, and play-in games
- **Bubble Watch** - Live tracker for teams on the tournament bubble with critical upcoming games
- **Resume Comparison** - Side-by-side comparison tool for analyzing team resumes
- **Conference View** - Multi-bid breakdown with full conference standings and odds
- **Odds Tracking** - Daily updates with biggest movers and historical comparisons


## Tech Stack

### Frontend Framework
- **React 18** - Core UI library for component-based architecture
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and dev server with hot module replacement

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework for rapid UI development
  - `@tailwindcss/postcss` - PostCSS plugin for Tailwind v4 integration
  - `postcss` & `autoprefixer` - CSS processing and browser compatibility
- **IBM Plex Sans** - Custom heading font (via Google Fonts)
- **Geist & Geist Mono** - Body and monospace fonts (via Google Fonts)
- **Radix UI** - Unstyled, accessible component primitives
  - `@radix-ui/react-dialog` - Modal/dialog functionality
  - `@radix-ui/react-popover` - Popover menus and tooltips
- **Lucide React** - Icon library for UI elements
- **cmdk** - Command palette component for team search/selection

### Utility Libraries
- **clsx** - Conditional className utility
- **tailwind-merge** - Intelligent Tailwind class merging
- **class-variance-authority** - Type-safe component variants

### Data Layer
- **Python scrapers** - Backend data collection scripts (not committed to repository)
  - `all_teams_scrape.py` - Scrapes team rankings, metrics, and tournament odds
  - `schedule_scraper.py` - Collects full season schedules with opponent logos and slugs from ESPN API
  - `generate_team_mappings.py` - Creates team identity mappings across data sources
  - `backfill_previous_rankings.py` - Retroactively adds historical ranking comparisons
  - `backfill_tournament_odds.py` - Backfills historical tournament odds data

### Custom Components
- **CommandPalette** - Global keyboard-accessible team search (⌘K)
- **Speedometer** - SVG-based gauge displaying tournament odds percentage with animated needle
- **RankingSparkline** - Visual ranking indicator with color coding
- **TournamentDashboard** - Overview cards showing key tournament selection metrics
- **OddsMovers** - Component displaying biggest risers, fallers, and bubble teams
- **BubbleSidebar** - Sidebar showing Last Four In, Last Four Byes, and First Four Out
- **BubbleGames** - Display of important upcoming games for bubble teams
- **Combobox** - Searchable team selector with keyboard navigation

### Views
- **LandingView** - Homepage with scrolling logo grid, team search, random odds gauge, and biggest odds movers
- **TeamView** - Detailed team page with rankings table, schedule, record breakdowns, and projected seed
- **AllTeamsView** - Comprehensive sortable table of all 362 teams with rankings and tournament odds
- **BracketView** - Full 68-team bracket projection with seeds, auto-bids, and play-in games
- **BubbleWatchView** - Dedicated bubble team tracker with odds movers and critical upcoming games
- **ConferenceListView** - Conference-by-conference breakdown with tournament odds and standings
- **ResumeCompareView** - Side-by-side resume comparison tool (up to 8 teams) with all key metrics

## Project Structure

```
ncaa-tournament-odds/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui-style primitives
│   │   ├── Layout.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── Speedometer.jsx
│   │   ├── RankingSparkline.tsx
│   │   ├── TournamentDashboard.tsx
│   │   ├── OddsMovers.tsx
│   │   ├── BubbleSidebar.tsx
│   │   └── BubbleGames.tsx
│   ├── views/            # Page-level components
│   │   ├── LandingView.tsx
│   │   ├── TeamView.tsx
│   │   ├── AllTeamsView.tsx
│   │   ├── BracketView.tsx
│   │   ├── BubbleWatchView.tsx
│   │   ├── ConferenceListView.tsx
│   │   └── ResumeCompareView.tsx
│   ├── lib/              # Utility functions
│   │   ├── utils.ts
│   │   ├── cn.ts
│   │   └── bracketProjection.ts
│   ├── types/            # TypeScript type definitions
│   │   └── team.ts
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles + Tailwind directives
├── public/               # Static assets and JSON data (committed)
│   ├── all_teams_rankings.json    # Team rankings and tournament odds
│   ├── all_teams_schedules.json   # Complete schedules with opponent slugs
│   ├── odds_movers.json            # Biggest risers/fallers in tournament odds
│   ├── team_mappings.json          # Team identity mappings
│   └── rankings/                   # Daily historical snapshots (not committed)
├── scrape/               # Python data collection scripts (not committed)
│   ├── all_teams_scrape.py
│   ├── schedule_scraper.py
│   ├── generate_team_mappings.py
│   ├── backfill_previous_rankings.py
│   ├── backfill_tournament_odds.py
│   └── git-push.sh              # Automation script for daily updates
├── index.html            # Entry HTML with Google Analytics
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## Data Flow

1. **Scraping** - Python scripts collect data from team-sheet sources
   - Rankings scraper: NET, BPI, SOR, KPI, KenPom, Torvik rankings from NCAA team sheets
   - Schedule scraper: Full season schedules with opponent logos, scores, slugs, and rankings
   - Odds calculator: Tournament odds based on weighted metrics and historical data
   - Bubble Watch: Teams closest to 50% tournament odds
   - Risers/Fallers: Shows which teams jumped or dropped in today's rankings
   - Team mappings: Cross-reference between ESPN IDs, slugs, display names, and data source names

2. **Storage** - Data saved to JSON files in `/public`
   - `all_teams_rankings.json` - 362 teams with all ranking metrics and tournament odds
   - `all_teams_schedules.json` - Complete schedule data with pre-computed opponent slugs
   - `odds_movers.json` - Biggest risers, fallers, and bubble teams based on odds changes
   - `team_mappings.json` - Team identity mapping

3. **Frontend** - React app fetches JSON on load
   - `App.tsx` loads all data files and manages global state
   - Client-side routing via URL slugs (e.g., `/nebraska-cornhuskers`, `/all-teams`)
   - Tournament odds pre-calculated in at scraper runtime
   - Google Analytics tracks page views and navigation

4. **Display** - Component hierarchy renders views
   - `LandingView` - Homepage with team search, odds movers, and scrolling logos
   - `TeamView` - Detailed team page with rankings, schedule, records, and projected seed
   - `AllTeamsView` - Sortable table of all 362 teams
   - `BracketView` - Full 68-team bracket projection based on current data
   - `BubbleWatchView` - Bubble team tracker with odds movers and critical games
   - `ConferenceListView` - Conference standings with tournament odds
   - `ResumeCompareView` - Side-by-side team resume comparison

## Key Features

### Tournament Odds Calculation
Tournament odds are calculated using a weighted algorithm:
- NET ranking
- BPI, SOR, KPI, WAB, KenPom and Torvik rankings
- Quadrant records (Q1-Q4)
- Overall record and strength of schedule
- Day-over-day odds changes tracked via `previousTournamentOdds`

### Bracket Projection
- Full 68-team field projection based on composite rankings
- Automatic bid tracking for conference tournament winners
- Play-in game assignments (First Four)
- Seed line calculations (1-16) with proper distribution
- Last Four In, Last Four Byes, and First Four Out indicators
- Bubble team rankings with composite scores

### Odds Movers
- **Biggest Risers** - Teams with largest positive odds changes
- **Biggest Fallers** - Teams with largest negative odds changes
- **Bubble Teams** - Teams closest to 50% tournament odds threshold
- Real-time tracking via `odds_movers.json`
- Integrated into LandingView and BubbleWatchView

### Bubble Watch
- Dedicated page for tracking bubble teams
- Live tournament dashboard with key metrics
- Critical upcoming games for bubble teams with opponent odds
- Sidebar showing Last Four In, Last Four Byes, First Four Out
- Integration with schedule data to highlight important games

### Resume Comparison
- Side-by-side comparison of up to 8 teams
- All key metrics in one view (NET, BPI, SOR, KPI, WAB, KenPom, Torvik)
- Quadrant records comparison
- Conference standings comparison
- Preset groups (e.g., Last Four Byes, First Four Out)

### Conference View
- Conference-by-conference breakdown of all D1 teams
- Conference standings with tournament odds
- Projected seeds and bids per conference
- Sortable and filterable by conference

### Team Search
- Global command palette (⌘K) with instant search across 362 teams
- Header and footer team selectors
- Keyboard navigation support
- Logo previews in dropdown
- Accessible and fast

### All Teams Table
- Sortable by tournament odds, seed, or any ranking metric
- Responsive design with horizontal scroll
- Direct links to team pages
- Color-coded tournament odds indicators


## Development

### Local Setup
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Update Data
**Note:** Scraper scripts are not included in the repository. Only the output JSON files are committed.

```bash
# If you have access to the scraper scripts:
python3 scrape/all_teams_scrape.py
python3 scrape/schedule_scraper.py

# Or use the automated script:
sh scrape/git-push.sh
```

## Analytics

Google Analytics tracks:
- Page views per team
- Team selection events
- User navigation patterns
- Single-page application (SPA) route changes
- Navigation between different views

## SEO & Prerendering

The app uses prerendering to optimize SEO and initial load times:
- **@prerenderer/rollup-plugin** - Vite plugin for static prerendering
- **Puppeteer** - Headless browser for rendering routes
- **Dynamic route generation** - Prerenders all team pages, views, and key routes
- **Meta tag injection** - Custom title, description, and Open Graph tags per route
- **Environment-specific config** - Uses @sparticuz/chromium on Vercel, local Chrome in development
- **Sitemap generation** - Automated sitemap.xml creation for search engines
- Routes prerendered:
  - Home page (`/`)
  - All 362 team pages (`/team-slug`)
  - Latest rankings (`/latest-rankings`)
  - Conferences (`/conferences`)
  - Bracket view (`/bracket`)
  - Bubble watch (`/bubble-watch`)
  - Resume compare (`/compare-resumes`)