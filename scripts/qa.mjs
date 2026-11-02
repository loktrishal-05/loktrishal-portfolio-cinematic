import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:8770';
await mkdir('artifacts/v2', { recursive: true });
const report = { base, date: new Date().toISOString(), viewports: [], scenarios: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-unsafe-swiftshader'] });
async function ready(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.ready === 'true', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
}
async function instant(page, y) {
  await page.evaluate(y => { window.scrollTo({ top: y, behavior: 'instant' }); }, y);
  await page.waitForTimeout(900);
}
try {
  for (const width of [360, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    const errors = [], failed = [], video = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) failed.push({ url: r.url(), status: r.status() }); });
    page.on('request', r => { if (/\.(mp4|webm)(?:\?|$)/.test(r.url())) video.push(r.url()); });
    await page.addInitScript(() => {
      window.__lcp = 0;
      new PerformanceObserver(list => { window.__lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await ready(page);
    assert.equal(await page.locator('video').count(), 0);
    assert.equal(await page.locator('#project-list .project').count(), 6);
    assert.equal(await page.locator('#credential-list .credential').count(), 16);
    const scene = await page.locator('#scene-wrap').getAttribute('data-scene-state');
    const triggers = await page.evaluate(() => window.__portfolio.scroll.getAll().map(t => t.vars.id).filter(Boolean));
    assert.equal(scene, 'ready');
    assert.equal(triggers.includes('hero'), width > 800);
    assert.equal(triggers.includes('gallery'), width > 800);
    await page.screenshot({ path: `artifacts/v2/${width}-hero.png` });
    await page.locator('#scene-toggle').click();
    assert.equal(await page.locator('#scene-toggle').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => window.__portfolio.sculpture.getState().paused), true);
    await page.locator('#scene-toggle').click();
    assert.equal(await page.evaluate(() => window.__portfolio.sculpture.getState().paused), false);
    if (width > 800) {
      const hero = await page.evaluate(() => { const t = window.__portfolio.scroll.getById('hero'); return { start: t.start, end: t.end }; });
      for (const p of [0.45, 0.9]) {
        await instant(page, hero.start + (hero.end - hero.start) * p);
        await page.screenshot({ path: `artifacts/v2/${width}-hero-${p}.png` });
      }
      const gallery = await page.evaluate(() => { const t = window.__portfolio.scroll.getById('gallery'); return { start: t.start, end: t.end }; });
      for (const p of [0, 0.5, 0.98]) {
        await instant(page, gallery.start + (gallery.end - gallery.start) * p);
        await page.screenshot({ path: `artifacts/v2/${width}-gallery-${p}.png` });
      }
    } else {
      await page.locator('#menu-toggle').click();
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    await page.locator('#show-projects').click();
    assert.equal(await page.locator('#archive-list .archive-row').count(), 13);
    await page.locator('#project-filters button').nth(1).click();
    assert.ok(await page.locator('#archive-list .archive-row').count() > 0);
    await page.locator('#project-filters button').first().click();
    await page.locator('#show-projects').click();
    for (const section of ['about', 'skills', 'credentials', 'contact']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.evaluate(() => document.activeElement?.blur());
      if (width === 360 || width === 1280) await page.locator(`#${section}`).screenshot({ path: `artifacts/v2/${width}-${section}.png` });
    }
    const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, lcpMs: window.__lcp }));
    const smallTargets = await page.locator('a,button').evaluateAll(nodes => nodes.flatMap(node => {
      const r = node.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < 43.9 || r.height < 43.9) ? [{ text: node.textContent.trim(), width: r.width, height: r.height }] : [];
    }));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.equal(video.length, 0);
    report.viewports.push({ width, geometry, scene, triggers, errors, failed, videoRequests: video.length, smallTargets, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    await context.close();
  }
  for (const scenario of ['reduced-motion', 'save-data', 'missing-3d', 'missing-copy', 'keyboard']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, reducedMotion: scenario === 'reduced-motion' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const chunks = [];
    page.on('request', r => { if (/\/scene-.*\.js/.test(r.url())) chunks.push(r.url()); });
    if (scenario === 'save-data') await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
    if (scenario === 'missing-3d') await page.route('**/scene-*.js', route => route.abort());
    if (scenario === 'missing-copy') {
      await page.route('**/data/copy.en.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
      await page.goto(base); await page.locator('#content-error').waitFor({ state: 'visible' });
      assert.ok(await page.locator('#hero-title').isVisible());
      await page.unroute('**/data/copy.en.json'); await page.locator('#content-retry').click();
      await page.waitForFunction(() => document.body.dataset.ready === 'true');
    } else await ready(page);
    const state = await page.locator('#scene-wrap').getAttribute('data-scene-state');
    if (['reduced-motion', 'save-data'].includes(scenario)) { assert.equal(chunks.length, 0); assert.equal(state, 'static'); }
    if (scenario === 'missing-3d') { assert.equal(state, 'fallback'); assert.ok(await page.locator('#scene-poster').isVisible()); }
    if (scenario === 'reduced-motion') assert.equal(await page.evaluate(() => window.__portfolio.scroll.getAll().length), 0);
    if (scenario === 'keyboard') {
      await page.keyboard.press('Tab');
      const focus = await page.evaluate(() => ({ text: document.activeElement.textContent, visible: document.activeElement.matches(':focus-visible') }));
      assert.ok(focus.text.includes('Skip to work') && focus.visible);
      await page.keyboard.press('Enter'); assert.equal(await page.evaluate(() => location.hash), '#work');
    }
    await page.screenshot({ path: `artifacts/v2/${scenario}.png` });
    report.scenarios.push({ scenario, state, sceneRequests: chunks.length, passed: true });
    await context.close();
  }
} finally {
  await writeFile('artifacts/v2/qa-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
const issues = report.viewports.flatMap(v => [
  ...(v.geometry.document > v.width ? [`${v.width}px overflow`] : []),
  ...v.errors.map(e => `${v.width}px: ${e}`), ...v.failed.map(e => `${v.width}px HTTP ${e.status}`),
  ...v.smallTargets.map(t => `${v.width}px small target ${t.text}`), ...v.violations.map(a => `${v.width}px ${a.id}`),
]);
console.log(JSON.stringify({ viewports: report.viewports.map(v => ({ width: v.width, ...v.geometry, scene: v.scene, violations: v.violations.length, errors: v.errors.length, targets: v.smallTargets })), scenarios: report.scenarios, issues }, null, 2));
if (issues.length) process.exitCode = 1;
