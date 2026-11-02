import test from 'node:test';
import assert from 'node:assert/strict';
import { motionPolicy } from '../motion.js';
import { scenePose } from '../scene.js';

test('reduced motion and data saving avoid WebGL downloads; narrow layouts avoid pinned scroll', () => {
  assert.deepEqual(motionPolicy({ reducedMotion: true }), { webgl: false, smooth: false, pinned: false });
  assert.equal(motionPolicy({ saveData: true }).webgl, false);
  assert.equal(motionPolicy({ width: 360 }).pinned, false);
  assert.equal(motionPolicy({ width: 1280 }).pinned, true);
});

test('scene choreography clamps invalid scroll values and has a stable assembled/exploded range', () => {
  assert.equal(scenePose(-2).progress, 0);
  assert.equal(scenePose(4).progress, 1);
  assert.equal(scenePose(NaN).progress, 0);
  assert.equal(scenePose(0).open, 0);
  assert.equal(scenePose(1).open, 1);
  assert.ok(scenePose(1).distance < scenePose(0).distance);
});
