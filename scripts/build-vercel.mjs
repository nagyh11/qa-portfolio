import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, existsSync, rmSync, cpSync } from 'fs';

// Clean previous Vercel build output
if (existsSync('.vercel/output')) rmSync('.vercel/output', { recursive: true });

// 1. Run Vite build
console.log('📦 Building application with Vite...');
execSync('bun run build', { stdio: 'inherit' });

// 2. Create Vercel Build Output API structure
console.log('📁 Creating Vercel output structure...');
mkdirSync('.vercel/output/static', { recursive: true });
mkdirSync('.vercel/output/functions/index.func', { recursive: true });

// 3. Copy static client assets
cpSync('dist/client', '.vercel/output/static', { recursive: true });

// 4. Bundle the server + Node.js adapter into a single self-contained file
console.log('🔨 Bundling server function...');
execSync(
  'bun build .vercel-entry.js --target node --format cjs --outfile .vercel/output/functions/index.func/index.js',
  { stdio: 'inherit' }
);

// 5. Vercel function config (Node.js 20 runtime)
writeFileSync(
  '.vercel/output/functions/index.func/.vc-config.json',
  JSON.stringify({ runtime: 'nodejs20.x', handler: 'index.js' }, null, 2)
);

// 6. Vercel output routing: static files first, everything else → SSR function
writeFileSync(
  '.vercel/output/config.json',
  JSON.stringify(
    {
      version: 3,
      routes: [{ handle: 'filesystem' }, { src: '/(.*)', dest: '/index' }],
    },
    null,
    2
  )
);

console.log('✅ Vercel build output ready at .vercel/output/');
