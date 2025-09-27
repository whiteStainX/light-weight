import { useCallback, useEffect, useMemo, useState } from 'react';
import { liftData } from '../lib/liftData.js';

export const TORQUE_FORCE = 1;

const toLimbKey = (from, to) => `${from}->${to}`;

const isValidPoint = (point) =>
  Boolean(point) && Number.isFinite(point.x) && Number.isFinite(point.y);

export function computeLimbLengths(path, limbs) {
  const lengths = {};

  limbs.forEach(({ from, to }) => {
    const fromPoint = path[from];
    const toPoint = path[to];

    if (!fromPoint || !toPoint) {
      lengths[toLimbKey(from, to)] = 0;
      return;
    }

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    lengths[toLimbKey(from, to)] = Math.hypot(dx, dy);
  });

  return lengths;
}

export function computeDefaultAngles(path, limbs) {
  const angles = {};

  limbs.forEach(({ from, to }) => {
    const fromPoint = path[from];
    const toPoint = path[to];

    if (!fromPoint || !toPoint) {
      angles[to] = 0;
      return;
    }

    const dx = toPoint.x - fromPoint.x;
    const dy = toPoint.y - fromPoint.y;
    angles[to] = Math.atan2(dy, dx);
  });

  return angles;
}

export function findRootJoints(path, limbs) {
  const children = new Set(limbs.map(({ to }) => to));
  return Object.keys(path).filter((joint) => joint !== 'bar' && !children.has(joint));
}

export function resolveJointPositions({
  path,
  limbs,
  limbLengths,
  jointAngles,
  rootJoints,
}) {
  const resolved = {};

  rootJoints.forEach((joint) => {
    if (path[joint]) {
      resolved[joint] = { ...path[joint] };
    }
  });

  const remaining = limbs.map((limb) => ({ ...limb }));
  let iterations = 0;
  const maxIterations = limbs.length * 2;

  while (remaining.length && iterations < maxIterations) {
    const nextIteration = [];

    remaining.forEach((limb) => {
      const { from, to } = limb;
      const parent = resolved[from];

      if (!parent) {
        nextIteration.push(limb);
        return;
      }

      const angle = jointAngles[to];
      const length = limbLengths[toLimbKey(from, to)] ?? 0;

      resolved[to] = {
        x: parent.x + Math.cos(angle) * length,
        y: parent.y + Math.sin(angle) * length,
      };
    });

    if (nextIteration.length === remaining.length) {
      break;
    }

    remaining.splice(0, remaining.length, ...nextIteration);
    iterations += 1;
  }

  Object.entries(path).forEach(([joint, coordinates]) => {
    if (!resolved[joint] && joint !== 'bar') {
      resolved[joint] = { ...coordinates };
    }
  });

  return resolved;
}

export function buildBarTrajectory(defaultBar, overrides = []) {
  if (!defaultBar) {
    return [];
  }

  const trajectory = [{ ...defaultBar }];

  if (!Array.isArray(overrides)) {
    return trajectory;
  }

  overrides.forEach((point) => {
    if (isValidPoint(point)) {
      trajectory.push({ x: point.x, y: point.y });
    }
  });

  return trajectory;
}

export function calculateTorqueEstimates({
  limbs,
  limbLengths,
  jointAngles,
  defaultAngles,
}) {
  const torques = {};
  const gravityAngle = Math.PI / 2;

  limbs.forEach(({ from, to }) => {
    const length = limbLengths[toLimbKey(from, to)] ?? 0;
    const angle = jointAngles[to] ?? defaultAngles[to] ?? 0;
    const leverArm = length * Math.sin(angle - gravityAngle);
    torques[to] = leverArm * TORQUE_FORCE;
  });

  return torques;
}

