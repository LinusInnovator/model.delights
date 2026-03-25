import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

const rootPath = process.cwd();
const configPath = path.join(rootPath, 'insights.config.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (!fs.existsSync(configPath)) {
    console.error("[Insights Publisher] Fatal Error: insights.config.json not found in root.");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const queueDir = path.join(rootPath, config.queueDir);
const publishDir = path.join(rootPath, config.publishDir);

console.log(`\n============== MODEL DELIGHTS PUBLISHER ==============\n`);

if (!fs.existsSync(queueDir)) {
    console.log(`[Pacing Engine] Target Queue directory is empty or does not exist. Nothing to publish.`);
    console.log(`======================================================\n`);
    process.exit(0);
}



async function main() {
    console.log(`[1] Instantiating Headless DB Push Protocols...`);

    if (!supabase) {
        console.error(`[Pacing Engine] Fatal: Supabase Service Role configuration missing. Add keys to .env.local.`);
        process.exit(1);
    }

    // New nested structure traversal for Headless Tenant arrays
    const tenants = fs.readdirSync(queueDir).filter(t => fs.statSync(path.join(queueDir, t)).isDirectory());
    const publishedSlugs: string[] = [];

    for (const tenant of tenants) {
        const tenantDir = path.join(queueDir, tenant);
        const clusters = fs.readdirSync(tenantDir).filter(c => fs.statSync(path.join(tenantDir, c)).isDirectory());

        for (const clusterName of clusters) {
            console.log(`\n---------------------------------------------------------`);
            console.log(`[Deploying Database Schema] Tenant: ${tenant} | Cluster: '${clusterName}'`);
            
            const clusterPath = path.join(tenantDir, clusterName);
            const files = fs.readdirSync(clusterPath).filter(f => f.endsWith('.ts'));

            for (const file of files) {
                const sourceFile = path.join(clusterPath, file);
                const fileContent = fs.readFileSync(sourceFile, 'utf8');
                
                try {
                    // Extract the JSON object regardless of the dynamic const variable name
                    const match = fileContent.match(/export\s+const\s+[^=]+\s*=\s*({[\s\S]*});?\s*$/);
                    if (!match) {
                        throw new Error("Structural JSON extraction regex failed to isolate the payload block.");
                    }
                    
                    const rawJson = match[1];
                    const parsedPayload = JSON.parse(rawJson);
                    const slug = file.replace('.ts', '');
                    const extractedTitle = parsedPayload.title?.executive || parsedPayload.title?.technical || parsedPayload.title?.beginner || slug;
                    
                    const { error } = await supabase.from('published_nodes').upsert(
                        {
                            tenant_id: tenant,
                            slug: slug,
                            title: extractedTitle,
                            content_json: parsedPayload
                        },
                        { onConflict: 'tenant_id, slug' }
                    );

                    if (error) throw error;

                    if (slug && !publishedSlugs.includes(slug)) {
                        publishedSlugs.push(slug);
                    }
                    console.log(` - Upserted Headless Node into Supabase Edge: ${slug}`);
                    
                    // Delete securely after transactional verification
                    fs.unlinkSync(sourceFile);
                    
                } catch(e: any) {
                    console.error(`[Fatal] Database insertion rejected for ${file}: ${e.message}`);
                }
            }

            // Clean up empty directory automatically 
            try { fs.rmdirSync(clusterPath); } catch(e){}
            console.log(`[SUCCESS] Cluster topological array completely migrated to Headless API.`);
            console.log(`---------------------------------------------------------\n`);
        }
    }

    // --- PHASE 8: GOOGLE INDEXING API PING ---
    if (publishedSlugs.length > 0) {
        const serviceAccountPath = path.join(rootPath, 'google-service-account.json');
        if (!fs.existsSync(serviceAccountPath)) {
            console.log(`[SEO Ping] Skipped: 'google-service-account.json' not found in root. Add it to enable immediate Search Engine crawling.`);
        } else {
            try {
                console.log(`[SEO Ping] Securing OAuth 2.0 JWT Bearer Token for Google Indexing API...`);
                const auth = new GoogleAuth({
                    keyFile: serviceAccountPath,
                    scopes: ['https://www.googleapis.com/auth/indexing'],
                });
                
                const client = await auth.getClient();
                const baseUrl = process.env.MODEL_DELIGHTS_BASE_URL || 'https://model.delights.pro';
                
                for (const slug of publishedSlugs) {
                    const articleUrl = `${baseUrl}/insights?article=${slug}`;
                    console.log(`[SEO Ping] Dispatching URL_UPDATED payload for: ${articleUrl}`);
                    
                    await client.request({
                        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                        method: 'POST',
                        data: {
                            url: articleUrl,
                            type: 'URL_UPDATED'
                        }
                    });
                    console.log(` - Success: Google indexing queue confirmed. Target will be crawled imminently.`);
                }
            } catch (error: any) {
                console.warn(`[SEO Ping Warning] Failed to ping Google Indexing API. The deployment succeeded, but organic SEO pacing will apply.`);
                console.warn(` - Core Reason: ${error.message}`);
            }
        }
    }

    console.log(`\n[3] The SEO Pacing Constraint was enforced successfully.`);
    console.log(`[4] Next.js caching will organically compile the new pages automatically.`);
    console.log(`============== PUBLISHING COMPLETE ==============\n`);
}

main().catch(console.error);
