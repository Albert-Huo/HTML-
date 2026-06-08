#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import http from 'http';
import { URL } from 'url';
import { chromium } from 'playwright';

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return fallback;
  return process.argv[i + 1];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseFiles(v) {
  if (!v) return [];
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const rootDir = path.resolve(arg('--root', process.cwd()));
const outDir = path.resolve(arg('--out', path.join(rootDir, 'visual-regression-output')));
const files = parseFiles(arg('--files', ''));

if (!files.length) {
  console.error('No files given. Example:');
  console.error(
    'node scripts/visual_regression_capture.mjs --root "/path/to/htmls" --out "/path/to/out" --files "初中物理实验14.html,初中物理实验15.html"'
  );
  process.exit(2);
}

fs.mkdirSync(outDir, { recursive: true });

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url, 'http://127.0.0.1');
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '');
    if (!rel) {
      res.statusCode = 200;
      res.setHeader('content-type', 'text/plain; charset=utf-8');
      res.end('ok');
      return;
    }
    const abs = path.resolve(rootDir, rel);
    if (!abs.startsWith(rootDir)) {
      res.statusCode = 403;
      res.end('forbidden');
      return;
    }
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      res.statusCode = 404;
      res.end('not found');
      return;
    }
    res.statusCode = 200;
    res.setHeader('content-type', contentType(abs));
    fs.createReadStream(abs).pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
});

const views = [
  { name: 'desktop', width: 1366, height: 768, isMobile: false, hasTouch: false, deviceScaleFactor: 2 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
];

async function waitDoneMask(page, timeoutMs = 55000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ok = await page
      .evaluate(() => {
        const el = document.querySelector('#doneMask');
        if (!el) return false;
        const st = getComputedStyle(el);
        return st.display !== 'none' && st.visibility !== 'hidden';
      })
      .catch(() => false);
    if (ok) return { ok: true, ms: Date.now() - start };
    await sleep(300);
  }
  return { ok: false, ms: timeoutMs };
}

async function clickIf(page, selector) {
  const el = await page.$(selector);
  if (!el) return false;
  try {
    await page.click(selector, { timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

async function gatherLayout(page) {
  return page.evaluate(() => {
    function rectOf(sel) {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }
    function overlap(a, b) {
      if (!a || !b) return 0;
      const w = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
      const h = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
      return Math.round(w * h);
    }
    const lab = rectOf('#labArea');
    const c = rectOf('#controlDock');
    const d = rectOf('#dataDock');
    return {
      overlapControlLab: overlap(c, lab),
      overlapDataLab: overlap(d, lab),
      overlapControlData: overlap(c, d)
    };
  });
}

const report = {
  runAt: new Date().toISOString(),
  rootDir,
  outDir,
  files: []
};

let browser;
try {
  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', (err) => (err ? reject(err) : resolve()));
  });
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  report.base = base;

  browser = await chromium.launch({ headless: true });

  for (const file of files) {
    const url = `${base}/${encodeURIComponent(file)}`;
    const fileReport = { file, url, views: [] };

    for (const vp of views) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        hasTouch: vp.hasTouch,
        deviceScaleFactor: vp.deviceScaleFactor,
        locale: 'zh-CN'
      });
      const page = await ctx.newPage();
      const viewReport = { viewport: vp.name, width: vp.width, height: vp.height };

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(1800);

        const p1 = path.join(outDir, `${path.basename(file, '.html')}_${vp.name}_01_initial.png`);
        await page.screenshot({ path: p1, fullPage: true });
        viewReport.initial = p1;

        viewReport.dataToggleClicked = await clickIf(page, '#dataToggleBtn');
        await sleep(700);
        const p2 = path.join(outDir, `${path.basename(file, '.html')}_${vp.name}_02_data_open.png`);
        await page.screenshot({ path: p2, fullPage: true });
        viewReport.dataOpen = p2;

        viewReport.autoBtnClicked = await clickIf(page, '#autoDemoBtn');
        viewReport.autoDone = viewReport.autoBtnClicked ? await waitDoneMask(page, 55000) : { ok: false, ms: 0 };
        await sleep(700);
        const p3 = path.join(outDir, `${path.basename(file, '.html')}_${vp.name}_03_auto_end.png`);
        await page.screenshot({ path: p3, fullPage: true });
        viewReport.autoEnd = p3;

        viewReport.layout = await gatherLayout(page);
      } catch (e) {
        viewReport.error = String(e && e.message ? e.message : e);
      }

      await ctx.close();
      fileReport.views.push(viewReport);
    }

    report.files.push(fileReport);
  }
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => server.close(() => resolve()));
}

const reportPath = path.join(outDir, 'report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log('DONE', reportPath);
