# light-weight — Global Context & Implementation Guide (for Coding Agent)

This document provides global context, design rationale, folder structure, API references, coding conventions, and example code for the refactor of **light-weight** from stick‑figure animation to a **charts‑first** application. This file supplements the stage-by-stage prompts. The agent should read this document before starting any stage.

================================================================================
1) PRODUCT GOAL & UX PRINCIPLES
--------------------------------------------------------------------------------
• Purpose: Educate lifters on biomechanics of the Big 3 (squat/bench/deadlift) using
  synchronized charts derived from precomputed datasets (OpenSim or light 2D estimates).
• No live physics/kinematics in the browser. Data is static JSON per scenario.
• Visual style: Old Mac System 7 / vintage geek. Tone for microcopy: Ronnie Coleman &
  Pavel Tsatsouline (short, punchy, coach-like cues).
• Key UX behaviors:
  - Synchronized charts with shared cursor (hover/drag) and phase overlays.
  - Scenario selector (lift, variant, load).
  - Insights panel with concise cues and warnings.
  - Optional compare mode (A vs B) normalized to 0–100% of the rep.

================================================================================
2) TECH STACK
--------------------------------------------------------------------------------
• React + Vite
• Charting: Highcharts (preferred) or ECharts with React wrapper
• State: Local component state + lightweight hooks (no Redux unless needed)
• Styling: Keep existing System 7 components and styles. Reuse frame/window chrome.
• Data: Versioned static JSON under src/features/powerlifting/data/
• Types: Optional TypeScript typings (JSDoc or .d.ts) — see section 7.
• Lint/format: ESLint + Prettier (or match project defaults)

================================================================================
3) FOLDER STRUCTURE
--------------------------------------------------------------------------------
src/
└─ features/
   └─ powerlifting/
      ├─ components/
      │  ├─ VintageControlPanel.jsx           # existing
      │  ├─ Stepper.jsx                       # existing
      │  ├─ ControlModule.jsx                 # existing frames
      │  ├─ TimeSeriesPanel.jsx               # NEW container for charts
      │  ├─ ChartAngles.jsx                   # NEW
      │  ├─ ChartMoments.jsx                  # NEW
      │  ├─ ChartGRF.jsx                      # NEW
      │  ├─ ChartBarPath.jsx                  # NEW
      │  ├─ PhaseBands.jsx                    # NEW
      │  └─ InsightsPanel.jsx                 # NEW
      ├─ hooks/
      │  ├─ usePowerlifting.js                # orchestrates selection & UI
      │  ├─ useDatasets.js                    # NEW load/normalize JSON
      │  ├─ useSyncCursor.js                  # NEW cross-chart hover
      │  └─ useInsights.js                    # NEW rules → coach cues
      ├─ lib/
      │  ├─ content.js                        # vintage copy, quotes
      │  ├─ liftData.js                       # catalog of scenarios
      │  └─ setupParameters.js                # existing app params
      └─ data/
         ├─ squat_highbar_80.json
         ├─ squat_lowbar_80.json
         ├─ deadlift_conv_80.json
         └─ bench_narrow_70.json

public/ (optional assets, fonts, icons)

================================================================================
4) DATA CONTRACT (JSON SCHEMA)
--------------------------------------------------------------------------------
Each scenario is one rep or averaged rep, precomputed offline.

{
  "meta": {
    "lift": "squat" | "bench" | "deadlift",
    "variant": "highbar" | "lowbar" | "conventional" | "sumo" | "narrow" | "wide" | "...",
    "load_pct_1rm": 80,
    "fps": 100,
    "subject": "generic_m_75kg",
    "source": "opensim|approx2d",
    "version": "1.0.0"
  },
  "events": [
    {"name":"descent","t0":0.12,"t1":0.48},
    {"name":"bottom","t":0.48},
    {"name":"sticking","t":0.63},
    {"name":"lockout","t":0.98}
  ],
  "series": {
    "time": [0.00,0.01,...],            // seconds
    "time_norm": [0.0,0.01,...],        // 0..1 (optional; used by compare mode)

    // Angles (deg)
    "hip_angle":[...],
    "knee_angle":[...],
    "ankle_angle":[...],
    "shoulder_angle":[...],
    "elbow_angle":[...],

    // Net joint moments (Nm)
    "hip_moment":[...],
    "knee_moment":[...],
    "ankle_moment":[...],
    "shoulder_moment":[...],
    "elbow_moment":[...],

    // Ground reaction forces (N)
    "grf_v":[...],
    "grf_ap":[...],
    "grf_ml":[...],

    // Bar path (m)
    "bar_y":[...],

    // Optional muscle metrics (0..1 activations or N forces)
    "quad_activation":[...],
    "glute_activation":[...],
    "ham_activation":[...],
    "pec_activation":[...],
    "delt_activation":[...],
    "triceps_activation":[...],

    // Optional spine loads (N)
    "spine_comp":[...],
    "spine_shear":[...]
  }
}

