import React from 'react';
import { sectionState, SECTION_REQUIRES, SOURCE_LABELS, SEASON } from '@/lib/config';
import type { SectionId } from '@/lib/config';

type SectionGateProps = {
  id: SectionId;
  /** Short name used in the placeholder, e.g. "Bracket projection". */
  title?: string;
  /** 'block' = bordered card; 'inline' = single muted line (for small slots). */
  variant?: 'block' | 'inline';
  className?: string;
  children: React.ReactNode;
};

/** Names the data sources a section is waiting on, e.g. "NCAA NET and records, quads and standings". */
export function pendingSourcesText(id: SectionId): string {
  const labels = SECTION_REQUIRES[id].map(s => SOURCE_LABELS[s]);
  if (labels.length <= 1) return labels[0] ?? 'more ratings';
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

function comingSoonText(id: SectionId): string {
  return `Coming soon — Updates when ${pendingSourcesText(id)} data is released for ${SEASON}.`;
}

/** Slim notice for places where there is no layout to blur (e.g. a page-level banner). */
export function ComingSoon({
  id,
  title,
  variant = 'block',
  className = '',
}: Omit<SectionGateProps, 'children'>) {
  const text = comingSoonText(id);
  if (variant === 'inline') {
    return <p className={`text-xs text-gray-500 italic ${className}`}>{title ? `${title}: ` : ''}{text}</p>;
  }
  return (
    <div className={`rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-gray-800 mb-1 ibm-plex-sans">{title}</h3>}
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

type BlurOverlayProps = {
  title?: string;
  message: string;
  /** 'compact' shrinks the message card and minimum height for small slots. */
  size?: 'default' | 'compact';
  /** Use light text on a dark card when sitting on a dark background (e.g. the team hero). */
  tone?: 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
};

/**
 * Renders `children` as if the section were complete, blurred and non-interactive,
 * with a message card centered on top. Tall sections are clipped so the message
 * stays in view.
 */
export function BlurOverlay({ title, message, size = 'default', tone = 'light', className = '', children }: BlurOverlayProps) {
  const compact = size === 'compact';
  const card =
    tone === 'dark'
      ? 'bg-black/45 text-white border-white/20'
      : 'bg-white/85 text-gray-800 border-gray-200';
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${compact ? 'min-h-[72px] max-h-[200px]' : 'min-h-[160px] max-h-[560px]'} ${className}`}
    >
      <div
        aria-hidden="true"
        {...({ inert: '' } as Record<string, string>)}
        className="pointer-events-none select-none blur-[7px] opacity-70"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="status"
          className={`max-w-md text-center rounded-lg border shadow-sm backdrop-blur-sm ${card} ${compact ? 'px-3 py-2' : 'px-5 py-4'}`}
        >
          {title && <p className={`font-semibold ibm-plex-sans ${compact ? 'text-xs' : 'text-sm'} mb-0.5`}>{title}</p>}
          <p className={`${compact ? 'text-xs' : 'text-sm'} leading-relaxed ${tone === 'dark' ? 'text-white/85' : 'text-gray-600'}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

export function SectionGate({ id, title, variant = 'block', className, children }: SectionGateProps) {
  const state = sectionState(id);
  if (state === 'on') return <>{children}</>;
  if (state === 'hidden') return null;
  return (
    <BlurOverlay
      title={title}
      message={comingSoonText(id)}
      size={variant === 'inline' ? 'compact' : 'default'}
      className={className}
    >
      {children}
    </BlurOverlay>
  );
}
