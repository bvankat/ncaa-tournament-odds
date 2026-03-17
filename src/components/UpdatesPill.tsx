import React from 'react';
import { IS_OFFSEASON } from '@/lib/config';
import { formatRelativeTime } from '@/lib/utils';

type UpdatesPillProps = {
  lastUpdated?: number | string | null;
  /** "teamview" omits the background/border/padding used in card-style headers */
  variant?: 'default' | 'teamview';
};

export function UpdatesPill({ lastUpdated, variant = 'default' }: UpdatesPillProps) {
  if (!lastUpdated) return null;

  const dotBase = IS_OFFSEASON
    ? { ping: 'bg-red-200', solid: 'bg-red-500' }
    : { ping: 'bg-green-200', solid: 'bg-green-500' };

  const containerClass =
    variant === 'teamview'
      ? 'inline-flex items-center w-fit mb-2 lg:mb-6'
      : 'inline-flex items-center w-fit px-4 py-2 shadow-sm bg-white/40 rounded-full border border-white/15 mb-4';

  const textClass =
    variant === 'teamview'
      ? 'text-white/70 text-[11px] font-light tracking-wider pl-4 lg:inline-block geist-mono uppercase'
      : 'opacity-60 text-xs font-light tracking-wider pl-4 lg:inline-block geist-mono uppercase';

  return (
    <div id="updates-pill" className={containerClass}>
      <span className="relative size-2">
        {!IS_OFFSEASON && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotBase.ping} opacity-80`}></span>
        )}
        <span className={`absolute inline-flex size-2 rounded-full ${dotBase.solid}`}></span>
      </span>
      <p className={textClass}>
        {IS_OFFSEASON && <span>OFFSEASON — </span>}
        <span>UPDATED </span>
        <span id="update-relative-time">{formatRelativeTime(lastUpdated)}</span>
      </p>
    </div>
  );
}
