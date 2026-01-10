# NCAA Tournament Odds

A web application that displays NCAA Men's Basketball Tournament selection probabilities for all 362 Division I teams, based on current team-sheet metrics and rankings.

## Overview

This app provides NCAA tournament odds calculated from key metrics (NET, BPI, SOR, KPI, KenPom, Torvik) by scraping official data sources. Users can view detailed team profiles including rankings, schedule information, and record breakdowns.

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
- **Speedometer** - SVG-based gauge displaying tournament odds percentage
- **RankingSparkline** - Visual ranking indicator with color coding
- **Combobox** - Searchable team selector with keyboard navigation
- **Layout** - App shell with navigation and routing

### Views
- **LandingView** - Homepage with scrolling logo grid, team search, random odds gauge, and biggest odds movers
- **TeamView** - Detailed team page with rankings table, schedule, and record breakdowns
- **AllTeamsView** - Comprehensive table of all 362 teams with sortable rankings and tournament odds

## Project Structure

```
ncaa-tournament-odds/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui-style primitives
│   │   ├── Layout.tsx
│   │   ├── Speedometer.tsx
│   │   └── RankingSparkline.tsx
│   ├── views/            # Page-level components
│   │   ├── LandingView.tsx
│   │   ├── TeamView.tsx
│   │   └── AllTeamsView.tsx
│   ├── lib/              # Utility functions
│   │   └── utils.ts
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
   - `TeamView` - Detailed team page with rankings, schedule, and records
   - `AllTeamsView` - Sortable table of all 362 teams

## Key Features

### Tournament Odds Calculation
Tournament odds are calculated using a weighted algorithm:
- NET ranking
- BPI, SOR, KPI rankings
- KenPom and Torvik rankings
- Quadrant records (Q1-Q4)
- Overall record and strength of schedule
- Day-over-day odds changes tracked via `previousTournamentOdds`

### Odds Movers
- **Biggest Risers** - Teams with largest positive odds changes
- **Biggest Fallers** - Teams with largest negative odds changes
- **Bubble Teams** - Teams closest to 50% tournament odds threshold
- Real-time tracking via `odds_movers.json`

### Team Search
- Command palette (cmdk) with instant search across 362 teams
- Keyboard navigation support
- Logo previews in dropdown
- Accessible and fast

### All Teams Table
- Sortable by any tourney odds or team name
- Responsive design with horizontal scroll
- Direct links to team pages


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

## Performance Optimizations

### Future Improvements
- [ ] Code splitting for route-based chunks
- [ ] Image optimization (WebP, lazy loading improvements)
- [ ] Service worker for offline support

## Possible Roadmap

### UI/UX Improvements
- [ ] Dark mode toggle
- [ ] Customizable dashboard (pin favorite teams)
- [ ] Share team cards on social media
- [ ] Historical trend charts (odds over time)
- [ ] Mobile app wrapper (PWA)
- [ ] Accessibility audit and WCAG compliance
