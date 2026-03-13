/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

async function main() {
    console.log("Testing POST to /api/download-blueprint...");
    try {
        const res = await fetch('http://localhost:3000/api/download-blueprint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Alpha Test Infrastructure",
                stack: {
                    core_engine: { id: "anthropic/claude-3.5-sonnet", provider: "openrouter" },
                    voice_gen: { id: "cartesia/sonic", provider: "cartesia" }
                }
            })
        });

        if (!res.ok) {
            console.error("API Error Response:", await res.text());
            return;
        }

        const buffer = await res.arrayBuffer();
        fs.writeFileSync('./execution/alpha-test.zip', Buffer.from(buffer));
        console.log(`Success! Zip file written to execute/alpha-test.zip. Size: ${buffer.byteLength} bytes.`);
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
main();
