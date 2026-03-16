import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'model.delights | The Smart Matrix for AI Developers';
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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #000000, #0a0a0f)',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        {/* Background Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.15) 0%, transparent 60%)',
          }}
        />
        
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 50 }}>
          <div style={{ 
            display: 'flex', 
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            padding: '24px 40px', 
            borderRadius: '24px', 
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.1)'
          }}>
            <span style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.04em' }}>model.</span>
            <span style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.04em', color: '#00e5ff' }}>delights</span>
          </div>
        </div>

        {/* Hero Text */}
        <div style={{ 
          fontSize: 48, 
          fontWeight: 600, 
          textAlign: 'center', 
          maxWidth: '900px', 
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          The intelligent API routing matrix for AI engineers and developers.
        </div>

        {/* Value Props Row */}
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          marginTop: '60px',
          fontSize: '28px',
          color: '#a1a1aa',
          fontWeight: 500
        }}>
          <span>Optimize Cost</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span>Analyze ELO</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span>
          <span>Route Multi-Modal</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
