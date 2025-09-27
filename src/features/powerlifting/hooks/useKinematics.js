import { useCallback, useEffect, useMemo, useState } from 'react'
import { liftData } from '../lib/liftData.js'

const toRadians = (deg) => (deg * Math.PI) / 180
const toDegrees = (rad) => (rad * 180) / Math.PI

const resolveSkeleton = (liftType) => {
  const data = liftData[liftType] ?? liftData.Squat
  const { limbs, path } = data

  const parentMap = {}
  const childrenMap = new Map()
  const segmentLengths = {}
  const defaultAngles = {}

  limbs.forEach(({ from, to }) => {
    parentMap[to] = from
    if (!childrenMap.has(from)) childrenMap.set(from, [])
    childrenMap.get(from).push(to)

    const a = path[from]
    const b = path[to]
    const dx = b.x - a.x
    const dy = b.y - a.y
    segmentLengths[to] = Math.hypot(dx, dy)
    defaultAngles[to] = Math.atan2(dy, dx)
  })

  const root =
    limbs.map(({ from }) => from).find((n) => !(n in parentMap)) ?? limbs[0]?.from

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

const computeJointPositions = (skeleton, angleOffsets, rootPosition, jointOverrides) => {
  const positions = {}
  const visited = new Set()

  const assign = (joint) => {
    if (visited.has(joint)) return
    visited.add(joint)

    const override = jointOverrides[joint]?.position
    if (override) {
      positions[joint] = { ...override }
    } else if (joint === skeleton.root) {
      positions[joint] = { ...rootPosition }
    } else if (skeleton.parentMap[joint]) {
      const parent = skeleton.parentMap[joint]
      if (!positions[parent]) assign(parent)
      const p = positions[parent]
      const len = skeleton.segmentLengths[joint] ?? 0
      const base = skeleton.defaultAngles[joint] ?? 0
      const off = angleOffsets[joint] ?? 0
      const ang = base + off
      positions[joint] = { x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len }
    } else if (skeleton.basePath[joint]) {
      positions[joint] = { ...skeleton.basePath[joint] }
    }

    const kids = skeleton.childrenMap.get(joint) ?? []
    kids.forEach(assign)
  }

  if (skeleton.root) assign(skeleton.root)

  Object.keys(skeleton.basePath).forEach((joint) => {
    if (!positions[joint]) {
      const override = jointOverrides[joint]?.position
      positions[joint] = override ? { ...override } : { ...skeleton.basePath[joint] }
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
    const t = leverArm * 0.1
    perJoint[joint] = Number(t.toFixed(2))
    total += Math.abs(t)
  })

  return { perJoint, total: Number(total.toFixed(2)) }
}

export const useKinematics = ({ liftType = 'Squat', jointOverrides = {} } = {}) => {
  const skeleton = useMemo(() => resolveSkeleton(liftType), [liftType])

  const initialRoot = useMemo(() => {
    const p = jointOverrides[skeleton.root]?.position
    return p ? { ...p } : { ...skeleton.basePath[skeleton.root] }
  }, [jointOverrides, skeleton.basePath, skeleton.root])

  const initialOffsets = useMemo(() => {
    const offsets = {}
    Object.keys(skeleton.defaultAngles).forEach((joint) => {
      offsets[joint] = jointOverrides[joint]?.angleOffset ?? 0
    })
    return offsets
  }, [jointOverrides, skeleton.defaultAngles])

  const [angleOffsets, setAngleOffsets] = useState(initialOffsets)
  const [rootPosition, setRootPosition] = useState(initialRoot)
  const [barOffset, setBarOffset] = useState(jointOverrides.bar?.offset ?? { x: 0, y: 0 })

  useEffect(() => setAngleOffsets(initialOffsets), [initialOffsets])
  useEffect(() => setRootPosition(initialRoot), [initialRoot])
  useEffect(() => setBarOffset(jointOverrides.bar?.offset ?? { x: 0, y: 0 }), [jointOverrides.bar?.offset])

  const joints = useMemo(
    () => computeJointPositions(skeleton, angleOffsets, rootPosition, jointOverrides),
    [angleOffsets, jointOverrides, rootPosition, skeleton],
  )

  const barBase = skeleton.basePath.bar ?? rootPosition
  const barPosition = useMemo(
    () => ({ x: barBase.x + (barOffset.x ?? 0), y: barBase.y + (barOffset.y ?? 0) }),
    [barBase, barOffset],
  )

  const torque = useMemo(() => estimateTorque(joints, barPosition), [joints, barPosition])

  const angles = useMemo(() => {
    const out = {}
    Object.entries(skeleton.defaultAngles).forEach(([joint, base]) => {
      const off = angleOffsets[joint] ?? 0
      out[joint] = {
        base: Number(toDegrees(base).toFixed(1)),
        offset: Number(toDegrees(off).toFixed(1)),
        absolute: Number(toDegrees(base + off).toFixed(1)),
      }
    })
    return out
  }, [angleOffsets, skeleton.defaultAngles])

  const setJointAngle = useCallback(
    (joint, absoluteDegrees) => {
      if (!(joint in skeleton.defaultAngles)) return
      setAngleOffsets((cur) => ({
        ...cur,
        [joint]: toRadians(absoluteDegrees) - skeleton.defaultAngles[joint],
      }))
    },
    [skeleton.defaultAngles],
  )

  const setJointOffset = useCallback((joint, offsetDegrees) => {
    setAngleOffsets((cur) => ({ ...cur, [joint]: toRadians(offsetDegrees) }))
  }, [])

  const adjustJointOffset = useCallback((joint, deltaDegrees) => {
    setAngleOffsets((cur) => ({ ...cur, [joint]: (cur[joint] ?? 0) + toRadians(deltaDegrees) }))
  }, [])

  const resetAngles = useCallback(() => setAngleOffsets(initialOffsets), [initialOffsets])

  const updateBarOffset = useCallback((next) => setBarOffset((cur) => ({ ...cur, ...next })), [])

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
    setJointAngle,
    setJointOffset,
    adjustJointOffset,
    resetAngles,
    setRootPosition,
    setBarOffset: updateBarOffset,
  }
}
