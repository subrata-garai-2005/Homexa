import fs from 'fs';
import { execSync } from 'child_process';

console.log('📦 Installing frontend dependencies...');
execSync('npm --prefix Frontend install', { stdio: 'inherit' });

console.log('⚡ Building frontend with Vite...');
execSync('npm --prefix Frontend run build', { stdio: 'inherit' });

console.log('📂 Copying build output to root dist directory...');
fs.cpSync('Frontend/dist', 'dist', { recursive: true });

console.log('✅ Build completed successfully for Cloudflare Pages!');

