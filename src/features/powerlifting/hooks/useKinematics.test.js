import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { liftData } from '../lib/liftData.js'
import { __testing__ } from './useKinematics.js'

const { resolveSkeleton, computeJointPositions, estimateTorque, toRadians } = __testing__

const createZeroOffsets = (skeleton) =>
  Object.fromEntries(Object.keys(skeleton.defaultAngles).map((joint) => [joint, 0]))

describe('resolveSkeleton', () => {
  it('detects hip as the squat root joint', () => {
    const skeleton = resolveSkeleton('Squat')
    assert.equal(skeleton.root, 'hip')
  })

  it('detects shoulder as the bench root joint', () => {
    const skeleton = resolveSkeleton('Bench')
    assert.equal(skeleton.root, 'shoulder')
  })
})

describe('computeJointPositions', () => {
  it('reconstructs base coordinates with zero offsets', () => {
    Object.keys(liftData).forEach((lift) => {
      const skeleton = resolveSkeleton(lift)
      const zeroOffsets = createZeroOffsets(skeleton)
      const baseRoot = skeleton.basePath[skeleton.root]
      const positions = computeJointPositions(skeleton, zeroOffsets, baseRoot, {})

      Object.entries(skeleton.basePath).forEach(([joint, basePoint]) => {
        const computed = positions[joint]
        assert.ok(computed, `missing point for ${joint}`)
        assert.ok(Math.abs(computed.x - basePoint.x) < 1e-6, `${lift} ${joint} x mismatch`)
        assert.ok(Math.abs(computed.y - basePoint.y) < 1e-6, `${lift} ${joint} y mismatch`)
      })
    })
  })

  it('shifts distal joints when an angle offset is applied', () => {
    const skeleton = resolveSkeleton('Squat')
    const offsets = createZeroOffsets(skeleton)
    offsets.knee = toRadians(10)

    const positions = computeJointPositions(skeleton, offsets, skeleton.basePath[skeleton.root], {})
    assert.notEqual(Math.round(positions.foot.x), Math.round(skeleton.basePath.foot.x))
    assert.notEqual(Math.round(positions.foot.y), Math.round(skeleton.basePath.foot.y))
  })
})

describe('estimateTorque', () => {
  it('reports larger torque when the bar drifts forward', () => {
    const skeleton = resolveSkeleton('Deadlift')
    const zeroOffsets = createZeroOffsets(skeleton)
    const positions = computeJointPositions(skeleton, zeroOffsets, skeleton.basePath[skeleton.root], {})

    const neutral = estimateTorque(positions, skeleton.basePath.bar)
    const forward = estimateTorque(positions, { ...skeleton.basePath.bar, x: skeleton.basePath.bar.x + 30 })

    assert.ok(forward.total > neutral.total)
    assert.ok(forward.perJoint.hip > neutral.perJoint.hip)
  })
})
