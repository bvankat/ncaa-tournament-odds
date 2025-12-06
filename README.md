# NCAA Tournament Odds

A web application that displays NCAA Men's Basketball Tournament selection probabilities for all 362 Division I teams, based on current team-sheet metrics and rankings.

## Overview

This app provides real-time tournament odds calculated from key metrics (NET, BPI, SOR, KPI, KenPom, Torvik) by scraping official NCAA and ESPN data sources. Users can view detailed team profiles including rankings, schedule information, and record breakdowns.

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
- **Python scrapers** - Backend data collection scripts
  - `updated_all_teams_scrape.py` - Scrapes team rankings and metrics
  - `schedule_scraper.py` - Collects full season schedules with opponent logos from ESPN API
  - `generate_team_mappings.py` - Creates team identity mappings across data sources

### Custom Components
- **Speedometer** - SVG-based gauge displaying tournament odds percentage
- **RankingSparkline** - Visual ranking indicator with color coding
- **Combobox** - Searchable team selector with keyboard navigation
- **Layout** - App shell with navigation and routing

### Views
- **LandingView** - Homepage with scrolling logo grid, team search, and random odds gauge
- **TeamView** - Detailed team page with rankings table, schedule, and record breakdowns

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
│   │   └── TeamView.tsx
│   ├── lib/              # Utility functions
│   │   └── utils.ts
│   ├── types/            # TypeScript type definitions
│   │   └── team.ts
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles + Tailwind directives
├── public/               # Static assets and JSON data
│   ├── all_teams_rankings.json
│   ├── all_teams_schedules.json
│   └── team_mappings.json
├── scrape/               # Python data collection scripts
│   ├── updated_all_teams_scrape.py
│   ├── schedule_scraper.py
│   └── generate_team_mappings.py
├── index.html            # Entry HTML with Google Fonts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## Data Flow

1. **Scraping** - Python scripts collect data from NCAA.com and ESPN API
   - Rankings scraper: NET, BPI, SOR, KPI rankings from NCAA team sheets
   - Schedule scraper: Full season schedules with opponent logos, scores, and team IDs
   - Team mappings: Cross-reference between ESPN slugs, display names, and NCAA names

2. **Storage** - Data saved to JSON files in `/public`
   - `all_teams_rankings.json` - 362 teams with all ranking metrics
   - `all_teams_schedules.json` - Complete schedule data for all teams
   - `team_mappings.json` - Team identity mapping

3. **Frontend** - React app fetches JSON on load
   - `App.tsx` loads data and manages routing state
   - URL slug determines selected team (e.g., `/duke-blue-devils`)
   - Tournament odds calculated client-side from rankings
   - Google Analytics tracks page views for each team

4. **Display** - Component hierarchy renders views
   - `LandingView` shows overview with searchable team selector
   - `TeamView` displays detailed metrics, schedule table, and record cards

## Key Features

### Tournament Odds Calculation
Algorithm in `lib/utils.ts` weighs multiple ranking metrics to produce probability:
- NET ranking (primary weight)
- BPI, SOR, KPI rankings
- KenPom and Torvik rankings
- Quadrant records (Q1-Q4)
- Overall record and strength of schedule

### Schedule Display
- Full season schedule with opponent logos
- Home/away/neutral indicators
- Win/loss results with scores
- Future games with date/time
- Responsive table layout

### Team Search
- Combobox with fuzzy search across 362 teams
- Keyboard navigation support
- Logo previews in dropdown
- Updates URL on selection

### Visual Design
- Team-branded color scheme (primary/secondary colors)
- Animated speedometer gauge
- Scrolling logo rows on landing page
- SVG backgrounds (blurred ellipse + dot pattern)
- Responsive grid layouts

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
```bash
cd scrape
python3 updated_all_teams_scrape.py
python3 schedule_scraper.py
```

## Analytics

Google Analytics (G-C80JTF63MK) tracks:
- Page views per team
- Team selection events
- User navigation patterns

## Roadmap

### UI/UX Improvements
- [ ] Dark mode toggle
- [ ] Customizable dashboard (pin favorite teams)
- [ ] Share team cards on social media
- [ ] Print-friendly team reports
- [ ] Mobile app wrapper (React Native or PWA)
- [ ] Accessibility audit and WCAG compliance
- [ ] Loading skeletons for better perceived performance

### Technical Improvements
- [ ] API layer for data (replace JSON file fetching)
- [ ] Server-side rendering for SEO (Next.js migration?)
- [ ] Database for historical data (PostgreSQL/MongoDB)
- [ ] Real-time updates via WebSockets
- [ ] CDN deployment for JSON files
- [ ] Error boundary components
- [ ] Unit tests for utility functions
- [ ] E2E tests for critical user flows
- [ ] Performance optimization (code splitting, image optimization)
- [ ] Service worker for offline support

### Analytics & Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Web Vitals)
- [ ] User feedback system
- [ ] A/B testing framework
- [ ] Heatmaps and session recordings