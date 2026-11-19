import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting Homexa Full Stack (Backend + Frontend)...\n');

// Start Backend on Port 5000
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve('Backend'),
  stdio: 'inherit',
  shell: true
});

// Start Frontend on Port 5173
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve('Frontend'),
  stdio: 'inherit',
  shell: true
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