export function getKinematicsSnapshot(
  liftType,
  { jointAngles: overridesAngles = {}, barPath: barOverrides = [] } = {},
) {
  const lift = liftData[liftType] ?? liftData.Squat;
  const { path, limbs } = lift;

  const limbLengths = computeLimbLengths(path, limbs);
  const defaultAngles = computeDefaultAngles(path, limbs);
  const rootJoints = findRootJoints(path, limbs);

  const resolvedJointAngles = { ...defaultAngles };
  Object.entries(overridesAngles || {}).forEach(([joint, value]) => {
    if (Number.isFinite(value)) {
      resolvedJointAngles[joint] = value;
    }
  });

  const jointCoordinates = resolveJointPositions({
    path,
    limbs,
    limbLengths,
    jointAngles: resolvedJointAngles,
    rootJoints,
  });

  const barTrajectory = buildBarTrajectory(path.bar, barOverrides);
  const barPosition =
    barTrajectory.length > 0 ? barTrajectory[barTrajectory.length - 1] : undefined;

  const torqueEstimates = calculateTorqueEstimates({
    limbs,
    limbLengths,
    jointAngles: resolvedJointAngles,
    defaultAngles,
  });

  return {
    limbLengths,
    defaultAngles,
    resolvedJointAngles,
    jointCoordinates,
    barTrajectory,
    barPosition,
    torqueEstimates,
  };
}

function computeInitialAdjustments(defaultAngles, jointOverrides = {}) {
  const adjustments = {};

  Object.entries(jointOverrides).forEach(([joint, value]) => {
    if (Number.isFinite(value) && defaultAngles[joint] !== undefined) {
      adjustments[joint] = value - defaultAngles[joint];
    }
  });

  return adjustments;
}

export function useKinematics({ liftType, jointOverrides } = {}) {
  const activeLiftType = liftType && liftData[liftType] ? liftType : 'Squat';

  const baseSnapshot = useMemo(
    () => getKinematicsSnapshot(activeLiftType),
    [activeLiftType],
  );

  const { defaultAngles } = baseSnapshot;

  const initialAdjustments = useMemo(
    () => computeInitialAdjustments(defaultAngles, jointOverrides),
    [defaultAngles, jointOverrides],
  );

  const [angleAdjustments, setAngleAdjustments] = useState(initialAdjustments);
  const [barPath, setBarPathState] = useState([]);

  useEffect(() => {
    setAngleAdjustments(initialAdjustments);
    setBarPathState([]);
  }, [initialAdjustments, activeLiftType]);

  const jointAngles = useMemo(() => {
    const resolved = { ...defaultAngles };
    Object.entries(angleAdjustments).forEach(([joint, delta]) => {
      resolved[joint] = defaultAngles[joint] + delta;
    });
    return resolved;
  }, [angleAdjustments, defaultAngles]);

  const snapshot = useMemo(
    () => getKinematicsSnapshot(activeLiftType, { jointAngles, barPath }),
    [activeLiftType, jointAngles, barPath],
  );

  const setJointAngle = useCallback(
    (joint, angle) => {
      if (!Number.isFinite(angle)) {
        return;
      }

      setAngleAdjustments((prev) => {
        const base = defaultAngles[joint] ?? 0;
        const delta = angle - base;
        if (Math.abs((prev[joint] ?? 0) - delta) < 1e-9) {
          return prev;
        }
        return { ...prev, [joint]: delta };
      });
    },
    [defaultAngles],
  );

  const adjustJointAngle = useCallback(
    (joint, delta) => {
      if (!Number.isFinite(delta)) {
        return;
      }
      setAngleAdjustments((prev) => ({
        ...prev,
        [joint]: (prev[joint] ?? 0) + delta,
      }));
    },
    [],
  );

  const resetJointAngles = useCallback(() => {
    setAngleAdjustments(initialAdjustments);
  }, [initialAdjustments]);

  const setBarPath = useCallback((points) => {
    if (!Array.isArray(points)) {
      setBarPathState([]);
      return;
    }

    const cleaned = points.filter((point) => isValidPoint(point));
    setBarPathState(cleaned);
  }, []);

  const appendBarPathPoint = useCallback((point) => {
    if (!isValidPoint(point)) {
      return;
    }
    setBarPathState((prev) => [...prev, { x: point.x, y: point.y }]);
  }, []);

  const resetBarPath = useCallback(() => {
    setBarPathState([]);
  }, []);

  return {
    limbLengths: snapshot.limbLengths,
    defaultAngles: snapshot.defaultAngles,
    jointAngles,
    resolvedJointAngles: snapshot.resolvedJointAngles,
    jointCoordinates: snapshot.jointCoordinates,
    barTrajectory: snapshot.barTrajectory,
    barPosition: snapshot.barPosition,
    torqueEstimates: snapshot.torqueEstimates,
    setJointAngle,
    adjustJointAngle,
    resetJointAngles,
    setBarPath,
    appendBarPathPoint,
    resetBarPath,
  };
}

export default useKinematics;
