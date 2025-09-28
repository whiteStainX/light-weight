import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { liftData } from '../lib/liftData.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const PX_PER_CM = 4
const ORIGIN_Y = 500
const BAR_X = 400

const cmToPx = (cm) => cm * PX_PER_CM
const safeSqrt = (value) => Math.sqrt(Math.max(value, 0))

const cycleScalar = (progress) => 0.5 * (1 - Math.cos(2 * Math.PI * progress))
const cycleDirection = (progress) => Math.sin(2 * Math.PI * progress)

const buildSkeletonInfo = (liftType) => {
  const data = liftData[liftType] ?? liftData.Squat
  const parentMap = {}
  const defaultAngles = {}

  data.limbs.forEach(({ from, to }) => {
    parentMap[to] = from
    const origin = data.path[from]
    const target = data.path[to]
    if (!origin || !target) {
      defaultAngles[to] = 0
      return
    }
    defaultAngles[to] = Math.atan2(target.y - origin.y, target.x - origin.x)
  })

  const rootCandidate = data.limbs.find(({ from }) => !(from in parentMap))?.from

  return {
    data,
    parentMap,
    defaultAngles,
    root: rootCandidate,
  }
}

const computeJointOffsets = (info, positions) => {
  const offsets = {}

  Object.entries(info.parentMap).forEach(([joint, parent]) => {
    const baseParent = info.data.path[parent]
    const baseJoint = info.data.path[joint]
    const targetParent = positions[parent] ?? baseParent
    const targetJoint = positions[joint] ?? baseJoint

    if (!baseParent || !baseJoint || !targetParent || !targetJoint) {
      return
    }

    const baseAngle = info.defaultAngles[joint] ?? 0
    const targetAngle = Math.atan2(targetJoint.y - targetParent.y, targetJoint.x - targetParent.x)
    const offset = targetAngle - baseAngle
    offsets[joint] = (offset * 180) / Math.PI
  })

  return offsets
}

const solveSquat = (progress) => {
  const p = cycleScalar(progress)

  const foot = { x: BAR_X, y: ORIGIN_Y }
  const kneeForward = cmToPx(10 + (2 - 10) * p)
  const hipBack = cmToPx(22 + (10 - 22) * p)
  const barGap = cmToPx(2)

  const shin = cmToPx(42)
  const thigh = cmToPx(40)
  const torso = cmToPx(45)

  const kneeX = foot.x + kneeForward
  const kneeY = foot.y - safeSqrt(shin * shin - kneeForward * kneeForward)

  const hipX = BAR_X - hipBack
  const hipDX = hipX - kneeX
  const hipY = kneeY - safeSqrt(thigh * thigh - hipDX * hipDX)

  const shoulderDX = BAR_X + barGap - hipX
  const shoulderX = hipX + shoulderDX
  const shoulderY = hipY - safeSqrt(torso * torso - shoulderDX * shoulderDX)

  const bar = { x: BAR_X, y: shoulderY }

  const positions = {
    foot,
    knee: { x: kneeX, y: kneeY },
    hip: { x: hipX, y: hipY },
    shoulder: { x: shoulderX, y: shoulderY },
  }

  const phase =
    progress < 0.1
      ? 'Set stance & brace'
      : progress < 0.5
        ? 'Controlled descent'
        : progress < 0.9
          ? 'Drive upward'
          : 'Lockout & reset'

  return { positions, bar, phase }
}

const solveBench = (progress) => {
  const p = cycleScalar(progress)

  const cx = BAR_X
  const cy = 320
  const barTravel = cmToPx(22)
  const barBase = cy + cmToPx(7)

  const gripSpan = cmToPx(55)
  const shoulderOffset = cmToPx(20)
  const forearm = cmToPx(28)
  const humerus = cmToPx(30)

  const bar = { x: cx, y: barBase - barTravel * p }
  const gripX = cx - gripSpan / 2
  const elbow = { x: gripX, y: bar.y + forearm }
  const shoulder = { x: cx - shoulderOffset, y: elbow.y - humerus }

  const positions = {
    shoulder,
    elbow,
    grip: { x: gripX, y: bar.y },
  }

  const phase =
    progress < 0.05
      ? 'Set arch & breath'
      : progress < 0.5
        ? 'Lower to touch'
        : progress < 0.95
          ? 'Drive to lockout'
          : 'Hold & reset'

  return { positions, bar, phase }
}

