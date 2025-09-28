import { useMemo } from 'react'

import StickFigure from './StickFigure'

const CANVAS_WIDTH = 380
const CANVAS_HEIGHT = 320
const GRID_STEP = 32
const KEY_JOINTS = new Set(['foot', 'knee', 'hip', 'shoulder', 'elbow', 'grip'])

const buildGridLines = () => {
  const lines = []
  for (let x = GRID_STEP; x < CANVAS_WIDTH; x += GRID_STEP) {
    lines.push({ type: 'vertical', offset: x })
  }
  for (let y = GRID_STEP; y < CANVAS_HEIGHT; y += GRID_STEP) {
    lines.push({ type: 'horizontal', offset: y })
  }
  return lines
}

const formatTorque = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`

const buildTorqueGlyphs = (joints, barPosition, torque) => {
  if (!joints || !barPosition || !torque?.leverArms) {
    return []
  }

  const barX = barPosition.x

  return Object.entries(torque.leverArms)
    .filter(([joint]) => KEY_JOINTS.has(joint) && joints[joint])
    .map(([joint, data]) => {
      const point = joints[joint]
      const span = barX - point.x
      const spanMagnitude = Math.abs(span)
      if (spanMagnitude < 1) {
        return {
          joint,
          momentLine: null,
          arcPath: null,
          arrowPath: null,
          label: `${formatTorque(torque.perJoint[joint] ?? 0)} Nm`,
          leverLabel: 'Neutral',
          labelPos: { x: point.x + 16, y: point.y - 12 },
        }
      }

      const direction = span >= 0 ? 1 : -1
      const radius = 14 + Math.min(spanMagnitude * 0.2, 22)
      const startAngle = direction > 0 ? -Math.PI / 2 : Math.PI / 2
      const endAngle = direction > 0 ? Math.PI / 2 : -Math.PI / 2
      const startPoint = {
        x: point.x + radius * Math.cos(startAngle),
        y: point.y + radius * Math.sin(startAngle),
      }
      const endPoint = {
        x: point.x + radius * Math.cos(endAngle),
        y: point.y + radius * Math.sin(endAngle),
      }
      const sweepFlag = direction > 0 ? 1 : 0
      const arrowBaseAngle = endAngle + (direction > 0 ? Math.PI / 2 : -Math.PI / 2)
      const arrowWing = (offset) => ({
        x: endPoint.x - 6 * Math.cos(arrowBaseAngle + offset),
        y: endPoint.y - 6 * Math.sin(arrowBaseAngle + offset),
      })
      const wingLeft = arrowWing(-Math.PI / 6)
      const wingRight = arrowWing(Math.PI / 6)

      return {
        joint,
        momentLine: {
          x1: point.x,
          y1: point.y,
          x2: barX,
          y2: point.y,
          direction,
        },
        arcPath: `M ${startPoint.x.toFixed(2)} ${startPoint.y.toFixed(2)} A ${radius.toFixed(2)} ${radius
          .toFixed(2)} 0 0 ${sweepFlag} ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)}`,
        arrowPath: `M ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)} L ${wingLeft.x.toFixed(2)} ${wingLeft.y.toFixed(2)} M ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)} L ${wingRight.x.toFixed(2)} ${wingRight.y.toFixed(2)}`,
        label: `${formatTorque(torque.perJoint[joint] ?? 0)} Nm`,
        leverLabel: `${direction > 0 ? 'CW' : 'CCW'} ${spanMagnitude.toFixed(0)}px`,
        labelPos: {
          x: point.x + span / 2,
          y: point.y - (direction > 0 ? 14 : 28),
        },
      }
    })
}

const AnimationCanvas = ({
  title,
  joints,
  limbs,
  barPosition,
  rootPosition,
  torque,
  progress = 0,
  phase,
  surfaces = {},
  angles,
}) => {
  const gridLines = useMemo(() => buildGridLines(), [])
  const barX = barPosition?.x ?? CANVAS_WIDTH / 2
  const torqueGlyphs = useMemo(() => buildTorqueGlyphs(joints, barPosition, torque), [barPosition, joints, torque])
  const trackedJoints = useMemo(() => Object.keys(joints ?? {}), [joints])

  const groundY = surfaces.ground ?? CANVAS_HEIGHT - 12
  const benchTop = surfaces.benchTop
  const benchHeight = surfaces.benchHeight ?? 28

  const highlightedJoints = trackedJoints.filter((joint) => KEY_JOINTS.has(joint))

  return (
    <div className="flex flex-col gap-3 rounded border border-black/20 bg-white px-4 py-3 text-black shadow-[4px_4px_0_0_rgba(0,0,0,0.12)]">
      <header className="flex items-end justify-between text-[11px] uppercase tracking-[0.3em] text-black/60">
        <div>
          <p className="text-black">{title}</p>
          <p className="text-[10px]">Phase · {phase ?? 'Cycle'} · {Math.round((progress ?? 0) * 100)}%</p>
        </div>
        {torque && (
          <div className="text-right text-[10px] leading-tight">
            <p>Total torque</p>
            <p className="text-black text-sm font-semibold tracking-tight">{torque.total.toFixed(2)} Nm</p>
          </div>
        )}
      </header>
      <svg
        viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
        className="h-[320px] w-full rounded border border-black/10 bg-[#fdfdf7]"
        role="img"
        aria-label={`${title} single-view diagram`}
      >
        {gridLines.map((line, index) =>
          line.type === 'horizontal' ? (
            <line
              key={`h-${index}`}
              x1={0}
              y1={line.offset}
              x2={CANVAS_WIDTH}
              y2={line.offset}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
          ) : (
            <line
              key={`v-${index}`}
              x1={line.offset}
              y1={0}
              x2={line.offset}
              y2={CANVAS_HEIGHT}
              stroke="rgba(0,0,0,0.08)"
              strokeWidth={1}
            />
          ),
        )}

        <line
          x1={barX}
          y1={0}
          x2={barX}
          y2={CANVAS_HEIGHT}
          stroke="black"
          strokeWidth={1.5}
          strokeDasharray="6 6"
        />

        {typeof groundY === 'number' && (
          <rect x={0} y={groundY} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - groundY} fill="rgba(0,0,0,0.05)" />
        )}

        {typeof benchTop === 'number' && (
          <rect
            x={CANVAS_WIDTH * 0.18}
            y={benchTop}
            width={CANVAS_WIDTH * 0.64}
            height={benchHeight}
            fill="rgba(0,0,0,0.05)"
            stroke="black"
            strokeWidth={1}
          />
        )}

        {torqueGlyphs.map(({ joint, momentLine, arcPath, arrowPath, labelPos, label, leverLabel }) => (
          <g key={`torque-${joint}`}>
            {momentLine && (
              <line
                x1={momentLine.x1}
                y1={momentLine.y1}
                x2={momentLine.x2}
                y2={momentLine.y2}
                stroke="black"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            {arcPath && <path d={arcPath} stroke="black" strokeWidth={1} fill="none" />}
            {arrowPath && <path d={arrowPath} stroke="black" strokeWidth={1} fill="none" />}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              className="fill-black text-[9px]"
            >
              {label}
            </text>
            <text
              x={labelPos.x}
              y={labelPos.y + 10}
              textAnchor="middle"
              className="fill-black/60 text-[8px] uppercase tracking-[0.2em]"
            >
              {leverLabel}
            </text>
          </g>
        ))}

        {barPosition && (
          <g>
            <line
              x1={barPosition.x - 60}
              y1={barPosition.y}
              x2={barPosition.x + 60}
              y2={barPosition.y}
              stroke="black"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={barPosition.x} cy={barPosition.y} r={9} fill="white" stroke="black" strokeWidth={2} />
          </g>
        )}

        <StickFigure
          joints={joints}
          limbs={limbs}
          nodeRadius={5}
          strokeWidth={3}
          accentJoint={highlightedJoints}
          className="stroke-black fill-white"
        />

        {rootPosition && (
          <circle cx={rootPosition.x} cy={rootPosition.y} r={4} fill="black" stroke="white" strokeWidth={1} />
        )}

        {angles && (
          <g className="text-[8px] uppercase tracking-[0.2em] fill-black/60">
            {Object.entries(angles)
              .filter(([joint]) => KEY_JOINTS.has(joint) && joints?.[joint])
              .map(([joint, { absolute }]) => (
                <text key={`angle-${joint}`} x={joints[joint].x + 8} y={joints[joint].y + 4}>
                  {absolute.toFixed(0)}°
                </text>
              ))}
          </g>
        )}
      </svg>
      <footer className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-black/60">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-black bg-black" />
          <span>Torque direction markers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1 w-24 overflow-hidden rounded-full border border-black/40">
            <span
              className="block h-full bg-black"
              style={{ width: `${Math.round((progress ?? 0) * 100)}%` }}
            />
          </span>
          <span>Cycle progress</span>
        </div>
      </footer>
    </div>
  )
}

export default AnimationCanvas
