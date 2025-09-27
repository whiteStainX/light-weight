import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { liftData } from '../lib/liftData.js'
import {
  resolveSkeleton,
  computeJointPositions,
  estimateTorque,
  toRadians,
} from './useKinematics.js'

const EPS = 1e-6
const createZeroOffsets = (skeleton) =>
  Object.fromEntries(Object.keys(skeleton.defaultAngles).map((j) => [j, 0]))

describe('resolveSkeleton', () => {
  it('detects hip as the squat root joint', () => {
    const s = resolveSkeleton('Squat')
    assert.equal(s.root, 'hip')
  })

  it('detects shoulder as the bench root joint', () => {
    const s = resolveSkeleton('Bench')
    assert.equal(s.root, 'shoulder')
  })
})

describe('computeJointPositions', () => {
  it('reconstructs base coordinates with zero offsets', () => {
    Object.keys(liftData).forEach((lift) => {
      const s = resolveSkeleton(lift)
      const zero = createZeroOffsets(s)
      const root = s.basePath[s.root]
      const pos = computeJointPositions(s, zero, root, {})

      Object.entries(s.basePath).forEach(([joint, base]) => {
        const p = pos[joint]
        assert.ok(p, `missing point for ${joint}`)
        assert.ok(Math.abs(p.x - base.x) < EPS, `${lift} ${joint} x mismatch`)
        assert.ok(Math.abs(p.y - base.y) < EPS, `${lift} ${joint} y mismatch`)
      })
    })
  })

  it('shifts distal joints when an angle offset is applied', () => {
    const s = resolveSkeleton('Squat')
    const offsets = createZeroOffsets(s)
    offsets.knee = toRadians(10)

    const pos = computeJointPositions(s, offsets, s.basePath[s.root], {})
    assert.ok(Math.abs(pos.foot.x - s.basePath.foot.x) > EPS, 'foot x unchanged')
    assert.ok(Math.abs(pos.foot.y - s.basePath.foot.y) > EPS, 'foot y unchanged')
  })
})

describe('estimateTorque', () => {
  it('reports larger torque when the bar drifts forward', () => {
    const s = resolveSkeleton('Deadlift')
    const zero = createZeroOffsets(s)
    const pos = computeJointPositions(s, zero, s.basePath[s.root], {})

    const neutral = estimateTorque(pos, s.basePath.bar)
    const forward = estimateTorque(pos, { ...s.basePath.bar, x: s.basePath.bar.x + 30 })

    assert.ok(forward.total > neutral.total)
    assert.ok(forward.perJoint.hip > neutral.perJoint.hip)
  })
})
