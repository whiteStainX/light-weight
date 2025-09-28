import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { __testing__ } from './useLiftAnimation.js'

const {
  cycleScalar,
  cycleDirection,
  solveSquat,
  solveBench,
  solveDeadlift,
  buildSkeletonInfo,
  computeJointOffsets,
  normaliseProgress,
} = __testing__

describe('useLiftAnimation motion solvers', () => {
  it('normalises progress into a 0-1 range', () => {
    assert.equal(normaliseProgress(0), 0)
    assert.ok(Math.abs(normaliseProgress(1.2) - 0.2) < 1e-9)
    assert.ok(Math.abs(normaliseProgress(-0.25) - 0.75) < 1e-9)
  })

  it('returns a smooth cosine-driven cycle', () => {
    assert.equal(cycleScalar(0), 0)
    assert.ok(cycleScalar(0.5) > 0.99)
    assert.equal(Math.round(cycleDirection(0.25)), 1)
    assert.equal(Math.round(cycleDirection(0.75)), -1)
  })

  it('keeps the squat bar stacked over the mid-foot', () => {
    const base = solveSquat(0)
    const depth = solveSquat(0.5)

    assert.equal(Math.round(base.positions.foot.x), Math.round(depth.positions.foot.x))
    assert.equal(Math.round(base.bar.x), Math.round(depth.bar.x))
    assert.ok(depth.positions.knee.y > depth.positions.hip.y)
  })

  it('responds to squat setup parameter changes', () => {
    const neutral = solveSquat(0.5)
    const wide = solveSquat(0.5, { kneeTravel: 14, hipSetback: 26 })

    assert.ok(wide.positions.knee.x > neutral.positions.knee.x)
    assert.ok(wide.positions.hip.x < neutral.positions.hip.x)
  })

  it('keeps the bench press bar path vertical', () => {
    const touch = solveBench(0)
    const lockout = solveBench(0.5)

    assert.equal(Math.round(touch.bar.x), Math.round(lockout.bar.x))
    assert.ok(touch.bar.y > lockout.bar.y)
  })

  it('updates bench geometry with setup parameters', () => {
    const close = solveBench(0, { gripSpan: 48 })
    const wide = solveBench(0, { gripSpan: 64 })

    assert.ok(wide.positions.grip.x < close.positions.grip.x)
    assert.ok(wide.positions.elbow.x < close.positions.elbow.x)
  })

  it('keeps the deadlift grip centred on the bar', () => {
    const start = solveDeadlift(0)
    const top = solveDeadlift(0.5)

    assert.equal(Math.round(start.positions.grip.x), Math.round(start.bar.x))
    assert.equal(Math.round(top.positions.grip.x), Math.round(top.bar.x))
    assert.ok(top.positions.hip.y < start.positions.hip.y)
  })

  it('recomputes the deadlift wedge with new parameters', () => {
    const standard = solveDeadlift(0)
    const deficit = solveDeadlift(0, { startClearance: 7 })

    assert.ok(deficit.bar.y < standard.bar.y)
    assert.ok(deficit.positions.hip.y < standard.positions.hip.y)
  })

  it('produces zero offsets at the neutral squat setup', () => {
    const info = buildSkeletonInfo('Squat')
    const solution = solveSquat(0)
    const offsets = computeJointOffsets(info, solution.positions)

    Object.values(offsets).forEach((value) => {
      assert.ok(Math.abs(value) < 1e-6)
    })
  })
})

