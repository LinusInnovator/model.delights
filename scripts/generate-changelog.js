const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Generating Changelog from Git History ---');

try {
  // Get the last 100 commits
  // Format: %h (hash) | %s (subject) | %as (author date, YYYY-MM-DD)
  const gitLogCommand = 'git log -n 100 --pretty=format:"%h|%s|%as"';
  
  const stdout = execSync(gitLogCommand, { encoding: 'utf8' });
  const lines = stdout.split('\n').filter(Boolean);

  const changelog = lines.map(line => {
    const [hash, subject, date] = line.split('|');
    
    // We parse conventional commits (e.g., "feat(ui): Add dark mode")
    let type = 'other';
    let scope = '';
    let message = subject;
    
    const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/;
    const match = subject.match(conventionalCommitRegex);
    
    if (match) {
        type = match[1];
        scope = match[2] || '';
        message = match[3];
    } else {
        // Fallback for non-conventional commits
        if (subject.toLowerCase().startsWith('merge')) {
            type = 'merge';
        }
    }

    // Determine public value (we don't want to show 'chore' or 'style' or raw merges to end-users unless it's a major refactor)
    let isPublic = true;
    if (['chore', 'style', 'test', 'ci', 'merge'].includes(type.toLowerCase())) {
        isPublic = false;
    }

    // Force some awesome formatting if it was an agent push
    if (message.includes('telemetry') || message.includes('intelligence')) {
        type = 'core';
    }

    return {
      hash,
      type,
      scope,
      message,
      date,
      isPublic
    };
  }).filter(entry => entry.isPublic);

  // Read existing changelog if there is one (we don't want to overwrite manual entries if they exist, but for now we'll just rewrite entirely)
  const dataPath = path.join(__dirname, '../src/data/changelog.json');
  
  // Ensure directory exists
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Group by date
  const groupedChangelog = [];
  changelog.forEach(entry => {
      let group = groupedChangelog.find(g => g.date === entry.date);
      if (!group) {
          group = { date: entry.date, items: [] };
          groupedChangelog.push(group);
      }
      group.items.push(entry);
  });

  fs.writeFileSync(dataPath, JSON.stringify(groupedChangelog, null, 2));
  console.log(`Successfully wrote ${changelog.length} public commits to src/data/changelog.json`);

} catch (error) {
  console.error("Failed to generate changelog from git:", error.message);
  // If git fails (e.g., in weird CI environments without .git), don't crash the build. Write empty JSON.
  const dataPath = path.join(__dirname, '../src/data/changelog.json');
  if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }
}
