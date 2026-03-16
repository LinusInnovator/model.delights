import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'The AI-First Publishing Manifesto | model.delights';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom right, #000000, #14141e)',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Glow */}
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)' }}></div>

        {/* Branding Flag */}
        <div style={{ 
          display: 'flex', 
          alignSelf: 'flex-start', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          padding: '12px 24px', 
          borderRadius: '16px', 
          background: 'rgba(255, 255, 255, 0.05)',
          marginBottom: '80px' 
        }}>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em' }}>model.</span>
            <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#00e5ff' }}>delights</span>
        </div>
        
        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 84,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '40px',
            lineHeight: 1.1,
          }}
        >
          <span>The AI-First</span>
          <span>Publishing Manifesto</span>
        </div>
        
        {/* Subtitle */}
        <div style={{ 
          fontSize: 36, 
          color: '#a1a1aa', 
          maxWidth: '800px', 
          lineHeight: 1.4,
          fontWeight: 500
        }}>
          Rethinking digital consumption mechanics when content generation marginal costs hit zero.
        </div>
        
        {/* Decorative Element */}
        <div style={{ position: 'absolute', bottom: '80px', right: '80px', display: 'flex' }}>
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
             </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
