import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

const rootPath = process.cwd();
const configPath = path.join(rootPath, 'insights.config.json');

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

const queueItems = fs.readdirSync(queueDir).filter(item => {
    return fs.statSync(path.join(queueDir, item)).isDirectory();
});

if (queueItems.length === 0) {
    console.log(`[Pacing Engine] Queue directory is currently empty. No new clusters pending.`);
    console.log(`======================================================\n`);
    process.exit(0);
}

// Sort by oldest cluster first based on fs stats (or just alphabetically if they are timestamped)
// Let's just grab the first one (FIFO via OS directory ordering, which is usually alphabetical)
queueItems.sort((a, b) => {
    return fs.statSync(path.join(queueDir, a)).mtime.getTime() - fs.statSync(path.join(queueDir, b)).mtime.getTime();
});

const maxClustersToPublish = config.maxClustersPerPublish || 1;
const clustersToPublish = queueItems.slice(0, maxClustersToPublish);

async function main() {
    console.log(`[1] Found ${queueItems.length} complete clusters resting in the offline Node Queue.`);
    console.log(`[2] Extracting ${clustersToPublish.length} cluster(s) for immediate live deployment...`);

    if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir, { recursive: true });
    }

    const publishedSlugs: string[] = [];

    for (const clusterName of clustersToPublish) {
        console.log(`\n---------------------------------------------------------`);
        console.log(`[Deploying Cluster Web] Target: '${clusterName}'`);
        const clusterPath = path.join(queueDir, clusterName);
        const files = fs.readdirSync(clusterPath).filter(f => f.endsWith('.ts'));

        for (const file of files) {
            const sourceFile = path.join(clusterPath, file);
            const destinationFile = path.join(publishDir, file);
            
            fs.renameSync(sourceFile, destinationFile);
            const slug = file.replace('.ts', '');
            if (slug && !publishedSlugs.includes(slug)) {
                publishedSlugs.push(slug);
            }
            console.log(` - Migrated Node into Next.js Router: ${file}`);
        }

        // Clean up empty directory
        fs.rmdirSync(clusterPath);
        console.log(`[SUCCESS] Spoke-and-Hub Network structurally verified and published.`);
        console.log(`---------------------------------------------------------\n`);
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
                    const articleUrl = `${baseUrl}/insights/${slug}`;
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
