import { useCallback, useEffect, useMemo, useState } from 'react'
import { liftData } from '../lib/liftData.js'

const toRadians = (degrees) => (degrees * Math.PI) / 180
const toDegrees = (radians) => (radians * 180) / Math.PI

const resolveSkeleton = (liftType) => {
  const data = liftData[liftType] ?? liftData.Squat
  const { limbs, path } = data
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
  let total = 0

  Object.entries(joints).forEach(([joint, point]) => {
    if (joint === 'bar') return
    const leverArm = (barPosition?.x ?? 0) - point.x
    const torque = Number((leverArm * 0.1).toFixed(2))
    perJoint[joint] = torque
    total += Math.abs(torque)
  })

  return {
    perJoint,
    total: Number(total.toFixed(2)),
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

  const initialRoot = useMemo(() => {
    const overridePosition = jointOverrides[skeleton.root]?.position
    return overridePosition ? { ...overridePosition } : { ...skeleton.basePath[skeleton.root] }
  }, [jointOverrides, skeleton.basePath, skeleton.root])

  const initialOffsets = useMemo(() => {
    const offsets = {}
    Object.keys(skeleton.defaultAngles).forEach((joint) => {
      const overrideOffset = jointOverrides[joint]?.angleOffset ?? 0
      offsets[joint] = overrideOffset
    })
    return offsets
  }, [jointOverrides, skeleton.defaultAngles])

  const [angleOffsets, setAngleOffsets] = useState(initialOffsets)
  const [rootPosition, setRootPosition] = useState(initialRoot)
  const [barOffset, setBarOffset] = useState(jointOverrides.bar?.offset ?? { x: 0, y: 0 })

  useEffect(() => {
    setAngleOffsets(initialOffsets)
  }, [initialOffsets])

  useEffect(() => {
    setRootPosition(initialRoot)
  }, [initialRoot])

  useEffect(() => {
    setBarOffset(jointOverrides.bar?.offset ?? { x: 0, y: 0 })
  }, [jointOverrides.bar?.offset])

  const joints = useMemo(
    () => computeJointPositions(skeleton, angleOffsets, rootPosition, jointOverrides),
    [angleOffsets, jointOverrides, rootPosition, skeleton],
  )

  const barBase = skeleton.basePath.bar ?? { x: rootPosition.x, y: rootPosition.y }
  const barPosition = useMemo(
    () => ({
      x: barBase.x + (barOffset.x ?? 0),
      y: barBase.y + (barOffset.y ?? 0),
    }),
    [barBase.x, barBase.y, barOffset.x, barOffset.y],
  )

  const torque = useMemo(() => estimateTorque(joints, barPosition), [barPosition, joints])

  const angleState = useMemo(() => {
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

  const setJointAngle = useCallback(
    (joint, absoluteDegrees) => {
      if (!(joint in skeleton.defaultAngles)) return
      setAngleOffsets((current) => ({
        ...current,
        [joint]: toRadians(absoluteDegrees) - skeleton.defaultAngles[joint],
      }))
    },
    [skeleton.defaultAngles],
  )

  const setJointOffset = useCallback((joint, offsetDegrees) => {
    setAngleOffsets((current) => ({
      ...current,
      [joint]: toRadians(offsetDegrees),
    }))
  }, [])

  const adjustJointOffset = useCallback((joint, deltaDegrees) => {
    setAngleOffsets((current) => ({
      ...current,
      [joint]: (current[joint] ?? 0) + toRadians(deltaDegrees),
    }))
  }, [])

  const resetAngles = useCallback(() => {
    setAngleOffsets(initialOffsets)
  }, [initialOffsets])

  const updateBarOffset = useCallback((nextOffset) => {
    setBarOffset((current) => ({ ...current, ...nextOffset }))
  }, [])

  return {
    joints,
    limbs: skeleton.limbs,
    barPosition,
    barOffset,
    torque,
    root: skeleton.root,
    rootPosition,
    angleOffsets,
    angles: angleState,
    setJointAngle,
    setJointOffset,
    adjustJointOffset,
    resetAngles,
    setRootPosition,
    setBarOffset: updateBarOffset,
  }
}
