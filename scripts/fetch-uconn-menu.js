#!/usr/bin/env node
/**
 * Fetches today's Union Street Market menu from UConn Dining and writes
 * data/union-menu.json. Run with: node scripts/fetch-uconn-menu.js
 *
 * To keep menus updated:
 * - Run this script daily (e.g. cron: 0 6 * * * node /path/to/scripts/fetch-uconn-menu.js)
 * - Or use the "View live menu" page (union-live.html) which loads UConn's site directly.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nutritionanalysis.dds.uconn.edu/shortmenu.aspx?sName=UCONN+Dining+Services&locationNum=43&locationName=Union+Street+Market&naFlag=1&WeeksMenus=This+Week%27s+Menus&myaction=read';

function getTodayParam() {
  const d = new Date();
  const dt = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
  return '&dtdate=' + encodeURIComponent(dt);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CampusCravings/1.0' } }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function parseMenu(html) {
  const sections = [];
  // Match section headers like "-- TOSTADA BURRITOS --" or "-- POMPEII PIZZA --"
  const sectionRegex = /--\s+([A-Z\s&\\]+)\s+--/g;
  // Match lines that look like "Item Name $X.XX" (price at end)
  const priceRegex = /\$(\d+\.?\d*)\s*$/m;

  let match;
  const sectionStarts = [];
  while ((match = sectionRegex.exec(html)) !== null) {
    sectionStarts.push({ name: match[1].trim(), index: match.index });
  }

  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i].index;
    const end = sectionStarts[i + 1] ? sectionStarts[i + 1].index : html.length;
    const block = html.slice(start, end);
    const items = [];
    // Split by common line boundaries and find lines with a price
    const lines = block.split(/\n|<br\s*\/?>/gi).map(s => s.replace(/<[^>]+>/g, ' ').trim()).filter(Boolean);
    for (const line of lines) {
      const priceMatch = line.match(priceRegex);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        const name = line.replace(/\s*\$\d+\.?\d*\s*$/, '').replace(/\s+/g, ' ').trim();
        if (name.length > 2 && name !== sectionStarts[i].name) {
          items.push({ name, price });
        }
      }
    }
    if (items.length > 0 || sectionStarts[i].name.includes('POMPEII') || sectionStarts[i].name.includes('TOSTADA') || sectionStarts[i].name.includes('GOOD EARTH') || sectionStarts[i].name.includes('SOUP')) {
      sections.push({ section: sectionStarts[i].name, items });
    }
  }

  return { fetched: new Date().toISOString(), sections };
}

async function main() {
  const url = BASE_URL + getTodayParam();
  console.log('Fetching:', url);
  const html = await fetch(url);
  const data = parseMenu(html);
  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'union-menu.json');
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
