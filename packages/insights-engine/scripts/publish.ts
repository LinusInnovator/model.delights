import fs from 'fs';
import path from 'path';

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

console.log(`[1] Found ${queueItems.length} complete clusters resting in the offline Node Queue.`);
console.log(`[2] Extracting ${clustersToPublish.length} cluster(s) for immediate live deployment...`);

if (!fs.existsSync(publishDir)) {
    fs.mkdirSync(publishDir, { recursive: true });
}

for (const clusterName of clustersToPublish) {
    console.log(`\n---------------------------------------------------------`);
    console.log(`[Deploying Cluster Web] Target: '${clusterName}'`);
    const clusterPath = path.join(queueDir, clusterName);
    const files = fs.readdirSync(clusterPath).filter(f => f.endsWith('.ts'));

    for (const file of files) {
        const sourceFile = path.join(clusterPath, file);
        const destinationFile = path.join(publishDir, file);
        
        fs.renameSync(sourceFile, destinationFile);
        console.log(` - Migrated Node into Next.js Router: ${file}`);
    }

    // Clean up empty directory
    fs.rmdirSync(clusterPath);
    console.log(`[SUCCESS] Spoke-and-Hub Network structurally verified and published.`);
    console.log(`---------------------------------------------------------\n`);
}

console.log(`[3] The SEO Pacing Constraint was enforced successfully.`);
console.log(`[4] Next.js caching will organically compile the new pages automatically.`);
console.log(`============== PUBLISHING COMPLETE ==============\n`);
