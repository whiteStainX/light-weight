import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { liftData } from '../lib/liftData.js'
import { toRadians } from './useKinematics.js'
import { PX_PER_CM, ORIGIN_Y, BAR_X } from '../lib/constants.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const cmToPx = (cm) => cm * PX_PER_CM
const safeSqrt = (value) => Math.sqrt(Math.max(value, 0))

const cycleScalar = (progress) => 0.5 * (1 - Math.cos(2 * Math.PI * progress))
const cycleDirection = (progress) => Math.sin(2 * Math.PI * progress)

const calculateAngleOffset = (positions, jointName, parentName, skeletonInfo) => {
  const parentPos = positions[parentName];
  const jointPos = positions[jointName];
  const currentAngle = Math.atan2(jointPos.y - parentPos.y, jointPos.x - parentPos.x);
  const defaultAngle = skeletonInfo.defaultAngles[jointName] || 0;
  return currentAngle - defaultAngle;
};

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

const solveSquat = (progress, params = {}, skeletonInfo) => {
  const p = cycleScalar(progress)

  const foot = { x: BAR_X, y: ORIGIN_Y }

  const kneeTravelTop = params.kneeTravel ?? 10
  const kneeTravelBottom = params.kneeTravelBottom ?? Math.max(1.5, kneeTravelTop * 0.2)
  const hipSetbackTop = params.hipSetback ?? 22
  const hipSetbackBottom = params.hipSetbackBottom ?? Math.max(6, hipSetbackTop * 0.45)
  const barGapCm = params.barGap ?? 2

  const kneeForwardCm = kneeTravelTop + (kneeTravelBottom - kneeTravelTop) * p
  const hipBackCm = hipSetbackTop + (hipSetbackBottom - hipSetbackTop) * p

  const kneeForward = cmToPx(kneeForwardCm)
  const hipBack = cmToPx(hipBackCm)
  const barGap = cmToPx(barGapCm)

  const shin = cmToPx(skeletonInfo.data.limbLengths.shin || 42)
  const thigh = cmToPx(skeletonInfo.data.limbLengths.thigh || 40)
  const torso = cmToPx(skeletonInfo.data.limbLengths.torso || 45)

  const kneeX = foot.x + kneeForward
  const kneeY = foot.y - safeSqrt(shin * shin - kneeForward * kneeForward)

  const hipX = BAR_X - hipBack
  const hipDX = hipX - kneeX
  const hipY = kneeY - safeSqrt(thigh * thigh - hipDX * hipDX)

  const shoulderDX = BAR_X + barGap - hipX
  const shoulderX = hipX + shoulderDX
  const shoulderY = hipY - safeSqrt(torso * torso - shoulderDX * shoulderDX)

  const barPosition = { x: BAR_X, y: shoulderY }

  // Derive angles from calculated positions
  const angleOffsets = {}

  const positions = {
    foot,
    knee: { x: kneeX, y: kneeY },
    hip: { x: hipX, y: hipY },
    shoulder: { x: shoulderX, y: shoulderY },
  };

  angleOffsets.knee = calculateAngleOffset(positions, 'knee', 'foot', skeletonInfo);
  angleOffsets.hip = calculateAngleOffset(positions, 'hip', 'knee', skeletonInfo);
  angleOffsets.shoulder = calculateAngleOffset(positions, 'shoulder', 'hip', skeletonInfo);

  const phase =
    progress < 0.1
      ? 'Set stance & brace'
      : progress < 0.5
        ? 'Controlled descent'
        : progress < 0.9
          ? 'Drive upward'
          : 'Lockout & reset'

  return { angleOffsets, barPosition, phase }
}

const solveBench = (progress, params = {}, skeletonInfo) => {
  const p = cycleScalar(progress)

  const { limbLengths, path } = skeletonInfo.data;
  const shoulderPos = path.shoulder;
  const humerusLength = cmToPx(limbLengths.humerus || 30);
  const forearmLength = cmToPx(limbLengths.forearm || 28);

  // 1. Define the rotation of the humerus (shoulder-elbow segment)
  const shoulderAngleStart = toRadians(params.shoulderAngleStart ?? 40);   // More tucked at top
  const shoulderAngleEnd = toRadians(params.shoulderAngleEnd ?? 85); // Less tucked at bottom

  const currentShoulderAngle = shoulderAngleStart + (shoulderAngleEnd - shoulderAngleStart) * p;

  // 2. Calculate joint positions using Forward Kinematics from the shoulder pivot
  const elbowX = shoulderPos.x + humerusLength * Math.cos(currentShoulderAngle);
  const elbowY = shoulderPos.y + humerusLength * Math.sin(currentShoulderAngle);

  // 3. Apply the vertical forearm constraint
  const gripX = elbowX; // Grip is vertically aligned with elbow
  const gripY = elbowY - forearmLength;

  const positions = {
    shoulder: shoulderPos,
    elbow: { x: elbowX, y: elbowY },
    grip: { x: gripX, y: gripY },
  };

  // 4. Derive angleOffsets from the calculated positions
  const angleOffsets = {};
  angleOffsets.elbow = calculateAngleOffset(positions, 'elbow', 'shoulder', skeletonInfo);
  angleOffsets.grip = calculateAngleOffset(positions, 'grip', 'elbow', skeletonInfo);

  // 5. Return the grip position as the bar position
  const barPosition = positions.grip;

  const phase =
    progress < 0.05
      ? 'Set arch & breath'
      : progress < 0.5
        ? 'Lower to touch'
        : progress < 0.95
          ? 'Drive to lockout'
          : 'Hold & reset'

  return { angleOffsets, barPosition, phase }
}
 
