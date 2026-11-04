import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.VITE_SITE_URL || 'https://somexa.netlify.app';
const API_URL = process.env.VITE_API_BASE_URL || 'http://44.222.204.56:5000/api';
const today = new Date().toISOString().split('T')[0];

const staticRoutes = [
  { path: '', changefreq: 'daily', priority: '1.0', lastmod: today },
  { path: 'properties', changefreq: 'daily', priority: '0.9', lastmod: today },
  { path: 'map', changefreq: 'weekly', priority: '0.7', lastmod: today },
];

async function fetchProperties() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_URL}/properties`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.properties || [];
  } catch (err) {
    console.warn('⚠️ Could not fetch live properties from API:', err.message);
    return null;
  }
}

// Fallback known property IDs if API is offline or unreachable during build
const fallbackProperties = [
  { _id: '6abf812a5f9d29cc5be0366d', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be0366f', updatedAt: '2026-10-07' },
  { _id: '6abf812a5f9d29cc5be03669', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be03665', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be03667', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be0366b', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be03663', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be03661', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be0365f', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be0365b', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be0365d', updatedAt: '2026-10-06' },
  { _id: '6abf812a5f9d29cc5be03659', updatedAt: '2026-10-06' },
];

async function generateSitemap() {
  const liveProperties = await fetchProperties();
  const properties = liveProperties && liveProperties.length > 0 ? liveProperties : fallbackProperties;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  staticRoutes.forEach(route => {
    const loc = route.path ? `${BASE_URL}/${route.path}` : `${BASE_URL}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${loc}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  });

  properties.forEach(p => {
    const mod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : today;
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/properties/${p._id}</loc>\n`;
    xml += `    <lastmod>${mod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>\n`;

  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf8');
  console.log(`✅ Generated sitemap.xml with ${staticRoutes.length + properties.length} URLs at ${publicPath}`);

  // Also update dist/sitemap.xml if dist directory exists
  const distDir = path.resolve(__dirname, '../dist');
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
  }
}

generateSitemap();

