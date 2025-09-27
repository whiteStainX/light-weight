import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const lerp = (start, end, t) => start + (end - start) * t

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const PROFILES = {
  Squat: {
    duration: 5200,
    keyframes: [
      {
        at: 0,
        label: 'Brace and stand tall',
        joints: { knee: 0, hip: 0, shoulder: -2 },
        bar: { x: 0, y: 0 },
      },
      {
        at: 0.25,
        label: 'Controlled descent',
        joints: { knee: 32, hip: 24, shoulder: -8 },
        bar: { x: 0, y: 18 },
      },
      {
        at: 0.55,
        label: 'Hold depth',
        joints: { knee: 52, hip: 36, shoulder: -12 },
        bar: { x: 0, y: 36 },
      },
      {
        at: 0.8,
        label: 'Drive upward',
        joints: { knee: 18, hip: 12, shoulder: -6 },
        bar: { x: 0, y: 12 },
      },
      {
        at: 1,
        label: 'Brace and stand tall',
        joints: { knee: 0, hip: 0, shoulder: -2 },
        bar: { x: 0, y: 0 },
      },
    ],
  },
  Bench: {
    duration: 4800,
    keyframes: [
      {
        at: 0,
        label: 'Eyes under the bar',
        joints: { elbow: -8, grip: 4 },
        bar: { x: 0, y: 0 },
      },
      {
        at: 0.22,
        label: 'Lower to touch point',
        joints: { elbow: 18, grip: -6 },
        bar: { x: 0, y: 26 },
      },
      {
        at: 0.52,
        label: 'Pause and stay tight',
        joints: { elbow: 26, grip: -12 },
        bar: { x: 0, y: 38 },
      },
      {
        at: 0.78,
        label: 'Press through lockout',
        joints: { elbow: -2, grip: 6 },
        bar: { x: 0, y: 10 },
      },
      {
        at: 1,
        label: 'Eyes under the bar',
        joints: { elbow: -8, grip: 4 },
        bar: { x: 0, y: 0 },
      },
    ],
  },
  Deadlift: {
    duration: 5400,
    keyframes: [
      {
        at: 0,
        label: 'Set the wedge',
        joints: { knee: 22, hip: 28, shoulder: -16, grip: -4 },
        bar: { x: 0, y: 24 },
      },
      {
        at: 0.28,
        label: 'Break from the floor',
        joints: { knee: 16, hip: 18, shoulder: -8, grip: 0 },
        bar: { x: 0, y: 12 },
      },
      {
        at: 0.55,
        label: 'Knees through',
        joints: { knee: 6, hip: 8, shoulder: -2, grip: 4 },
        bar: { x: 0, y: -4 },
      },
      {
        at: 0.82,
        label: 'Stand tall and squeeze',
        joints: { knee: -4, hip: -6, shoulder: 6, grip: 6 },
        bar: { x: 0, y: -18 },
      },
      {
        at: 1,
        label: 'Return the bar',
        joints: { knee: 22, hip: 28, shoulder: -16, grip: -4 },
        bar: { x: 0, y: 24 },
      },
    ],
  },
}

const ensureProfile = (liftType) => PROFILES[liftType] ?? PROFILES.Squat

const normaliseProgress = (value) => {
  if (Number.isNaN(value)) return 0
  const fractional = value % 1
  return fractional < 0 ? fractional + 1 : fractional
}

const resolveSegment = (keyframes, progress) => {
  if (!keyframes.length) {
    return {
      start: { at: 0, joints: {}, bar: { x: 0, y: 0 }, label: 'Idle' },
      end: { at: 1, joints: {}, bar: { x: 0, y: 0 }, label: 'Idle' },
      t: 0,
    }
  }

  const normalized = normaliseProgress(progress)
  let start = keyframes[0]
  let end = keyframes[keyframes.length - 1]

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index]
    const next = keyframes[index + 1]
    if (normalized >= current.at && normalized <= next.at) {
      start = current
      end = next
      break
    }
  }

  let span = end.at - start.at
  if (span <= 0) {
    span += 1
  }

  let local = normalized - start.at
  if (local < 0) {
    local += 1
  }

  const t = span === 0 ? 0 : clamp(local / span, 0, 1)

  return { start, end, t }
}

const interpolateFrame = (profile, progress) => {
  const { keyframes } = profile
  const { start, end, t } = resolveSegment(keyframes, progress)
  const joints = {}

  const jointKeys = new Set([
    ...Object.keys(start.joints ?? {}),
    ...Object.keys(end.joints ?? {}),
  ])

  jointKeys.forEach((joint) => {
    const startValue = start.joints?.[joint] ?? 0
    const endValue = end.joints?.[joint] ?? 0
    joints[joint] = lerp(startValue, endValue, t)
  })

  const barStart = start.bar ?? { x: 0, y: 0 }
  const barEnd = end.bar ?? { x: 0, y: 0 }

  return {
    joints,
    bar: {
      x: lerp(barStart.x ?? 0, barEnd.x ?? 0, t),
      y: lerp(barStart.y ?? 0, barEnd.y ?? 0, t),
    },
    phase: start.label ?? 'Cycle',
  }
}

export const useLiftAnimation = ({ liftType }) => {
  const profile = useMemo(() => ensureProfile(liftType), [liftType])
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

  const frame = useMemo(() => interpolateFrame(profile, progress), [profile, progress])

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
    joints: frame.joints,
    barOffset: frame.bar,
    phase: frame.phase,
  }
}

export const __testing__ = {
  PROFILES,
  ensureProfile,
  interpolateFrame,
  resolveSegment,
  normaliseProgress,
}

