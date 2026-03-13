import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/app/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)\s*\{/g, 'catch ($1: unknown) {');
  content = content.replace(/\b(e|err|error)\.message\b/g, '($1 as Error).message');

  if (content !== original) {
     fs.writeFileSync(file, content);
     totalFixed++;
  }
});

console.log(`Fixed any typings in catches across ${totalFixed} files.`);
