import { useMemo } from 'react'

import StickFigure from './StickFigure'

const GRID_STEP = 32
const BAR_HALF_SPAN = 60
const SCENE_PADDING_X = 72
const SCENE_PADDING_Y = 96
const MIN_SCENE_WIDTH = 360
const MIN_SCENE_HEIGHT = 360
const KEY_JOINTS = new Set(['foot', 'knee', 'hip', 'shoulder', 'elbow', 'grip'])

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const buildGridLines = (bounds) => {
  if (!bounds) return []

  const lines = []
  const startX = Math.floor(bounds.minX / GRID_STEP) * GRID_STEP
  for (let x = startX; x <= bounds.maxX; x += GRID_STEP) {
    lines.push({ type: 'vertical', position: x })
  }

  const startY = Math.floor(bounds.minY / GRID_STEP) * GRID_STEP
  for (let y = startY; y <= bounds.maxY; y += GRID_STEP) {
    lines.push({ type: 'horizontal', position: y })
  }

  return lines
}

const formatTorque = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`

const buildTorqueGlyphs = (joints, barPosition, torque, bounds) => {
  if (!joints || !barPosition || !torque?.leverArms) {
    return []
  }

  const barX = barPosition.x

  const labelMargins = {
    minX: bounds ? bounds.minX + 24 : Number.NEGATIVE_INFINITY,
    maxX: bounds ? bounds.maxX - 24 : Number.POSITIVE_INFINITY,
    minY: bounds ? bounds.minY + 24 : Number.NEGATIVE_INFINITY,
    maxY: bounds ? bounds.maxY - 24 : Number.POSITIVE_INFINITY,
  }

  return Object.entries(torque.leverArms)
    .filter(([joint]) => KEY_JOINTS.has(joint) && joints[joint])
    .map(([joint]) => {
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
          labelPos: {
            x: clamp(point.x + 16, labelMargins.minX, labelMargins.maxX),
            y: clamp(point.y - 12, labelMargins.minY, labelMargins.maxY),
          },
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
        arrowPath: `M ${endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)} L ${wingLeft.x.toFixed(2)} ${wingLeft.y.toFixed(2)} M ${
endPoint.x.toFixed(2)} ${endPoint.y.toFixed(2)} L ${wingRight.x.toFixed(2)} ${wingRight.y.toFixed(2)}`,
        label: `${formatTorque(torque.perJoint[joint] ?? 0)} Nm`,
        leverLabel: `${direction > 0 ? 'CW' : 'CCW'} ${spanMagnitude.toFixed(0)}px`,
        labelPos: {
          x: clamp(point.x + span / 2, labelMargins.minX, labelMargins.maxX),
          y: clamp(point.y - (direction > 0 ? 14 : 28), labelMargins.minY, labelMargins.maxY),
        },
      }
    })
}

const computeSceneBounds = (joints = {}, barPosition, surfaces = {}) => {
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

  Object.values(joints).forEach(({ x, y }) => includePoint(x, y))

  if (barPosition) {
    includePoint(barPosition.x, barPosition.y)
    includePoint(barPosition.x - BAR_HALF_SPAN, barPosition.y)
    includePoint(barPosition.x + BAR_HALF_SPAN, barPosition.y)
  }

  if (typeof surfaces.ground === 'number') {
    includePoint(barPosition?.x ?? 0, surfaces.ground)
  }

  if (typeof surfaces.benchTop === 'number') {
    includePoint(barPosition?.x ?? 0, surfaces.benchTop)
    includePoint(barPosition?.x ?? 0, surfaces.benchTop + (surfaces.benchHeight ?? 0))
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return {
      minX: 0,
      maxX: MIN_SCENE_WIDTH,
      minY: 0,
      maxY: MIN_SCENE_HEIGHT,
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
  sceneBounds,
}) => {
  const fallbackBounds = useMemo(
    () =>
      sceneBounds ?? {
        minX: 0,
        maxX: MIN_SCENE_WIDTH,
        minY: 0,
        maxY: MIN_SCENE_HEIGHT,
      },
    [sceneBounds],
  )

  const viewBounds = useMemo(() => {
    if (sceneBounds) return sceneBounds
    return computeSceneBounds(joints, barPosition, surfaces)
  }, [barPosition, joints, sceneBounds, surfaces])
  const viewWidth = viewBounds.maxX - viewBounds.minX
  const viewHeight = viewBounds.maxY - viewBounds.minY

  const gridLines = useMemo(() => buildGridLines(viewBounds), [viewBounds])
  const barX = barPosition?.x ?? (fallbackBounds.minX + fallbackBounds.maxX) / 2
  const torqueGlyphs = useMemo(
    () => buildTorqueGlyphs(joints, barPosition, torque, viewBounds),
    [barPosition, joints, torque, viewBounds],
  )
  const trackedJoints = useMemo(() => Object.keys(joints ?? {}), [joints])

  const groundY = surfaces.ground
  const benchTop = surfaces.benchTop
  const benchHeight = surfaces.benchHeight ?? 28

  const highlightedJoints = trackedJoints.filter((joint) => KEY_JOINTS.has(joint))

  const benchWidth = Math.min(viewWidth * 0.64, viewWidth)
  const benchX = clamp(viewBounds.minX + viewWidth * 0.18, viewBounds.minX, viewBounds.maxX - benchWidth)

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 rounded border border-black/40 bg-white px-4 py-3 text-[#0c0c0c] shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]">
      <header className="flex items-end justify-between text-[11px] uppercase tracking-[0.25em] text-black/70">
        <div>
          <p className="text-black">{title}</p>
          <p className="text-[10px] text-black/60">Phase · {phase ?? 'Cycle'} · {Math.round((progress ?? 0) * 100)}%</p>
        </div>
        {torque && (
          <div className="text-right text-[10px] leading-tight text-black/70">
            <p>Total torque</p>
            <p className="text-sm font-semibold tracking-tight text-black">{torque.total.toFixed(2)} Nm</p>
          </div>
        )}
      </header>
      <svg
        viewBox={`${viewBounds.minX.toFixed(2)} ${viewBounds.minY.toFixed(2)} ${viewWidth.toFixed(2)} ${viewHeight.toFixed(2)}`}
        className="h-full min-h-0 w-full flex-1 rounded border border-black/30 bg-[#f5f5f5]"
        role="img"
        aria-label={`${title} single-view diagram`}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridLines.map((line, index) =>
          line.type === 'horizontal' ? (
            <line
              key={`h-${index}`}
              x1={viewBounds.minX}
              y1={line.position}
              x2={viewBounds.maxX}
              y2={line.position}
              stroke="#d0d0d0"
              strokeWidth={1}
            />
          ) : (
            <line
              key={`v-${index}`}
              x1={line.position}
              y1={viewBounds.minY}
              x2={line.position}
              y2={viewBounds.maxY}
              stroke="#d0d0d0"
              strokeWidth={1}
            />
          ),
        )}

        <line
          x1={barX}
          y1={viewBounds.minY}
          x2={barX}
          y2={viewBounds.maxY}
          stroke="#000000"
          strokeWidth={1.5}
          strokeDasharray="6 6"
        />

        {typeof groundY === 'number' && (
          <rect
            x={viewBounds.minX}
            y={groundY}
            width={viewWidth}
            height={Math.max(0, viewBounds.maxY - groundY)}
            fill="#e5e5e5"
          />
        )}

        {typeof benchTop === 'number' && (
          <rect
            x={benchX}
            y={benchTop}
            width={benchWidth}
            height={benchHeight}
            fill="#ededed"
            stroke="#000000"
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
                stroke="#000000"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            {arcPath && <path d={arcPath} stroke="#0c0c0c" strokeWidth={1} fill="none" />}
            {arrowPath && <path d={arrowPath} stroke="#0c0c0c" strokeWidth={1} fill="none" />}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              className="fill-[#0c0c0c] text-[9px]"
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
              x1={barPosition.x - BAR_HALF_SPAN}
              y1={barPosition.y}
              x2={barPosition.x + BAR_HALF_SPAN}
              y2={barPosition.y}
              stroke="#0c0c0c"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={barPosition.x} cy={barPosition.y} r={9} fill="#ffffff" stroke="#0c0c0c" strokeWidth={2} />
          </g>
        )}

        <StickFigure
          joints={joints}
          limbs={limbs}
          nodeRadius={5}
          strokeWidth={3}
          accentJoint={highlightedJoints}
          className="stroke-[#0c0c0c] fill-[#ffffff]"
        />

        {rootPosition && (
          <circle cx={rootPosition.x} cy={rootPosition.y} r={4} fill="#0c0c0c" stroke="#ffffff" strokeWidth={1} />
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
      <footer className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-black/70">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm border border-black bg-black" />
          <span>Torque direction markers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1 w-24 overflow-hidden rounded-full border border-black/40">
            <span className="block h-full bg-black" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
          </span>
          <span>Cycle progress</span>
        </div>
      </footer>
    </div>
  )
}

export default AnimationCanvas
