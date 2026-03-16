import { Project, SyntaxKind, PropertyAssignment, ObjectLiteralExpression } from "ts-morph";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error("No OPENROUTER_API_KEY found");
  process.exit(1);
}

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// Simple sleep to avoid rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function rewriteText(truthText: string): Promise<string> {
  const prompt = `You are rewriting content from a company manifesto. 
The current "truth mode" is somewhat cynical or direct about corporate challenges. 
We need a "nice mode" version of the exact same content.

GUIDELINES FOR NICE MODE:
- "In truth we show the reality of organization, in nice mode we describe the challenges very short and without blame, and focus on the upside 70% more."
- Do NOT fill the articles with nonsensical or overly long wording. Be concise.
- Tone: "Like the words of a slightly scared politically correct HR junior, then polished by a senior copywriter." Positive, blame-free, focusing on the bright side, but STILL short, punchy, and readable.

Original Truth text:
${truthText}

Only return the rewritten text, nothing else.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet:beta",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const json = await res.json();
    return json.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error during rewrite fetch:", error);
    return truthText; // fallback
  }
}

function cleanQuotes(text: string): string {
    let t = text.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith('`') && t.endsWith('`')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.substring(1, t.length - 1);
    }
    return t;
}

// Ensure the text has proper escaping for backticks inside backticks
function escapeBackticks(text: string): string {
    // If the output from Claude already has literal backticks, we should escape them
    return text.replace(/`/g, '\\`').replace(/\\n/g, '\n');
}

async function run() {
  const files = project.getSourceFiles("src/data/manifesto/part-*.ts");
  
  for (const file of files) {
    console.log(`Processing ${file.getFilePath()}`);
    let changed = false;

    // Find all 'nice' PropertyAssignments
    const niceProps = file.getDescendantsOfKind(SyntaxKind.PropertyAssignment)
      .filter(p => p.getName() === "nice");

    for (const niceProp of niceProps) {
      const parentObj = niceProp.getParentIfKind(SyntaxKind.ObjectLiteralExpression);
      const niceObj = niceProp.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
      
      if (!parentObj || !niceObj) continue;

      const simpleProp = parentObj.getProperty("simple") as PropertyAssignment;
      const profProp = parentObj.getProperty("professional") as PropertyAssignment;
      const acadProp = parentObj.getProperty("academic") as PropertyAssignment;

      const nSimpleProp = niceObj.getProperty("simple") as PropertyAssignment;
      const nProfProp = niceObj.getProperty("professional") as PropertyAssignment;
      const nAcadProp = niceObj.getProperty("academic") as PropertyAssignment;

      if (simpleProp && profProp && acadProp && nSimpleProp && nProfProp && nAcadProp) {
          const simpleText = cleanQuotes(simpleProp.getInitializer()!.getText());
          const profText = cleanQuotes(profProp.getInitializer()!.getText());
          const acadText = cleanQuotes(acadProp.getInitializer()!.getText());

          console.log("Rewriting a chunk...");
          const newSimple = await rewriteText(simpleText);
          await delay(200);
          const newProf = await rewriteText(profText);
          await delay(200);
          const newAcad = await rewriteText(acadText);
          await delay(200);

          nSimpleProp.setInitializer(`\`${escapeBackticks(newSimple)}\``);
          nProfProp.setInitializer(`\`${escapeBackticks(newProf)}\``);
          nAcadProp.setInitializer(`\`${escapeBackticks(newAcad)}\``);
          changed = true;
      }
    }

    if (changed) {
        file.saveSync();
        console.log(`Saved ${file.getFilePath()}`);
    }
  }
}

run().then(() => console.log("Done")).catch(console.error);