Rules:
• Prefer consistent names across lifts; missing keys can be omitted.
• Keep files ≤200 KB by downsampling (50–100 Hz).
• time_norm is recommended for compare mode.

================================================================================
5) PUBLIC API (FRONTEND HOOKS & COMPONENT PROPS)
--------------------------------------------------------------------------------
5.1 useDatasets()  — loads & normalizes scenario data
Return:
{
  scenario,                    // current scenario id
  data,                        // parsed JSON { meta, events, series }
  isLoading, error,
  setScenario(id: string),     // updates selection and refetches
}

5.2 useSyncCursor() — shared cursor for all charts
Return:
{
  frameIndex,                  // number | null
  setFrameIndex(i: number|null),
  onHover(time: number),       // helper to map time→index if needed
}

5.3 useInsights(data) — derive coach cues (strings)
Return:
{
  cues: string[],              // e.g., ["Peak knee moment at 32% — brace!"]
  metrics: Record<string, any> // optional numeric summary
}

5.4 TimeSeriesPanel props
{
  data,                        // from useDatasets
  cursor,                      // { frameIndex, setFrameIndex, ... }
  compareData?: data|null,     // optional scenario B
}

5.5 InsightsPanel props
{
  cues: string[],
  metrics?: Record<string, any>
}

================================================================================
6) CODING CONVENTIONS
--------------------------------------------------------------------------------
• Use functional components and hooks.
• Keep components small; charts get their own files.
• Do not hardcode scenario names inside components; pass via props or hooks.
• Keep System 7 styles in place; reuse ControlModule frame wrappers.
• Avoid global mutable state; keep logic colocated with features.
• Prefer descriptive names: knee_moment, bar_y, spine_comp, etc.

================================================================================
7) TYPES (OPTIONAL TS OR JSDOC)
--------------------------------------------------------------------------------
/** @typedef {{lift:string, variant:string, load_pct_1rm:number, fps:number,
  subject?:string, source?:string, version?:string}} Meta */

/** @typedef {{name:string, t?:number, t0?:number, t1?:number}} Event */

/** @typedef {{[seriesName:string]: number[]}} Series */

/** @typedef {{meta:Meta, events:Event[], series:Series}} ScenarioData */

================================================================================
8) EXAMPLE CODE — HOOKS & PANELS
--------------------------------------------------------------------------------
// hooks/useDatasets.js
import { useEffect, useState } from "react";

export function useDatasets(initialScenario = "squat_highbar_80") {
  const [scenario, setScenario] = useState(initialScenario);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    import(`../data/${scenario}.json`)
      .then(mod => {
        if (!alive) return;
        const d = mod.default || mod;
        // normalize: ensure time_norm exists
        if (!d.series.time_norm && d.series.time) {
          const t = d.series.time;
          const t0 = t[0], t1 = t[t.length-1] || t0;
          d.series.time_norm = t.map(v => (t1===t0 ? 0 : (v - t0) / (t1 - t0)));
        }
        setData(d);
      })
      .catch(e => setError(e))
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, [scenario]);

  return { scenario, data, error, isLoading, setScenario };
}

