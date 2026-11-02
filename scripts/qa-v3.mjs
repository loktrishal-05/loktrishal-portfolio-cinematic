import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL || 'http://127.0.0.1:8770';
await mkdir('artifacts/v3', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-unsafe-swiftshader'] });
const report = { base, widths: [], certificates: [] };
try {
  for (const width of [360, 768, 1280, 1920]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(base);
    await page.waitForFunction(() => document.body.dataset.ready === 'true');
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `artifacts/v3/${width}-hero.png` });
    assert.equal(await page.locator('.hero-name').evaluate(n => getComputedStyle(n).opacity), '1');
    assert.equal(await page.locator('.hero-terminal').isVisible(), true);
    await page.locator('#skills').scrollIntoViewIfNeeded();
    const summary = page.locator('.skill summary').first();
    await summary.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('.skill').first().getAttribute('open'), '');
    assert.ok(await page.locator('.skill[open] .skill-tags').isVisible());
    await page.locator('#skills').screenshot({ path: `artifacts/v3/${width}-skills.png` });
    await page.locator('#credentials').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    assert.equal(await page.locator('.credential').count(), 16);
    await page.locator('#credentials').screenshot({ path: `artifacts/v3/${width}-certificates.png` });
    const before = await page.locator('#credential-list').evaluate(n => n.scrollLeft);
    await page.locator('#certificate-next').click();
    await page.waitForTimeout(800);
    assert.ok(await page.locator('#credential-list').evaluate(n => n.scrollLeft) > before);
    const certificateBounds = await page.locator('.credential').evaluateAll(nodes => nodes.map(n => ({ height: n.clientHeight, scrollHeight: n.scrollHeight })));
    assert.ok(certificateBounds.every(b => b.scrollHeight <= b.height + 2), JSON.stringify(certificateBounds));
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    report.widths.push({ width, errors, overflow, axe: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
    assert.equal(errors.length, 0);
    assert.equal(overflow, false);
    assert.equal(axe.violations.length, 0, JSON.stringify(report.widths.at(-1)));
    if (width === 1280) {
      for (const href of await page.locator('.credential').evaluateAll(nodes => nodes.map(n => n.href))) {
        const response = await page.request.get(href);
        assert.equal(response.ok(), true, href);
        report.certificates.push({ path: new URL(href).pathname, status: response.status() });
      }
      await page.evaluate(() => { const t = window.__portfolio.scroll.getById('gallery'); window.scrollTo(0, t.start); });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'artifacts/v3/1280-work.png' });
    }
    await context.close();
  }
  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await reduced.goto(base); await reduced.waitForFunction(() => document.body.dataset.ready === 'true');
  assert.equal(await reduced.locator('#scene-wrap').getAttribute('data-scene-state'), 'static');
  assert.equal(await reduced.locator('.skill').count(), 6);
  report.reducedMotion = 'passed';
  await reduced.close();
} finally {
  await writeFile('artifacts/v3/report.json', JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
