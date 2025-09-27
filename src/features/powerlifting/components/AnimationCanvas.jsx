import { useMemo } from 'react'
import StickFigure from './StickFigure'

const CANVAS_WIDTH = 420
const CANVAS_HEIGHT = 480

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

const projectPoint = (point, variant, anchorX) => {
  if (!point) return point
  if (variant === 'front') {
    const centerX = CANVAS_WIDTH / 2
    const spread = 0.45
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

}) => {
  const anchorX = rootPosition?.x ?? CANVAS_WIDTH / 2

  const projectedJoints = useMemo(() => {
    if (!joints) return null
    return Object.fromEntries(
      Object.entries(joints).map(([key, point]) => [
        key,
        projectPoint(point, variant, anchorX),
      ]),
    )
  }, [anchorX, joints, variant])

  const projectedBar = useMemo(
    () => projectPoint(barPosition, variant, anchorX),
    [anchorX, barPosition, variant],
  )

  const gridLines = useMemo(() => buildGridLines(), [])

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
              x1={projectedBar.x - 80}
              y1={projectedBar.y}
              x2={projectedBar.x + 80}
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

        <StickFigure joints={projectedJoints} limbs={limbs} accentJoint={variant === 'front' ? 'shoulder' : 'hip'} />
      </svg>
      <p className="text-[11px] leading-relaxed text-zinc-400">
        *Torque is a simplified estimate using the horizontal distance between the bar path and each joint.
        Use it as a comparative cue, comrade, not absolute truth.
      </p>
    </div>
  )
}

export default AnimationCanvas
