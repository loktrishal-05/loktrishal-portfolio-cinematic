import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL || 'http://127.0.0.1:8770';
await mkdir('artifacts', { recursive: true });
const report = { base, date: new Date().toISOString(), viewports: [], scenarios: [] };
const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function ready(page) {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('#project-list .project').length > 0);
}
try {
  for (const width of [360, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    const failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
    await page.addInitScript(() => {
      window.__lcp = 0;
      new PerformanceObserver(list => { window.__lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await ready(page);
    await page.waitForTimeout(700);
    assert.equal(await page.locator('#project-list .project').count(), 6);
    assert.equal(await page.locator('#credential-list .credential').count(), 16);
    const firstState = await page.locator('#hero-media').getAttribute('data-state');
    if (await page.locator('#film-skip').isVisible()) await page.locator('#film-skip').click();
    await page.locator('#show-projects').click();
    assert.equal(await page.locator('#project-list .project').count(), 13);
    await page.locator('#show-projects').click();
    await page.locator('#project-filters button').nth(1).click();
    assert.ok(await page.locator('#project-list .project').count() > 0);
    await page.locator('#project-filters button').first().click();
    if (width < 900) {
      await page.locator('#menu-toggle').click();
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    for (const section of ['#work', '#about', '#skills', '#credentials', '#contact']) {
      await page.locator(section).scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }
    for (const image of await page.locator('#project-list img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async img => { if (!img.complete) await img.decode().catch(() => {}); });
    }
    await page.evaluate(() => document.activeElement?.blur());
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(250);
    const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, lcpMs: window.__lcp }));
    const undersizedTargets = await page.locator('a,button').evaluateAll(nodes => nodes.flatMap(node => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 43.9 || rect.height < 43.9)
        ? [{ text: node.textContent.trim(), width: rect.width, height: rect.height }] : [];
    }));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await page.screenshot({ path: `artifacts/${width}-page.png`, fullPage: true });
    await page.locator('#top').screenshot({ path: `artifacts/${width}-hero.png` });
    if ([360, 1280].includes(width)) {
      for (const section of ['work', 'about', 'skills', 'credentials', 'contact']) {
        await page.evaluate(() => document.activeElement?.blur());
        await page.locator(`#${section}`).screenshot({ path: `artifacts/${width}-${section}.png` });
      }
    }
    report.viewports.push({ width, geometry, firstState, errors, failures, undersizedTargets, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    await context.close();
  }
  for (const scenario of ['reduced-motion', 'save-data', 'missing-video', 'missing-copy', 'keyboard', 'slow-3g']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: scenario === 'reduced-motion' ? 'reduce' : 'no-preference' });
    const page = await context.newPage();
    const videoRequests = [];
    page.on('request', request => { if (/hero-entry\.(mp4|webm)/.test(request.url())) videoRequests.push(request.url()); });
    if (scenario === 'save-data') await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
    if (scenario === 'missing-video') await page.route('**/media/hero-entry.*', route => route.abort());
    if (scenario === 'missing-copy') await page.route('**/data/copy.en.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
    if (scenario === 'slow-3g') {
      const session = await context.newCDPSession(page);
      await session.send('Network.enable');
      await session.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50000, uploadThroughput: 50000, connectionType: 'cellular3g' });
    }
    const start = Date.now();
    if (scenario === 'missing-copy') {
      await page.goto(base);
      await page.locator('#content-error').waitFor({ state: 'visible' });
      assert.ok(await page.locator('#hero-title').isVisible());
      await page.unroute('**/data/copy.en.json');
      await page.locator('#content-retry').click();
      await page.waitForFunction(() => document.querySelectorAll('#project-list .project').length === 6);
    } else {
      await ready(page);
    }
    await page.waitForTimeout(scenario === 'missing-video' ? 1600 : 200);
    if (scenario === 'slow-3g') {
      await page.waitForFunction(() => document.querySelector('#hero-media').dataset.state !== 'loading', { timeout: 17000 });
      assert.ok(await page.locator('#hero-title').isVisible());
    }
    const state = await page.locator('#hero-media').getAttribute('data-state');
    const video = await page.locator('#hero-video').evaluate(v => ({ paused: v.paused, currentTime: v.currentTime, hasSource: !!v.querySelector('source') || !!v.getAttribute('src') }));
    if (['reduced-motion', 'save-data'].includes(scenario)) {
      assert.ok(video.paused);
      assert.equal(videoRequests.length, 0, 'Static preferences should avoid video downloads');
    }
    let keyboard;
    if (scenario === 'keyboard') {
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.keyboard.press('Tab');
      keyboard = await page.evaluate(() => ({ text: document.activeElement.textContent.trim(), visibleFocus: document.activeElement.matches(':focus-visible'), outline: getComputedStyle(document.activeElement).outlineStyle }));
      assert.ok(keyboard.text.includes('Skip to content'));
      assert.ok(keyboard.visibleFocus && keyboard.outline !== 'none');
      await page.keyboard.press('Enter');
      assert.ok((await page.evaluate(() => location.hash)).includes('main'));
    }
    if (scenario === 'missing-video') {
      assert.ok(await page.locator('#hero-title').isVisible());
      assert.ok(await page.locator('#hero-poster').isVisible());
      assert.ok(video.paused);
    }
    await page.screenshot({ path: `artifacts/${scenario}.png` });
    report.scenarios.push({ scenario, state, video, videoRequests: videoRequests.length, readyMs: Date.now() - start, keyboard, passed: true });
    await context.close();
  }
} finally {
  await writeFile('artifacts/qa-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
const issues = report.viewports.flatMap(v => [
  ...(v.geometry.document > v.width ? [`${v.width}px horizontal overflow`] : []),
  ...v.errors.map(e => `${v.width}px console: ${e}`),
  ...v.failures.map(f => `${v.width}px HTTP ${f.status} ${f.url}`),
  ...v.undersizedTargets.map(t => `${v.width}px undersized target ${t.text} (${t.width}x${t.height})`),
  ...v.violations.map(a => `${v.width}px ${a.id}`),
]);
console.log(JSON.stringify({ viewports: report.viewports.map(v => ({ width: v.width, ...v.geometry, violations: v.violations.length, errors: v.errors.length })), scenarios: report.scenarios, issues }, null, 2));
if (issues.length) process.exitCode = 1;
