import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoplay, createFilmController } from '../app.js';

class Control extends EventTarget {
  hidden = false;
  dataset = {};
  attributes = new Map();
  span = { textContent: '' };
  path = { setAttribute() {} };
  setAttribute(key, value) { this.attributes.set(key, value); }
  getAttribute(key) { return key === 'src' ? this.src || null : this.attributes.get(key); }
  removeAttribute(key) { if (key === 'src') this.src = ''; else this.attributes.delete(key); }
  querySelector(selector) { return selector === 'span' ? this.span : this.path; }
}
function fixture(play = () => Promise.resolve(), timeoutMs = 100) {
  const video = new Control();
  Object.assign(video, { paused: true, currentTime: 0, canPlayType: () => 'probably', load() {}, pause() { this.paused = true; }, play() { this.paused = false; return play(); } });
  const elements = Object.fromEntries(['picture', 'container', 'toggle', 'skip', 'replay', 'status', 'progress'].map(key => [key, new Control()]));
  const labels = { pause: 'Pause', play: 'Play', filmFinished: 'Finished', filmUnavailable: 'Unavailable' };
  let seen = 0;
  const controller = createFilmController({ video, ...elements, labels, onSeen: () => seen++, timeoutMs });
  return { ...elements, video, controller, seen: () => seen };
}

test('autoplay respects motion, data, session and mobile choices', () => {
  assert.equal(shouldAutoplay(), true);
  for (const option of ['reducedMotion', 'saveData', 'seen', 'mobile']) {
    assert.equal(shouldAutoplay({ [option]: true }), false, option);
  }
});

test('play, pause, resume and skip preserve controls and finish on the matching final poster', async () => {
  const f = fixture();
  try {
    await f.controller.play();
    assert.equal(f.controller.getState(), 'playing');
    assert.equal(f.picture.src, '/media/hero-poster.webp');
    assert.equal(f.skip.hidden, false);
    f.video.currentTime = 2;
    f.controller.pause();
    assert.equal(f.controller.getState(), 'paused');
    await f.controller.play();
    assert.equal(f.video.currentTime, 2);
    f.controller.finish();
    assert.equal(f.controller.getState(), 'ended');
    assert.equal(f.picture.src, '/media/hero-end.webp');
    assert.equal(f.replay.hidden, false);
    assert.ok(f.seen() > 0);
  } finally { f.controller.destroy(); }
});

test('autoplay refusal and a decoder error keep the poster available', async () => {
  const f = fixture(() => Promise.reject(new Error('NotAllowedError')));
  try {
    await f.controller.play();
    assert.equal(f.controller.getState(), 'poster');
    assert.equal(f.picture.src, '/media/hero-end.webp');
    assert.equal(f.status.textContent, 'Unavailable');
    f.video.dispatchEvent(new Event('error'));
    assert.equal(f.controller.getState(), 'poster');
  } finally { f.controller.destroy(); }
});

test('skipping a pending play prevents a late promise from restarting the film', async () => {
  let resolve;
  const f = fixture(() => new Promise(done => { resolve = done; }));
  try {
    const pending = f.controller.play();
    f.controller.finish();
    resolve();
    await pending;
    assert.equal(f.controller.getState(), 'ended');
    assert.equal(f.video.paused, true);
  } finally { f.controller.destroy(); }
});

test('a stalled download exits loading and does not create an infinite loader', async () => {
  const f = fixture(() => new Promise(() => {}), 5);
  try {
    void f.controller.play();
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(f.controller.getState(), 'poster');
    assert.equal(f.video.src, '');
    assert.equal(f.status.textContent, 'Unavailable');
  } finally { f.controller.destroy(); }
});
