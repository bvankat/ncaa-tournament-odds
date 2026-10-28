import { ImageResponse } from '@vercel/og';
import siteConfig from '../config/site-config.json';

/** True when the given section (see config/registry.json) is switched on in config/site-config.json. */
export function sectionIsOn(id: string): boolean {
  return (siteConfig.sections as Record<string, string>)[id] === 'on';
}

/** Static share image used while a section isn't live yet. */
export function comingSoonImage(title: string): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          backgroundImage: 'linear-gradient(to bottom, hsla(212, 72%, 59%, 0.14), rgba(255,255,255,0) 60%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#6b7280', letterSpacing: 4, textTransform: 'uppercase' }}>
          {`${siteConfig.season} season`}
        </div>
        <div style={{ fontSize: 76, fontWeight: 800, color: '#111827', marginTop: 16 }}>{title}</div>
        <div style={{ fontSize: 34, color: '#4b5563', marginTop: 20 }}>Coming soon as ratings are released</div>
        <div style={{ fontSize: 26, color: '#9ca3af', marginTop: 56 }}>tourneyodds.info</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } }
  );
}
