import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const searchParams = await props.searchParams;
    
    // Extract parameters
    const ide = searchParams.ide as string || 'An anonymous startup idea';
    const ro = searchParams.ro as string || '';
    const to = searchParams.to as string || '';
    const ex = searchParams.ex as string || '';

    // Reconstruct the OG Image URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://model.delights.pro';
    const ogUrl = new URL(`${baseUrl}/api/og-validate`);
    if (ide) ogUrl.searchParams.set('ide', ide);
    if (ro) ogUrl.searchParams.set('ro', ro);
    if (to) ogUrl.searchParams.set('to', to);
    if (ex) ogUrl.searchParams.set('ex', ex);

    const title = "Idea Triangulation Verdict | model.delights.pro";
    const description = `The Red Team roasted it: "${ro.slice(0, 100)}..." Check out the full Autopsy vs Catalyst breakdown.`;

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: "Startup Triangulation Verdict",
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [ogUrl.toString()],
        },
    }
}

export default async function ValidatorShareGateway(props: Props) {
    const searchParams = await props.searchParams;
    const ide = searchParams.ide as string || 'Unknown Idea';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://model.delights.pro';
    const ogUrl = new URL(`${baseUrl}/api/og-validate`);
    
    if (ide) ogUrl.searchParams.set('ide', ide);
    if (searchParams.ro) ogUrl.searchParams.set('ro', searchParams.ro as string);
    if (searchParams.to) ogUrl.searchParams.set('to', searchParams.to as string);
    if (searchParams.ex) ogUrl.searchParams.set('ex', searchParams.ex as string);

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
            
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '20px' }}>The Triangulation Verdict is In</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
                This founder submitted their idea to the model.delights autonomous Red/Green teams.
                <br /><br />
                <strong style={{ color: 'var(--text-primary)' }}>"{ide}"</strong>
            </p>

            <img 
                src={ogUrl.toString()} 
                alt="Triangulation Results" 
                style={{ width: '100%', maxWidth: '800px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
            />

            <h2 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Is your startup bulletproof?</h2>
            
            <Link 
                href="/validate" 
                style={{ 
                    padding: '16px 32px', 
                    fontSize: '1.2rem', 
                    background: 'linear-gradient(90deg, #ff4c4c, #2ecc71)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
                    display: 'inline-block'
                }}>
                Roast Your Own Idea 🚀
            </Link>
            
        </div>
    );
}
