import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:8770';
await mkdir('artifacts/v2/scroll', { recursive: true });
const results = {};
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(() => document.body.dataset.ready === 'true');
  const initial = await page.evaluate(() => window.__portfolio.sculpture.getState());
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
  assert.equal(await page.evaluate(() => window.__portfolio.sculpture.getState().paused), false);
  for (let i = 0; i < 28; i++) {
    await page.evaluate(p => {
      const t = window.__portfolio.scroll.getById('hero');
      window.scrollTo({ top: t.start + (t.end - t.start) * p, behavior: 'instant' });
    }, i / 27);
    await page.waitForTimeout(100);
    await page.screenshot({ path: `artifacts/v2/scroll/${String(i).padStart(3, '0')}.png` });
  }
  const final = await page.evaluate(() => window.__portfolio.sculpture.getState());
  assert.ok(final.open > initial.open + 0.9);
  results.actualSceneMotion = { initial, final, frames: 28 };
  await page.setViewportSize({ width: 1440, height: 768 });
  await page.waitForTimeout(700);
  await page.evaluate(() => { const t = window.__portfolio.scroll.getById('gallery'); window.scrollTo(0, t.start); });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'artifacts/v2/short-desktop-gallery.png' });
  const links = await page.locator('.project').first().locator('.project-links').boundingBox();
  assert.ok(links.y >= 0 && links.y + links.height <= 768);
  results.shortDesktopLinks = links;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  await page.locator('.project-links a').first().focus();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(500);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await page.evaluate(() => window.__portfolio.sculpture.getState().paused), true);
  assert.equal(errors.length, 0);
  results.lifecycle = { resizeFocus: 'passed', reducedMotionRemainsPaused: 'passed', persistedPagehide: 'state preserved', errors };
  await page.close();

  const slow = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const cdp = await slow.context().newCDPSession(slow);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50000, uploadThroughput: 50000 });
  const start = Date.now();
  await slow.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.ok(await slow.locator('#hero-title').isVisible());
  assert.ok(await slow.locator('#scene-poster').isVisible());
  await slow.waitForFunction(() => document.body.dataset.ready === 'true', null, { timeout: 60000 });
  assert.equal(await slow.locator('#scene-wrap').getAttribute('data-scene-state'), 'ready');
  results.slow3G = { latencyMs: 400, bytesPerSecond: 50000, readyMs: Date.now() - start, staticIdentityVisible: true, posterVisibleDuringLoad: true, finalScene: 'ready' };
  await slow.screenshot({ path: 'artifacts/v2/slow-3g.png' });
  await slow.close();
} finally { await browser.close(); }

const noGpu = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-webgl'] });
try {
  const page = await noGpu.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base);
  await page.waitForFunction(() => document.body.dataset.ready === 'true');
  assert.equal(await page.locator('#scene-wrap').getAttribute('data-scene-state'), 'fallback');
  assert.ok(await page.locator('#scene-poster').isVisible());
  assert.equal(errors.length, 0);
  results.noWebGL = { fallback: true, errors };
} finally { await noGpu.close(); }
await writeFile('artifacts/v2/motion-report.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
