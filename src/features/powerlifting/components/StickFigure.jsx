const StickFigure = ({ joints, limbs, nodeRadius = 6, strokeWidth = 3, accentJoint }) => {
  if (!joints || !limbs) {
    return null
  }

  const accentLookup = Array.isArray(accentJoint)
    ? new Set(accentJoint)
    : accentJoint

  return (
    <g>
      {limbs.map(({ from, to }) => {
        const fromPoint = joints[from]
        const toPoint = joints[to]
        if (!fromPoint || !toPoint) return null
        return (
          <line
            key={`${from}-${to}`}
            x1={fromPoint.x}
            y1={fromPoint.y}
            x2={toPoint.x}
            y2={toPoint.y}
            className="stroke-current"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )
      })}

      {Object.entries(joints).map(([key, point]) => (
        <circle
          key={key}
          cx={point.x}
          cy={point.y}
          r={nodeRadius}
          className={
            accentLookup instanceof Set
              ? accentLookup.has(key)
                ? 'fill-zinc-50'
                : 'fill-current'
              : key === accentLookup
                ? 'fill-zinc-50'
                : 'fill-current'
          }
        />
      ))}
    </g>
  )
}

export default StickFigure
