import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        const hasIde = searchParams.has('ide');
        const idea = hasIde ? searchParams.get('ide')?.slice(0, 100) + '...' : 'An anonymous startup idea';
        
        const roast = searchParams.get('ro')?.slice(0, 150) + '...' || 'Critical Risks Identified. Proceed with extreme caution.';
        const toast = searchParams.get('to')?.slice(0, 150) + '...' || 'Exponential Upside Detected. Massive market potential.';
        const exec = searchParams.get('ex')?.slice(0, 200) || 'Pivot Required. Rework core value proposition immediately.';

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
                        backgroundColor: '#0a0a0a',
                        color: 'white',
                        fontFamily: '"SF Pro Display", sans-serif',
                        padding: '60px',
                        backgroundImage: 'radial-gradient(circle at center, #111 0%, #000 100%)',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                        <span style={{ fontSize: 32, letterSpacing: '2px', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>
                            <span style={{ color: '#00e5ff', marginRight: '8px' }}>model</span>.<span style={{ color: '#7000ff' }}>delights</span> | TRIANGULATION ENGINE
                        </span>
                    </div>

                    {/* Idea Block */}
                    <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, textAlign: 'center', marginBottom: '40px', color: 'white', maxWidth: '900px', lineHeight: 1.2 }}>
                        "{idea}"
                    </div>

                    {/* The Roast/Toast Split */}
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '30px', flex: 1 }}>
                        
                        {/* Red Team (Roast) */}
                        <div style={{ 
                            display: 'flex', flexDirection: 'column', flex: 1, 
                            padding: '30px', borderRadius: '24px', 
                            backgroundColor: 'rgba(255, 60, 60, 0.05)', 
                            border: '1px solid rgba(255, 60, 60, 0.2)' 
                        }}>
                            <div style={{ display: 'flex', fontSize: 24, fontWeight: 800, color: '#ff4c4c', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                                Red Team (Autopsy)
                            </div>
                            <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>
                                {roast}
                            </div>
                        </div>

                        {/* Green Team (Toast) */}
                        <div style={{ 
                            display: 'flex', flexDirection: 'column', flex: 1, 
                            padding: '30px', borderRadius: '24px', 
                            backgroundColor: 'rgba(46, 204, 113, 0.05)', 
                            border: '1px solid rgba(46, 204, 113, 0.2)' 
                        }}>
                            <div style={{ display: 'flex', fontSize: 24, fontWeight: 800, color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                                Green Team (Catalyst)
                            </div>
                            <div style={{ display: 'flex', fontSize: 28, lineHeight: 1.4, color: 'rgba(255,255,255,0.9)' }}>
                                {toast}
                            </div>
                        </div>

                    </div>

                    {/* Executive Verdict */}
                    <div style={{ 
                        display: 'flex', width: '100%', marginTop: '30px', padding: '30px', 
                        borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.2)', alignItems: 'center' 
                    }}>
                        <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, color: '#00e5ff', marginRight: '24px', letterSpacing: '1px' }}>
                            PIVOT DICTATED:
                        </div>
                        <div style={{ display: 'flex', fontSize: 32, fontWeight: 500, color: 'white', flex: 1, lineHeight: 1.3 }}>
                            {exec}
                        </div>
                    </div>

                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: unknown) {
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
