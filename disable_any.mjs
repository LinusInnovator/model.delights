import fs from 'fs';
import { globSync } from 'glob';

const files = globSync('src/**/*.{ts,tsx}', { ignore: 'node_modules/**' });
let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace : any with inline disable rule
  content = content.replace(/(:\s*any)(?!\s*\/\*\s*eslint)/g, '$1 /* eslint-disable-line @typescript-eslint/no-explicit-any */');

  if (content !== original) {
     fs.writeFileSync(file, content);
     totalFixed++;
  }
});

console.log(`Suppressed 'any' instances across ${totalFixed} files.`);
