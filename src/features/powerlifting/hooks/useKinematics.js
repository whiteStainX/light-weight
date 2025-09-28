
import { useMemo } from 'react'
import { liftData } from '../lib/liftData.js'

const toRadians = (degrees) => (degrees * Math.PI) / 180
const toDegrees = (radians) => (radians * 180) / Math.PI

const resolveSkeleton = (liftType) => {
  const data = liftData[liftType] ?? liftData.Squat
  const { limbs, path, anchors = {}, surfaces = {}, frontProfile = {} } = data
  const parentMap = {}
  const childrenMap = new Map()
  const segmentLengths = {}
  const defaultAngles = {}

  limbs.forEach(({ from, to }) => {
    parentMap[to] = from
    if (!childrenMap.has(from)) {
      childrenMap.set(from, [])
    }
    childrenMap.get(from).push(to)

    const origin = path[from]
    const target = path[to]
    const dx = target.x - origin.x
    const dy = target.y - origin.y
    segmentLengths[to] = Math.hypot(dx, dy)
    defaultAngles[to] = Math.atan2(dy, dx)
  })

  const potentialRoots = limbs.map(({ from }) => from)
  const root = potentialRoots.find((candidate) => !(candidate in parentMap)) ?? limbs[0]?.from

  return {
    basePath: path,
    limbs,
    parentMap,
    childrenMap,
    segmentLengths,
    defaultAngles,
    root,
    anchors,
    surfaces,
    frontProfile,
  }
}

const computeJointPositions = (
  skeleton,
  angleOffsets,
  rootPosition,
  jointOverrides,
) => {
  const positions = {}
  const visited = new Set()

  const assign = (joint) => {
    if (visited.has(joint)) return
    visited.add(joint)

    if (jointOverrides[joint]?.position) {
      positions[joint] = { ...jointOverrides[joint].position }
    } else if (joint === skeleton.root) {
      positions[joint] = { ...rootPosition }
    } else if (skeleton.parentMap[joint]) {
      const parent = skeleton.parentMap[joint]
      if (!positions[parent]) {
        assign(parent)
      }
      const parentPosition = positions[parent]
      const length = skeleton.segmentLengths[joint] ?? 0
      const baseAngle = skeleton.defaultAngles[joint] ?? 0
      const offset = angleOffsets[joint] ?? 0
      const angle = baseAngle + offset
      positions[joint] = {
        x: parentPosition.x + Math.cos(angle) * length,
        y: parentPosition.y + Math.sin(angle) * length,
      }
    } else if (skeleton.basePath[joint]) {
      positions[joint] = { ...skeleton.basePath[joint] }
    }

    const children = skeleton.childrenMap.get(joint) ?? []
    children.forEach(assign)
  }

  if (skeleton.root) {
    assign(skeleton.root)
  }

  Object.keys(skeleton.basePath).forEach((joint) => {
    if (!positions[joint]) {
      if (jointOverrides[joint]?.position) {
        positions[joint] = { ...jointOverrides[joint].position }
      } else {
        positions[joint] = { ...skeleton.basePath[joint] }
      }
    }
  })

  return positions
}

const estimateTorque = (joints, barPosition) => {
  const perJoint = {}
  const leverArms = {}
  let total = 0

  Object.entries(joints).forEach(([joint, point]) => {
    if (joint === 'bar') return
    const leverArm = (barPosition?.x ?? 0) - point.x
    const torqueValue = Number((leverArm * 0.1).toFixed(2))
    perJoint[joint] = torqueValue
    leverArms[joint] = {
      lever: leverArm,
      direction: Math.sign(leverArm),
      magnitude: Math.abs(torqueValue),
    }
    total += Math.abs(torqueValue)
  })

  return {
    perJoint,
    total: Number(total.toFixed(2)),
    leverArms,
  }
}

export const __testing__ = {
  resolveSkeleton,
  computeJointPositions,
  estimateTorque,
  toRadians,
  toDegrees,
}

export const useKinematics = ({ liftType = 'Squat', jointOverrides = {} } = {}) => {
  const skeleton = useMemo(() => resolveSkeleton(liftType), [liftType])

  const rootPosition = useMemo(() => {
    const overridePosition = jointOverrides[skeleton.root]?.position
    return overridePosition ? { ...overridePosition } : { ...skeleton.basePath[skeleton.root] }
  }, [jointOverrides, skeleton.basePath, skeleton.root])

  const angleOffsets = useMemo(() => {
    const offsets = {}
    Object.keys(skeleton.defaultAngles).forEach((joint) => {
      const overrideOffset = jointOverrides[joint]?.angleOffset ?? 0
      offsets[joint] = overrideOffset
    })
    return offsets
  }, [jointOverrides, skeleton.defaultAngles])

  const barOffset = useMemo(() => jointOverrides.bar?.offset ?? { x: 0, y: 0 }, [jointOverrides])

  const joints = useMemo(
    () => computeJointPositions(skeleton, angleOffsets, rootPosition, jointOverrides),
    [angleOffsets, jointOverrides, rootPosition, skeleton],
  )

  const barBase = useMemo(() => {
    const anchorConfig = skeleton.anchors?.bar
    if (anchorConfig?.joint && joints?.[anchorConfig.joint]) {
      const anchorPoint = joints[anchorConfig.joint]
      const offset = anchorConfig.offset ?? { x: 0, y: 0 }
      return {
        x: anchorPoint.x + (offset.x ?? 0),
        y: anchorPoint.y + (offset.y ?? 0),
      }
    }

    if (skeleton.basePath.bar) {
      return { ...skeleton.basePath.bar }
    }

    return { x: rootPosition.x, y: rootPosition.y }
  }, [joints, rootPosition.x, rootPosition.y, skeleton.anchors?.bar, skeleton.basePath.bar])

  const barPosition = useMemo(
    () => ({
      x: barBase.x + (barOffset.x ?? 0),
      y: barBase.y + (barOffset.y ?? 0),
    }),
    [barBase.x, barBase.y, barOffset.x, barOffset.y],
  )

  const torque = useMemo(() => estimateTorque(joints, barPosition), [barPosition, joints])

  const angles = useMemo(() => {
    const entries = {}
    Object.entries(skeleton.defaultAngles).forEach(([joint, baseAngle]) => {
      const offset = angleOffsets[joint] ?? 0
      entries[joint] = {
        base: Number(toDegrees(baseAngle).toFixed(1)),
        offset: Number(toDegrees(offset).toFixed(1)),
        absolute: Number(toDegrees(baseAngle + offset).toFixed(1)),
      }
    })
    return entries
  }, [angleOffsets, skeleton.defaultAngles])

  return {
    joints,
    limbs: skeleton.limbs,
    barPosition,
    barOffset,
    torque,
    root: skeleton.root,
    rootPosition,
    angleOffsets,
    angles,
    surfaces: skeleton.surfaces,
    frontProfile: skeleton.frontProfile,
  }
}
