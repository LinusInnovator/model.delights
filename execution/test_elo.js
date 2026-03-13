/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/intelligence_dump.json', 'utf8'));
const lmsysEloMap = JSON.parse(fs.readFileSync('./src/data/lmsys_elo.json', 'utf8'));

const mapped = data.entities.filter(m => {
    let uc = [];
    if (m.modalities_out?.includes('image')) uc.push('Image Gen');
    return uc.includes('Image Gen');
}).map(m => {
    let elo = lmsysEloMap[m.model_id] || lmsysEloMap[m.fallback_name];
    if (!elo) {
        const pricing = m.pricing || { prompt: "0", completion: "0" };
        let prompt = parseFloat(pricing.prompt || "0") * 1000000;
        let completion = parseFloat(pricing.completion || "0") * 1000000;
        let total = prompt + completion;

        let nameAndId = (m.model_id + ' ' + (m.fallback_name || '')).toLowerCase();
        if (nameAndId.match(/opus|gpt-?5|gpt-?4|gemini-?3|gemini-?2|o1|o3|405b|72b/)) {
            elo = 1300;
        } else if (nameAndId.match(/pro|sonnet|70b|command-r/)) {
            elo = 1200;
        } else if (nameAndId.match(/flash|haiku|mini|8b|3b|1b|8x7b|lite/)) {
            elo = 1150;
        } else {
            if (total >= 15.0) elo = 1320;
            else if (total >= 5.0) elo = 1220;
            else if (total >= 0.5) elo = 1120;
            else elo = 1050;
        }
    }
    return { id: m.model_id, elo };
});

console.log(mapped.filter(m => m.elo === 1300).map(m => m.id));
console.log("Count with 1300:", mapped.filter(m => m.elo === 1300).length);
console.log("Count with 1320:", mapped.filter(m => m.elo === 1320).length);