const solveDeadlift = (progress, params = {}, skeletonInfo) => {
  const p = cycleScalar(progress)

  const barX = skeletonInfo.data.basePositions?.barX ?? 410; // Fixed horizontal bar position

  const barTravel = cmToPx(params.barTravel ?? 45)
  const startClearance = cmToPx(params.startClearance ?? 5)
  const barPosition = { x: barX, y: ORIGIN_Y - (startClearance + barTravel * p) }

  const foot = { x: barX, y: ORIGIN_Y } // Foot X aligns with barX

  const shinLength = cmToPx(skeletonInfo.data.limbLengths.shin || 42);
  const thighLength = cmToPx(skeletonInfo.data.limbLengths.thigh || 40);
  const torsoLength = cmToPx(skeletonInfo.data.limbLengths.torso || 45);
  const armLength = cmToPx(skeletonInfo.data.limbLengths.arm || 70);

  // Dynamic Knee Horizontal Position (relative to foot)
  const kneeForwardStartCm = params.kneeForwardStart ?? 5; // Knees slightly forward at start
  const kneeForwardMidCm = params.kneeForwardMid ?? 0;   // Knees back as bar passes
  const kneeForwardEndCm = params.kneeForwardEnd ?? 2;   // Knees slightly forward at lockout

  let currentKneeForwardCm;
  if (p < 0.5) {
    currentKneeForwardCm = kneeForwardStartCm + (kneeForwardMidCm - kneeForwardStartCm) * (p * 2);
  } else {
    currentKneeForwardCm = kneeForwardMidCm + (kneeForwardEndCm - kneeForwardMidCm) * ((p - 0.5) * 2);
  }
  const kneeForward = cmToPx(currentKneeForwardCm);

  const kneeX = foot.x + kneeForward;
  const kneeY = foot.y - safeSqrt(shinLength * shinLength - kneeForward * kneeForward); // Inverse kinematics for kneeY

  // Dynamic Hip Horizontal Position (relative to bar)
  const hipSetbackStartCm = params.hipSetbackStart ?? 24;
  const hipSetbackEndCm = params.hipSetbackEnd ?? 10;
  const currentHipSetbackCm = hipSetbackStartCm + (hipSetbackEndCm - hipSetbackStartCm) * p;
  const hipX = barX - cmToPx(currentHipSetbackCm); // Hip X relative to barX

  const hipDX = hipX - kneeX;
  const hipY = kneeY - safeSqrt(thighLength * thighLength - hipDX * hipDX); // Inverse kinematics for hipY

  // Shoulder Horizontal Position (derived to maintain torso angle relative to bar)
  const shoulderOffsetCm = params.shoulderOffset ?? 6; // Constant offset for arm length/shoulder position
  const shoulderDX = barX + cmToPx(shoulderOffsetCm) - hipX; // Horizontal distance from hip to shoulder relative to bar
  const shoulderX = hipX + shoulderDX;
  const shoulderY = hipY - safeSqrt(torsoLength * torsoLength - shoulderDX * shoulderDX); // Inverse kinematics for shoulderY

  const grip = { x: barX, y: barPosition.y };

  const positions = {
    foot,
    knee: { x: kneeX, y: kneeY },
    hip: { x: hipX, y: hipY },
    shoulder: { x: shoulderX, y: shoulderY },
    grip,
  };

  // Derive angles from calculated positions
  const angleOffsets = {}

  angleOffsets.knee = calculateAngleOffset(positions, 'knee', 'foot', skeletonInfo);
  angleOffsets.hip = calculateAngleOffset(positions, 'hip', 'knee', skeletonInfo);
  angleOffsets.shoulder = calculateAngleOffset(positions, 'shoulder', 'hip', skeletonInfo);
  angleOffsets.grip = calculateAngleOffset(positions, 'grip', 'shoulder', skeletonInfo);

  const direction = cycleDirection(progress)
  const phase =
    progress < 0.12
      ? 'Set wedge & brace'
      : direction >= 0
        ? 'Push the floor'
        : progress < 0.88
          ? 'Hips through'
          : 'Return under control'

  return { angleOffsets, barPosition: grip, phase }
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

export const useLiftAnimation = ({ liftType, parameters = {} }) => {
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
        setProgress((prev) => {
          const nextValue = normaliseProgress(prev + elapsed / duration);
          return nextValue;
        });
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

    const solution = solver(normalized, parameters, skeletonInfo)

    return {
      angleOffsets: solution.angleOffsets,
      barPosition: solution.barPosition,
      phase: solution.phase,
    }

  }, [parameters, profile.solver, progress, skeletonInfo])


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
    joints: frame.angleOffsets,
    barOffset: frame.barPosition,
    phase: frame.phase,
  }
}

export const __testing__ = {
  cycleScalar,
  cycleDirection,
  solveSquat,
  solveBench,
  solveDeadlift,
  buildSkeletonInfo,
  normaliseProgress,
}

