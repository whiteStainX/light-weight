import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { liftData } from '../lib/liftData.js';
import {
  TORQUE_FORCE,
  getKinematicsSnapshot,
} from './useKinematics.js';

const toLimbKey = (from, to) => `${from}->${to}`;

describe('useKinematics geometry and torque', () => {
  it('reconstructs squat default geometry and torque values', () => {
    const snapshot = getKinematicsSnapshot('Squat');
    const { jointCoordinates, limbLengths, torqueEstimates, defaultAngles } = snapshot;
    const { path, limbs } = liftData.Squat;

    limbs.forEach(({ from, to }) => {
      const expectedLength = Math.hypot(
        path[to].x - path[from].x,
        path[to].y - path[from].y,
      );
      assert.ok(
        Math.abs(limbLengths[toLimbKey(from, to)] - expectedLength) < 1e-5,
        'segment length matches default geometry',
      );

      const parent = jointCoordinates[from];
      const child = jointCoordinates[to];
      assert.ok(parent, 'parent joint is defined');
      assert.ok(child, 'child joint is defined');
      const actualLength = Math.hypot(child.x - parent.x, child.y - parent.y);
      assert.ok(Math.abs(actualLength - expectedLength) < 1e-5, 'limb length preserved');

      const expectedTorque =
        expectedLength * Math.sin(defaultAngles[to] - Math.PI / 2) * TORQUE_FORCE;
      assert.ok(
        Math.abs(torqueEstimates[to] - expectedTorque) < 1e-5,
        'torque matches gravitational estimate',
      );
    });

    Object.entries(path).forEach(([joint, coordinates]) => {
      if (joint === 'bar') return;
      const { x, y } = jointCoordinates[joint];
      assert.ok(Math.abs(x - coordinates.x) < 1e-5, 'joint x coordinate matches default');
      assert.ok(Math.abs(y - coordinates.y) < 1e-5, 'joint y coordinate matches default');
    });
  });

  it('updates bench geometry and torque when the elbow angle changes', () => {
    const baseSnapshot = getKinematicsSnapshot('Bench');
    const elbowDelta = 0.25;
    const nextElbowAngle = baseSnapshot.defaultAngles.elbow + elbowDelta;

    const updated = getKinematicsSnapshot('Bench', {
      jointAngles: { elbow: nextElbowAngle },
    });

    const shoulder = liftData.Bench.path.shoulder;
    const upperArmLength = baseSnapshot.limbLengths[toLimbKey('shoulder', 'elbow')];
    const expectedElbow = {
      x: shoulder.x + Math.cos(nextElbowAngle) * upperArmLength,
      y: shoulder.y + Math.sin(nextElbowAngle) * upperArmLength,
    };

    assert.ok(
      Math.abs(updated.jointCoordinates.elbow.x - expectedElbow.x) < 1e-5,
      'elbow x coordinate updates from angle change',
    );
    assert.ok(
      Math.abs(updated.jointCoordinates.elbow.y - expectedElbow.y) < 1e-5,
      'elbow y coordinate updates from angle change',
    );

    const forearmLength = baseSnapshot.limbLengths[toLimbKey('elbow', 'grip')];
    const gripAngle = baseSnapshot.defaultAngles.grip;
    const expectedGrip = {
      x: expectedElbow.x + Math.cos(gripAngle) * forearmLength,
      y: expectedElbow.y + Math.sin(gripAngle) * forearmLength,
    };

    assert.ok(
      Math.abs(updated.jointCoordinates.grip.x - expectedGrip.x) < 1e-5,
      'grip x coordinate follows elbow rotation',
    );
    assert.ok(
      Math.abs(updated.jointCoordinates.grip.y - expectedGrip.y) < 1e-5,
      'grip y coordinate follows elbow rotation',
    );

    const expectedTorque =
      upperArmLength * Math.sin(nextElbowAngle - Math.PI / 2) * TORQUE_FORCE;
    assert.ok(
      Math.abs(updated.torqueEstimates.elbow - expectedTorque) < 1e-5,
      'elbow torque reflects new angle',
    );
    assert.ok(
      Math.abs(updated.torqueEstimates.elbow - baseSnapshot.torqueEstimates.elbow) > 1e-5,
      'elbow torque differs from baseline after adjustment',
    );
  });

  it('resolves deadlift adjustments and bar trajectory changes', () => {
    const baseSnapshot = getKinematicsSnapshot('Deadlift');
    const nextKneeAngle = baseSnapshot.defaultAngles.knee - 0.3;

    const barOverride = {
      x: baseSnapshot.barPosition.x + 12,
      y: baseSnapshot.barPosition.y - 18,
    };

    const updated = getKinematicsSnapshot('Deadlift', {
      jointAngles: { knee: nextKneeAngle },
      barPath: [barOverride],
    });

    const hip = liftData.Deadlift.path.hip;
    const thighLength = baseSnapshot.limbLengths[toLimbKey('hip', 'knee')];
    const expectedKnee = {
      x: hip.x + Math.cos(nextKneeAngle) * thighLength,
      y: hip.y + Math.sin(nextKneeAngle) * thighLength,
    };

    assert.ok(
      Math.abs(updated.jointCoordinates.knee.x - expectedKnee.x) < 1e-5,
      'knee x coordinate updates from adjustment',
    );
    assert.ok(
      Math.abs(updated.jointCoordinates.knee.y - expectedKnee.y) < 1e-5,
      'knee y coordinate updates from adjustment',
    );

    const shankLength = baseSnapshot.limbLengths[toLimbKey('knee', 'foot')];
    const footAngle = baseSnapshot.defaultAngles.foot;
    const expectedFoot = {
      x: expectedKnee.x + Math.cos(footAngle) * shankLength,
      y: expectedKnee.y + Math.sin(footAngle) * shankLength,
    };

    assert.ok(
      Math.abs(updated.jointCoordinates.foot.x - expectedFoot.x) < 1e-5,
      'foot x coordinate follows knee adjustment',
    );
    assert.ok(
      Math.abs(updated.jointCoordinates.foot.y - expectedFoot.y) < 1e-5,
      'foot y coordinate follows knee adjustment',
    );

    const expectedTorque =
      thighLength * Math.sin(nextKneeAngle - Math.PI / 2) * TORQUE_FORCE;
    assert.ok(
      Math.abs(updated.torqueEstimates.knee - expectedTorque) < 1e-5,
      'knee torque reflects adjusted geometry',
    );

    assert.strictEqual(updated.barTrajectory.length, 2);
    assert.deepStrictEqual(updated.barTrajectory[0], baseSnapshot.barPosition);
    assert.deepStrictEqual(updated.barTrajectory[1], barOverride);
  });
});
