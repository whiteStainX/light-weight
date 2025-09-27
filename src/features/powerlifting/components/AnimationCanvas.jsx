import { useMemo } from 'react'

import StickFigure from './StickFigure'

const CANVAS_WIDTH = 420
const CANVAS_HEIGHT = 480
const DEFAULT_FRONT_SPREAD = 0.55

const buildGridLines = (step = 40) => {
  const lines = []
  for (let i = step; i < CANVAS_HEIGHT; i += step) {
    lines.push({ type: 'horizontal', offset: i })
  }
  for (let j = step; j < CANVAS_WIDTH; j += step) {
    lines.push({ type: 'vertical', offset: j })
  }
  return lines
}

const projectPoint = (point, variant, anchorX, frontProfile) => {
  if (!point) return point
  if (variant === 'front') {
    const centerX = frontProfile?.center ?? CANVAS_WIDTH / 2
    const spread = frontProfile?.spread ?? DEFAULT_FRONT_SPREAD
    return {
      x: centerX + (point.x - anchorX) * spread,
      y: point.y,
    }
  }
  return point
}

const AnimationCanvas = ({
  title,
  joints,
  limbs,
  barPosition,
  variant = 'side',
  rootPosition,
  torque,
  progress = 0,
  phase,
  surfaces = {},
  angles,
  frontProfile,
}) => {
  const anchorX = rootPosition?.x ?? CANVAS_WIDTH / 2

  const projectedJoints = useMemo(() => {
    if (!joints) return null
    return Object.fromEntries(
      Object.entries(joints).map(([key, point]) => [
        key,
        projectPoint(point, variant, anchorX, frontProfile),
      ]),
    )
  }, [anchorX, frontProfile, joints, variant])

  const projectedBar = useMemo(
    () => projectPoint(barPosition, variant, anchorX, frontProfile),
    [anchorX, barPosition, frontProfile, variant],
  )

  const { displayJoints, displayLimbs, barHalfSpan } = useMemo(() => {
    if (!projectedJoints) {
      return { displayJoints: null, displayLimbs: limbs, barHalfSpan: 80 }
    }

    const baseJoints = Object.fromEntries(
      Object.entries(projectedJoints).filter(([key]) => key !== 'bar'),
    )
    const baseLimbs = limbs.filter(({ from, to }) => from !== 'bar' && to !== 'bar')

    if (variant !== 'front') {
      return { displayJoints: baseJoints, displayLimbs: baseLimbs, barHalfSpan: 80 }
    }

    if (!frontProfile) {
      const mirroredEntries = Object.entries(baseJoints).reduce((acc, [key, point]) => {
        acc[`${key}_mirror`] = {
          x: CANVAS_WIDTH - point.x,
          y: point.y,
        }
        return acc
      }, {})

      const mirroredLimbs = baseLimbs.map(({ from, to }) => ({
        from: `${from}_mirror`,
        to: `${to}_mirror`,
      }))

      return {
        displayJoints: { ...baseJoints, ...mirroredEntries },
        displayLimbs: [...baseLimbs, ...mirroredLimbs],
        barHalfSpan: 80,
      }
    }

    const widthCache = new Map()
    const centerLine = frontProfile.center ?? CANVAS_WIDTH / 2
    const fallbackWidth = frontProfile.fallbackWidth ?? 36
    const spread = frontProfile.spread ?? DEFAULT_FRONT_SPREAD
    const yOffsets = frontProfile.yOffsets ?? {}

    const getAngleOffset = (joint) => Math.abs(angles?.[joint]?.offset ?? 0)

    const resolveWidth = (joint, point) => {
      if (widthCache.has(joint)) {
        return widthCache.get(joint)
      }

      const config = frontProfile.widths?.[joint]
      const fallback = Number.isFinite(point?.x)
        ? Math.abs(point.x - anchorX) * spread || fallbackWidth
        : fallbackWidth

      let width = fallback

      if (!config) {
        width = fallback
      } else if (config.follow) {
        const followPoint = config.follow === joint ? point : projectedJoints?.[config.follow]
        const followWidth = resolveWidth(config.follow, followPoint)
        width = (Number.isFinite(followWidth) ? followWidth : fallbackWidth) + (config.offset ?? 0)
      } else {
        width = config.base ?? fallback
        if (config.scale) {
          const driverKey = config.driver ?? joint
          width += getAngleOffset(driverKey) * config.scale
        }
        if (!config.follow && config.offset) {
          width += config.offset
        }
      }

      if (config?.min != null) {
        width = Math.max(config.min, width)
      }
      if (config?.max != null) {
        width = Math.min(config.max, width)
      }

      if (!Number.isFinite(width)) {
        width = fallbackWidth
      }

      widthCache.set(joint, width)
      return width
    }

    const bilateralJoints = Object.entries(baseJoints).reduce((acc, [key, point]) => {
      const width = resolveWidth(key, point)
      const yOffset = yOffsets[key] ?? 0
      acc[`${key}_left`] = {
        x: centerLine - width,
        y: point.y + yOffset,
      }
      acc[`${key}_right`] = {
        x: centerLine + width,
        y: point.y + yOffset,
      }
      return acc
    }, {})

    const bilateralLimbs = baseLimbs.flatMap(({ from, to }) => [
      { from: `${from}_left`, to: `${to}_left` },
      { from: `${from}_right`, to: `${to}_right` },
    ])

    const crossLinks = (frontProfile.crossLinks ?? []).map((joint) => ({
      from: `${joint}_left`,
      to: `${joint}_right`,
    }))

    const filteredCrossLinks = crossLinks.filter(
      ({ from, to }) => bilateralJoints[from] && bilateralJoints[to],
    )

    const barSpan = resolveWidth('bar', projectedBar ?? joints?.bar) ?? 80

    return {
      displayJoints: bilateralJoints,
      displayLimbs: [...bilateralLimbs, ...filteredCrossLinks],
      barHalfSpan: barSpan,
    }
  }, [anchorX, angles, frontProfile, joints, limbs, projectedBar, projectedJoints, variant])

  const gridLines = useMemo(() => buildGridLines(), [])

  const groundY = surfaces.ground
  const benchTop = surfaces.benchTop
  const benchHeight = surfaces.benchHeight ?? 32

  return (
    <div className="flex h-full flex-col gap-4 rounded-md border border-zinc-700/80 bg-zinc-900/60 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{variant} view</p>
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        </div>
        <div className="text-right text-[11px] leading-tight text-zinc-400">
          <p className="uppercase tracking-[0.3em]">{phase ?? 'Cycle'}</p>
          <p className="text-zinc-200">{Math.round((progress ?? 0) * 100)}%</p>
        </div>

        {torque && (
          <dl className="text-right text-xs text-zinc-400">
            <dt className="uppercase tracking-[0.2em]">total torque</dt>
            <dd className="text-base font-semibold text-zinc-100">{torque.total.toFixed(2)} Nm*</dd>
          </dl>
        )}
      </div>
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="flex-1 rounded-sm bg-zinc-950/80 text-zinc-100"
        role="img"
        aria-label={`${title} ${variant} view schematic`}
      >
        <defs>
          <radialGradient id="bgFade" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bgFade)" />
        {typeof groundY === 'number' && (
          <rect
            x={0}
            y={groundY}
            width={CANVAS_WIDTH}
            height={Math.max(0, CANVAS_HEIGHT - groundY)}
            fill="rgba(63,63,70,0.35)"
          />
        )}

        {typeof benchTop === 'number' && (
          <rect
            x={CANVAS_WIDTH * 0.2}
            y={benchTop}
            width={CANVAS_WIDTH * 0.6}
            height={benchHeight}
            rx={8}
            fill="rgba(63,63,70,0.45)"
          />
        )}
        {gridLines.map((line, index) =>
          line.type === 'horizontal' ? (
            <line
              key={`h-${index}`}
              x1={0}
              y1={line.offset}
              x2={CANVAS_WIDTH}
              y2={line.offset}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ) : (
            <line
              key={`v-${index}`}
              x1={line.offset}
              y1={0}
              x2={line.offset}
              y2={CANVAS_HEIGHT}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          ),
        )}

        {projectedBar && (
          <g>
            <line
              x1={projectedBar.x - (barHalfSpan ?? 80)}
              y1={projectedBar.y}
              x2={projectedBar.x + (barHalfSpan ?? 80)}
              y2={projectedBar.y}
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle
              cx={projectedBar.x}
              cy={projectedBar.y}
              r={10}
              fill="rgba(255,255,255,0.65)"
            />
          </g>
        )}

        <StickFigure
          joints={displayJoints}
          limbs={displayLimbs}
          accentJoint={
            variant === 'front'
              ? ['shoulder_left', 'shoulder_right']
              : 'hip'
          }
        />
      </svg>
      <p className="text-[11px] leading-relaxed text-zinc-400">
        *Torque is a simplified estimate using the horizontal distance between the bar path and each joint.
        Use it as a comparative cue, comrade, not absolute truth.
      </p>
    </div>
  )
}

export default AnimationCanvas
