import fs from 'fs';
import { execSync } from 'child_process';

const hasNodeModules = fs.existsSync('Frontend/node_modules');
if (!hasNodeModules) {
  console.log('📦 Installing frontend dependencies...');
  execSync('npm --prefix Frontend install', { stdio: 'inherit' });
} else {
  console.log('📦 Frontend dependencies already installed.');
}

console.log('⚡ Building frontend with Vite...');
execSync('npm --prefix Frontend run build', { stdio: 'inherit' });

console.log('📂 Syncing build output to root dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.cpSync('Frontend/dist', 'dist', { recursive: true });

console.log('✅ Build completed successfully for Cloudflare Pages / Workers!');
