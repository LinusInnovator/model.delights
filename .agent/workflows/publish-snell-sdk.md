---
description: How to maintain and publish the model-delights-snell SDK to NPM
---

# Snell SDK Publishing Workflow

The `model-delights-snell` package is our proprietary mathematical routing engine (Snell SDK). It lives locally inside the `packages/sdk` monorepo directory as `@model-delights/snell`, but must be published to the public NPM registry under the `linusinnovator` account as `model-delights-snell`.

**Core Directive:** The AI Agent is responsible for maintaining, building, and publishing this SDK automatically whenever significant engine changes occur.

### Steps to publish SDK updates:

1. Navigate to the SDK workspace
cd packages/sdk

// turbo
2. Ensure all types and distribution files are built
npm run build

3. Bump the patch or minor version
npm version patch

4. Publish the newly built package to the public NPM registry
npm publish --access public
