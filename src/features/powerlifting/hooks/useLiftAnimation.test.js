import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { __testing__ } from './useLiftAnimation.js'

const { PROFILES, interpolateFrame, normaliseProgress } = __testing__

describe('useLiftAnimation helpers', () => {
  it('normalises progress into a 0-1 range', () => {
    assert.equal(normaliseProgress(0), 0)
    assert.ok(Math.abs(normaliseProgress(1.2) - 0.2) < 1e-9)
    assert.ok(Math.abs(normaliseProgress(-0.25) - 0.75) < 1e-9)
  })

  it('interpolates squat profile start and mid keyframes', () => {
    const squatProfile = PROFILES.Squat
    const startFrame = interpolateFrame(squatProfile, 0)
    assert.deepEqual(startFrame.joints, { hip: 0, knee: 0, shoulder: 0 })
    assert.deepEqual(startFrame.bar, { x: 0, y: 0 })

    const midway = interpolateFrame(squatProfile, 0.275)
    assert.ok(midway.joints.hip > 0 && midway.joints.hip < 32)
    assert.ok(midway.joints.knee > 0 && midway.joints.knee < 52)
    assert.ok(midway.bar.y > 0 && midway.bar.y < 34)
  })

  it('loops smoothly across the final segment', () => {
    const deadliftProfile = PROFILES.Deadlift
    const nearEnd = interpolateFrame(deadliftProfile, 0.99)
    const wrap = interpolateFrame(deadliftProfile, 1.01)

    assert.ok(Math.abs(nearEnd.joints.hip - wrap.joints.hip) < 5)
    assert.ok(Math.abs(nearEnd.bar.y - wrap.bar.y) < 5)
  })
})