// hooks/useSyncCursor.js
import { useState, useCallback } from "react";
export function useSyncCursor() {
  const [frameIndex, setFrameIndex] = useState(null);
  const onHover = useCallback((timeArray, t) => {
    if (!timeArray?.length) return null;
    // nearest index (linear search fine for 100–200 points)
    let best = 0, bestDiff = Infinity;
    for (let i=0;i<timeArray.length;i++){
      const diff = Math.abs(timeArray[i] - t);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    setFrameIndex(best);
    return best;
  }, []);
  return { frameIndex, setFrameIndex, onHover };
}

// hooks/useInsights.js
export function useInsights(data) {
  if (!data) return { cues: [] };
  const s = data.series || {};
  const cues = [];
  // Example: knee vs hip dominance during concentric
  const t = s.time_norm || s.time || [];
  const km = s.knee_moment || [];
  const hm = s.hip_moment || [];
  let start = 0, end = t.length - 1;
  // naive: assume 0.5..1 is concentric if events unknown
  if (data.events?.length) {
    // find bottom/sticking from events if available
  }
  const sumAbs = arr => arr.slice(start, end+1).reduce((a,v)=>a+Math.abs(v||0),0);
  const kneeSum = sumAbs(km), hipSum = sumAbs(hm);
  if (kneeSum + hipSum > 0) {
    const idx = kneeSum/(kneeSum+hipSum);
    if (idx > 0.6) cues.push("Knee‑dominant concentric — brace & keep shins honest.");
    if (idx < 0.4) cues.push("Hip‑dominant concentric — squeeze glutes, drive hips.");
  }
  // add more rules as needed
  return { cues };
}

// components/TimeSeriesPanel.jsx
import React from "react";
import ChartAngles from "./ChartAngles.jsx";
import ChartMoments from "./ChartMoments.jsx";
import ChartGRF from "./ChartGRF.jsx";
import ChartBarPath from "./ChartBarPath.jsx";
import PhaseBands from "./PhaseBands.jsx";
import ControlModule from "./ControlModule.jsx";

export default function TimeSeriesPanel({ data, cursor, compareData }) {
  if (!data) return <ControlModule title="Charts">Loading…</ControlModule>;
  return (
    <ControlModule title="Charts">
      <PhaseBands events={data.events} />
      <ChartAngles data={data} cursor={cursor} compareData={compareData} />
      <ChartMoments data={data} cursor={cursor} compareData={compareData} />
      <ChartGRF data={data} cursor={cursor} compareData={compareData} />
      <ChartBarPath data={data} cursor={cursor} compareData={compareData} />
    </ControlModule>
  );
}

================================================================================
9) EXAMPLE CODE — HIGHCHARTS WIRING (ANGLES)
--------------------------------------------------------------------------------
// components/ChartAngles.jsx
import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function ChartAngles({ data, cursor, compareData }) {
  const s = data.series;
  const series = [
    { name: "Hip (deg)", data: s.hip_angle?.map((v,i)=>[s.time[i], v]) || [] },
    { name: "Knee (deg)", data: s.knee_angle?.map((v,i)=>[s.time[i], v]) || [] },
    { name: "Ankle (deg)", data: s.ankle_angle?.map((v,i)=>[s.time[i], v]) || [] },
  ];
  if (compareData?.series) {
    const c = compareData.series;
    series.push({ name:"Hip (B)", dashStyle:"ShortDash", data: c.hip_angle?.map((v,i)=>[c.time[i], v]) || [] });
    series.push({ name:"Knee (B)", dashStyle:"ShortDash", data: c.knee_angle?.map((v,i)=>[c.time[i], v]) || [] });
  }
  const options = useMemo(() => ({
    title: { text: "Angles" },
    credits: { enabled: false },
    legend: { enabled: true },
    xAxis: { title: { text: "Time (s)" }, crosshair: true },
    yAxis: { title: { text: "Degrees" } },
    tooltip: { shared: true },
    series,
  }), [data, compareData]);

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

================================================================================
10) PERFORMANCE & ACCESSIBILITY
--------------------------------------------------------------------------------
• Keep datasets small; downsample to ≤200 points per series if possible.
• Use requestIdleCallback for heavy parsing if needed.
• Keyboard navigation: provide focus rings and key toggles for compare mode.
• Color-contrast: respect System 7 look but ensure readable lines.
• Avoid infinite re-renders; memoize options/series.

================================================================================
11) ERROR HANDLING & EMPTY STATES
--------------------------------------------------------------------------------
• If JSON missing → show vintage error card with file name & quick hint.
• If series missing (e.g., elbow_angle on squat) → chart hides that line silently.
• If events missing → PhaseBands renders nothing; insights use default heuristics.

================================================================================
12) TESTING & CI CHECKS
--------------------------------------------------------------------------------
• Unit test hooks: useDatasets (normalization), useInsights (simple rules).
• Smoke test charts render with sample JSON.
• Lint & format checks pre-commit.

================================================================================
13) GIT WORKFLOW & PR CHECKLIST
--------------------------------------------------------------------------------
• One stage per feature branch (agent creates it).
• PR must include: code, updated README if schema/behavior changed, sample JSON.
• Visual check: System 7 chrome preserved, text tone consistent.
• No secrets or external network calls beyond data imports.

================================================================================
14) OFFLINE PIPELINE (REFERENCE ONLY — OUT OF SCOPE FOR FRONTEND)
--------------------------------------------------------------------------------
• Use OpenSim 4.x Python API: IK → ID → SO → JointReaction → CSV → JSON.
• Keep naming consistent with schema above.
• A tiny example converter (pseudocode):
  - Read .sto/.mot tables to DataFrame.
  - Select columns → rename to hip_angle, knee_moment, etc.
  - Build {meta, events, series}; compute time_norm.
  - Write JSON with sorted, rounded numbers.

================================================================================
15) COPY STYLE (VINTAGE + COACH)
--------------------------------------------------------------------------------
• Short cues, active voice: “Brace!”, “Drive hips!”, “Keep bar close.”
• Occasional fun nods: “Lightweight, baby.” “Grease the groove.”
• Avoid jargon without context; prefer concrete actions tied to chart peaks.

================================================================================
16) DONE DEFINITION (FRONTEND)
--------------------------------------------------------------------------------
• Charts-first UI fully replaces animation.
• At least 3 sample scenarios render (squat, bench, deadlift).
• Shared cursor + phase overlays working.
• Insights panel produces at least 2 cues per scenario.
• README documents schema and how to add datasets.

