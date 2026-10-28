import { SOURCE_FIELDS, sourceEnabled } from '@/lib/config';
import type { SourceId } from '@/lib/config';

/**
 * Null out every field belonging to a disabled data source so downstream
 * calculations (which already skip null metrics) only see enabled sources.
 */
export function applySourceFilter<T extends Record<string, any>>(team: T): T {
  const out: Record<string, any> = { ...team };
  (Object.keys(SOURCE_FIELDS) as SourceId[]).forEach(id => {
    if (sourceEnabled(id)) return;
    SOURCE_FIELDS[id].forEach(field => {
      if (field in out) out[field] = null;
    });
  });
  return out as T;
}

/** Table cell text for a metric: "N/A" when its source is switched off, "—" when on but missing for this team. */
export function metricCell(source: SourceId, value: unknown): string {
  if (!sourceEnabled(source)) return 'N/A';
  return value === null || value === undefined || value === '' || value === 0 ? '—' : String(value);
}