const solveDeadlift = (progress) => {
  const p = cycleScalar(progress)

  const barRise = 180
  const bar = { x: BAR_X, y: ORIGIN_Y - (20 + barRise * p) }

  const foot = { x: BAR_X, y: ORIGIN_Y }
  const kneeOffset = cmToPx(2)
  const knee = { x: BAR_X + kneeOffset, y: foot.y - safeSqrt(cmToPx(42) ** 2 - kneeOffset ** 2) }

  const shoulderX = BAR_X + cmToPx(6)
  const shoulder = {
    x: shoulderX,
    y: bar.y - safeSqrt(cmToPx(70) ** 2 - (shoulderX - BAR_X) ** 2),
  }

  const hipX = BAR_X - cmToPx(24)
  const hip = {
    x: hipX,
    y: shoulder.y + safeSqrt(cmToPx(45) ** 2 - (shoulderX - hipX) ** 2),
  }

  const positions = {
    foot,
    knee,
    hip,
    shoulder,
    grip: { x: BAR_X, y: bar.y },
  }

  const direction = cycleDirection(progress)
  const phase =
    progress < 0.12
      ? 'Set wedge & brace'
      : direction >= 0
        ? 'Push the floor'
        : progress < 0.88
          ? 'Hips through'
          : 'Return under control'

  return { positions, bar, phase }
}

const PROFILES = {
  Squat: { duration: 5200, solver: solveSquat },
  Bench: { duration: 4800, solver: solveBench },
  Deadlift: { duration: 5400, solver: solveDeadlift },
}

const ensureProfile = (liftType) => PROFILES[liftType] ?? PROFILES.Squat

const normaliseProgress = (value) => {
  if (Number.isNaN(value)) return 0
  const fractional = value % 1
  return fractional < 0 ? fractional + 1 : fractional
}

export const useLiftAnimation = ({ liftType }) => {
  const profile = useMemo(() => ensureProfile(liftType), [liftType])
  const skeletonInfo = useMemo(() => buildSkeletonInfo(liftType), [liftType])
  const [isPlaying, setIsPlaying] = useState(true)
  const [tempo, setTempo] = useState(1)
  const [progress, setProgress] = useState(0)

  const frameRef = useRef()
  const lastTimestamp = useRef(null)

  useEffect(() => {
    setProgress(0)
    lastTimestamp.current = null
  }, [profile])

  useEffect(() => {
    const tick = (timestamp) => {
      if (!isPlaying) {
        lastTimestamp.current = null
        return
      }

      if (lastTimestamp.current == null) {
        lastTimestamp.current = timestamp
      }

      const elapsed = timestamp - lastTimestamp.current
      lastTimestamp.current = timestamp

      const duration = profile.duration / clamp(tempo, 0.3, 3)
      if (duration > 0) {
        setProgress((prev) => normaliseProgress(prev + elapsed / duration))
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    if (isPlaying) {
      frameRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isPlaying, profile.duration, tempo])

  const frame = useMemo(() => {
    const solver = profile.solver ?? solveSquat
    const normalized = normaliseProgress(progress)
    const solution = solver(normalized)
    const jointOffsets = computeJointOffsets(skeletonInfo, solution.positions)
    const baseBar = skeletonInfo.data.path.bar ?? { x: 0, y: 0 }

    return {
      offsets: jointOffsets,
      barOffset: {
        x: (solution.bar.x ?? 0) - (baseBar.x ?? 0),
        y: (solution.bar.y ?? 0) - (baseBar.y ?? 0),
      },
      phase: solution.phase,
    }
  }, [profile.solver, progress, skeletonInfo])

  const togglePlay = useCallback(() => {
    setIsPlaying((current) => !current)
  }, [])

  const updateTempo = useCallback((value) => {
    setTempo(clamp(value, 0.3, 3))
  }, [])

  return {
    progress,
    isPlaying,
    togglePlay,
    tempo,
    setTempo: updateTempo,
    joints: frame.offsets,
    barOffset: frame.barOffset,
    phase: frame.phase,
  }
}

export const __testing__ = {
  cycleScalar,
  cycleDirection,
  solveSquat,
  solveBench,
  solveDeadlift,
  computeJointOffsets,
  buildSkeletonInfo,
  normaliseProgress,
}

