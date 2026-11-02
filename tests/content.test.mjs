import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const copy = JSON.parse(await readFile(resolve(root, 'data/copy.en.json'), 'utf8'));
const suppliedCredentials = JSON.parse(await readFile(resolve(root, 'data/certificates.json'), 'utf8'));

test('each certificate card opens a matching local supporting document', async () => {
  for (const credential of copy.credentials) {
    assert.match(credential.asset, new RegExp(`^/certificates/${credential.id}\\.(webp|pdf)$`));
    assert.equal(credential.asset, suppliedCredentials.find(item => item.id === credential.id).asset);
    assert.ok((await stat(resolve(root, 'public', credential.asset.slice(1)))).size > 0);
  }
});

function strings(value, path = '') {
  if (typeof value === 'string') return [{ path, value }];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}.${key}`));
}

function safeExternalLink(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:', value);
  assert.equal(url.username, '', value);
  assert.equal(url.password, '', value);
  assert.ok(url.hostname && url.hostname !== 'localhost', value);
}

test('the complete owner-supplied project and credential collection is preserved', () => {
  assert.equal(copy.projects.length, 13);
  assert.equal(copy.credentials.length, 16);
  assert.equal(copy.skills.length, 6);
  assert.equal(copy.projects.filter(project => project.featured).length, 6);
  assert.equal(new Set(copy.projects.map(project => project.id)).size, copy.projects.length);
  assert.equal(new Set(copy.credentials.map(credential => credential.id)).size, copy.credentials.length);
  assert.ok(copy.projects.every(project => project.id && project.title && project.description && project.tech.length));
  assert.ok(copy.skills.every(group => group.name && group.description && group.items.length));
});

test('project destinations and profile links cannot use executable protocols or embedded credentials', () => {
  for (const project of copy.projects) {
    assert.ok(project.source || project.demo, project.id);
    for (const link of [project.source, project.demo].filter(Boolean)) safeExternalLink(link);
  }
  safeExternalLink(copy.profile.github);
  safeExternalLink(copy.profile.linkedin);
  assert.match(copy.profile.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});

test('all project images exist inside the public directory and concept art is identified', async () => {
  const publicRoot = resolve(root, 'public');
  for (const project of copy.projects.filter(project => project.image)) {
    assert.match(project.image, /^\/projects\/[a-z0-9-]+\.webp$/);
    const file = resolve(publicRoot, project.image.slice(1));
    assert.ok(file.startsWith(publicRoot + sep), project.image);
    assert.ok((await stat(file)).size > 0, project.image);
    assert.ok(project.imageAlt && project.imageCaption, project.id);
    assert.ok(project.imageWidth >= 960 && project.imageHeight > 0, project.id);
  }
  for (const id of ['legal', 'nwis']) {
    const project = copy.projects.find(item => item.id === id);
    assert.match(project.imageAlt, /concept illustration.*not a screenshot/i);
    assert.match(project.imageCaption, /concept illustration/i);
  }
});

test('certificate transcription remains faithful and duplicate Java evidence is not counted twice', () => {
  const fields = credential => ({ title: credential.title, issuer: credential.issuer, date: credential.date ?? null });
  assert.deepEqual(copy.credentials.map(fields), suppliedCredentials.map(fields));
  assert.equal(new Set(copy.credentials.map(credential => credential.title)).size, copy.credentials.length);
  assert.equal(copy.credentials.filter(credential => credential.title === 'Programming using Java').length, 1);
  const isro = copy.credentials.find(credential => credential.title.includes('Bharatiya Antariksh'));
  assert.equal(isro.category, 'Participation');
  const workshop = copy.credentials.find(credential => credential.title.includes('PowerBI Workshop'));
  assert.equal(workshop.issuer, 'OfficeMaster');
  const mit = copy.credentials.find(credential => credential.title.includes('MET Escape Room'));
  assert.ok(!/winner|runner/i.test(mit.title));
});

test('provided dates are real calendar dates without fabricated values for undated records', () => {
  for (const credential of copy.credentials) {
    if (!Object.hasOwn(credential, 'date')) continue;
    assert.match(credential.date, /^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(`${credential.date}T00:00:00Z`);
    assert.ok(Number.isFinite(date.valueOf()), credential.title);
    assert.equal(date.toISOString().slice(0, 10), credential.date);
  }
  for (const titlePart of ['Geographic Information Systems', 'Bharatiya Antariksh', 'DECODE SIH', 'MET Escape Room']) {
    assert.ok(!Object.hasOwn(copy.credentials.find(credential => credential.title.includes(titlePart)), 'date'));
  }
});

test('public copy has no encoding corruption or private paths', () => {
  for (const { path, value } of strings(copy)) {
    assert.ok(!value.includes('\uFFFD'), path);
    assert.ok(!/\w\?\w|\s\?\s|^\?/.test(value), `${path}: ${value}`);
    if (value.includes('?') && !value.startsWith('https://')) {
      assert.match(value, /^(?:Have|How|What|Who|Where|When|Why|Could|Can|Would|Ready)\b[^?]*\?$/, path);
    }
    assert.ok(!/C:\\Users\\|file:\/\/|CyberAI2026\/Award\/015/.test(value), path);
  }
});

test('the rendered sculpture fallback is web-readable without loading any video', async () => {
  const media = [['brand/kinetic-poster.webp', 'webp']];
  for (const [file, format] of media) {
    const bytes = await readFile(resolve(root, 'public', file));
    assert.ok(bytes.length > 0 && bytes.length < 4_000_000, file);
    if (format === 'mp4') assert.equal(bytes.toString('ascii', 4, 8), 'ftyp');
    if (format === 'webm') assert.equal(bytes.subarray(0, 4).toString('hex'), '1a45dfa3');
    if (format === 'webp') {
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    }
  }
});
