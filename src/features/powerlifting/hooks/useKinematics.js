
import { useMemo } from 'react'
import { liftData } from '../lib/liftData.js'

const SCENE_PADDING_X = 120
const SCENE_PADDING_Y = 140
const MIN_SCENE_WIDTH = 420
const MIN_SCENE_HEIGHT = 420
const BAR_HALF_SPAN = 60

export const toRadians = (degrees) => (degrees * Math.PI) / 180
const toDegrees = (radians) => (radians * 180) / Math.PI

const computeSceneFrame = (path = {}, anchors = {}, surfaces = {}) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  const includePoint = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  Object.values(path).forEach(({ x, y }) => includePoint(x, y))

  if (path.bar) {
    includePoint(path.bar.x - BAR_HALF_SPAN, path.bar.y)
    includePoint(path.bar.x + BAR_HALF_SPAN, path.bar.y)
  }

  const barAnchor = anchors?.bar
  if (barAnchor?.joint && path[barAnchor.joint]) {
    const base = path[barAnchor.joint]
    const offset = barAnchor.offset ?? { x: 0, y: 0 }
    const anchorPoint = { x: base.x + (offset.x ?? 0), y: base.y + (offset.y ?? 0) }
    includePoint(anchorPoint.x - BAR_HALF_SPAN, anchorPoint.y)
    includePoint(anchorPoint.x + BAR_HALF_SPAN, anchorPoint.y)
    includePoint(anchorPoint.x, anchorPoint.y)
  }

  if (typeof surfaces.ground === 'number') {
    includePoint(path.bar?.x ?? 0, surfaces.ground)
  }

  if (typeof surfaces.benchTop === 'number') {
    includePoint(path.bar?.x ?? 0, surfaces.benchTop)
    includePoint(path.bar?.x ?? 0, surfaces.benchTop + (surfaces.benchHeight ?? 0))
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return {
      minX: -MIN_SCENE_WIDTH / 2,
      maxX: MIN_SCENE_WIDTH / 2,
      minY: -MIN_SCENE_HEIGHT / 2,
      maxY: MIN_SCENE_HEIGHT / 2,
    }
  }

  let expandedMinX = minX - SCENE_PADDING_X
  let expandedMaxX = maxX + SCENE_PADDING_X
  let expandedMinY = minY - SCENE_PADDING_Y
  let expandedMaxY = maxY + SCENE_PADDING_Y

  const width = expandedMaxX - expandedMinX
  if (width < MIN_SCENE_WIDTH) {
    const pad = (MIN_SCENE_WIDTH - width) / 2
    expandedMinX -= pad
    expandedMaxX += pad
  }

  const height = expandedMaxY - expandedMinY
  if (height < MIN_SCENE_HEIGHT) {
    const pad = (MIN_SCENE_HEIGHT - height) / 2
    expandedMinY -= pad
    expandedMaxY += pad
  }

  return {
    minX: expandedMinX,
    maxX: expandedMaxX,
    minY: expandedMinY,
    maxY: expandedMaxY,
  }
}

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

  const sceneBounds = data.sceneBounds ?? computeSceneFrame(path, anchors, surfaces)

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
    sceneBounds,
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

export const useKinematics = ({ liftType = 'Squat', manualAngleOffsets = {}, animatedAngleOffsets = {}, animatedBarPosition = { x: 0, y: 0 }, manualBarOffset = { x: 0, y: 0 } } = {}) => {
  const skeleton = useMemo(() => resolveSkeleton(liftType), [liftType])

  const rootPosition = useMemo(() => {
    const overridePosition = manualAngleOffsets[skeleton.root]?.position
    return overridePosition ? { ...overridePosition } : { ...skeleton.basePath[skeleton.root] }
  }, [manualAngleOffsets, skeleton.basePath, skeleton.root])

  const combinedAngleOffsets = useMemo(() => {
    const offsets = {}
    Object.keys(skeleton.defaultAngles).forEach((joint) => {
      const manualOffsetDegrees = manualAngleOffsets[joint] ?? 0
      const manualOffsetRadians = toRadians(manualOffsetDegrees)
      const animatedOffset = animatedAngleOffsets[joint] ?? 0
      offsets[joint] = manualOffsetRadians + animatedOffset
    })
    return offsets
  }, [animatedAngleOffsets, manualAngleOffsets, skeleton.defaultAngles])

  const joints = useMemo(
    () => {
      return computeJointPositions(skeleton, combinedAngleOffsets, rootPosition, manualAngleOffsets)
    },
    [combinedAngleOffsets, manualAngleOffsets, rootPosition, skeleton],
  )

  const finalBarPosition = useMemo(
    () => {
      const anchorConfig = skeleton.anchors?.bar;
      if (anchorConfig?.joint && joints?.[anchorConfig.joint]) {
        const anchorPoint = joints[anchorConfig.joint];
        const offset = anchorConfig.offset ?? { x: 0, y: 0 };
        return {
          x: anchorPoint.x + (offset.x ?? 0) + (manualBarOffset.x ?? 0),
          y: anchorPoint.y + (offset.y ?? 0) + (manualBarOffset.y ?? 0),
        };
      }
      // If no anchor, use the animated bar position (plus manual offset)
      return {
        x: animatedBarPosition.x + (manualBarOffset.x ?? 0),
        y: animatedBarPosition.y + (manualBarOffset.y ?? 0),
      };
    },
    [animatedBarPosition, manualBarOffset, joints, skeleton.anchors?.bar],
  );

  const torque = useMemo(() => estimateTorque(joints, finalBarPosition), [finalBarPosition, joints])

  const angles = useMemo(() => {
    const entries = {}
    Object.entries(skeleton.defaultAngles).forEach(([joint, baseAngle]) => {
      const offset = combinedAngleOffsets[joint] ?? 0
      entries[joint] = {
        base: Number(toDegrees(baseAngle).toFixed(1)),
        offset: Number(toDegrees(offset).toFixed(1)),
        absolute: Number(toDegrees(baseAngle + offset).toFixed(1)),
      }
    })
    return entries
  }, [combinedAngleOffsets, skeleton.defaultAngles])

  return {
    joints,
    limbs: skeleton.limbs,
    barPosition: finalBarPosition,
    barOffset: manualBarOffset,
    torque,
    root: skeleton.root,
    rootPosition,
    angleOffsets: combinedAngleOffsets,
    angles,
    surfaces: skeleton.surfaces,
    frontProfile: skeleton.frontProfile,
    sceneBounds: skeleton.sceneBounds,
  }
}
