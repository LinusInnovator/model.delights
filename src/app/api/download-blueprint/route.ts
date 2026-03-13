import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import fs from "fs";
import path from "path";

// Define the absolute path to the Golden Template
const templateDir = path.join(process.cwd(), "src/templates/nextjs-ai-router");

export async function POST(req: NextRequest) {
    try {
        const blueprint = await req.json();

        if (!blueprint || !blueprint.name) {
            return NextResponse.json({ error: "Invalid blueprint payload" }, { status: 400 });
        }

        const safeProjectName = blueprint.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "custom-ai-architecture";

        // Extract Core Engine and Provider from the blueprint's stack
        let coreEngineObj = { id: "openai/gpt-4o-mini", provider: "openrouter" };
        if (blueprint.stack && blueprint.stack.core_engine) {
            coreEngineObj = blueprint.stack.core_engine;
        } else if (blueprint.stack && Object.values(blueprint.stack).length > 0) {
            // Select the first node if `core_engine` isn't named explicitly
            coreEngineObj = Object.values(blueprint.stack)[0] as { id: string, provider: string };
        }

        // Determine required API keys based on providers used across all components
        const providers = new Set<string>();
        Object.values(blueprint.stack || {}).forEach((comp: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
            if (comp.provider) {
                providers.add(comp.provider.toUpperCase());
            }
        });

        let apiKeysTemplate = "";
        providers.forEach(p => {
            apiKeysTemplate += `${p}_API_KEY=your_${p.toLowerCase()}_api_key_here\n`;
        });
        if (!apiKeysTemplate) {
            apiKeysTemplate = "OPENROUTER_API_KEY=your_openrouter_api_key_here\n";
        }

        // Setup the Zip stream
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Convert archiver stream to standard React ReadableStream to work with Next.js App Router responses
        const stream = new ReadableStream({
            start(controller) {
                archive.on('data', (chunk) => controller.enqueue(chunk));
                archive.on('end', () => controller.close());
                archive.on('error', (err) => controller.error(err));
            }
        });

        const walkDir = (dir: string, baseDir: string = "") => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                const relativePath = path.join(baseDir, file);

                if (stat.isDirectory()) {
                    walkDir(filePath, relativePath);
                } else {
                    let content = fs.readFileSync(filePath, 'utf8');

                    // Apply AST-like text injection logic per file
                    if (["package.json", "README.md", "layout.tsx", "page.tsx"].includes(file)) {
                        content = content.replace(/__PROJECT_NAME__/g, blueprint.name);
                    }

                    if (file === "route.ts") {
                        content = content.replace(/__CORE_ENGINE_ID__/g, coreEngineObj.id);
                        content = content.replace(/__CORE_ENGINE_PROVIDER__/g, coreEngineObj.provider);
                    }

                    if (file === ".env.example") {
                        content = content.replace(/__API_KEYS_TEMPLATE__/g, apiKeysTemplate);
                    }

                    archive.append(content, { name: path.join(safeProjectName, relativePath) });
                }
            }
        };

        // Initialize the walk and append to archive
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template directory not found: ${templateDir}`);
        }
        walkDir(templateDir);

        // Finalize the archive, which resolves the stream
        archive.finalize();

        // Send the compressed ZIP buffer to the client
        return new NextResponse(stream, {
            headers: {
                "Content-Type": "application/zip",
                "Content-Disposition": `attachment; filename="${safeProjectName}.zip"`,
            }
        });

    } catch (error: unknown) {
        console.error("Factory Error:", error);
        return NextResponse.json({ error: (error as Error).message || "Failed to generate boilerplate zip" }, { status: 500 });
    }
}
