import siteConfig from '../../config/site-config.json';
import registry from '../../config/registry.json';

/**
 * Site-wide configuration, bundled at build time from config/site-config.json.
 * Edit it with `npm run admin` (local page), then rebuild/push.
 *
 *  - sources:  which rating sources are in use (scraper + calculations)
 *  - sections: per-section display state ('on' | 'soon' | 'hidden')
 *  - phase:    'preseason' | 'season' | 'offseason'
 *
 * Offseason/preseason phases:
 *  - Updates pill dot turns red and text is prefixed with the phase label
 *  - Speedometer needle stops bouncing
 */
export type SourceId = (typeof registry.sources)[number]['id'];
export type SectionId = (typeof registry.sections)[number]['id'];
export type SectionState = 'on' | 'soon' | 'hidden';
export type Phase = 'preseason' | 'season' | 'offseason';

export const SEASON: string = siteConfig.season;
export const PHASE: Phase = siteConfig.phase as Phase;
export const SOURCES = siteConfig.sources as Record<SourceId, boolean>;
export const SECTIONS = siteConfig.sections as Record<string, SectionState>;
export const SOURCE_LABELS = Object.fromEntries(
  registry.sources.map(s => [s.id, s.label])
) as Record<SourceId, string>;
export const SECTION_REQUIRES = Object.fromEntries(
  registry.sections.map(s => [s.id, s.requires])
) as Record<SectionId, SourceId[]>;
export const SOURCE_FIELDS = Object.fromEntries(
  registry.sources.map(s => [s.id, s.fields])
) as Record<SourceId, string[]>;

/** `?preview=full` shows every section and treats every source as enabled (view-only). */
export const PREVIEW_FULL =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'full';

/** Banner label for the Updates pill; null once the season is live. */
export const PHASE_LABEL: string | null =
  PHASE === 'season' ? null : PHASE === 'preseason' ? 'PRESEASON' : 'OFFSEASON';

/** True when the pill/needle should render in their quiet (non-live) styles. */
export const IS_OFFSEASON = PHASE !== 'season';

export function sourceEnabled(id: SourceId): boolean {
  return PREVIEW_FULL || SOURCES[id] === true;
}

export function sectionState(id: SectionId): SectionState {
  if (PREVIEW_FULL) return 'on';
  return SECTIONS[id] ?? 'on';
}
