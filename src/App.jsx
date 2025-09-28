import { useEffect, useMemo, useState } from 'react'

import MainLayout from './components/layout/MainLayout'
import VintageWindow from './components/layout/VintageWindow'
import Typewriter from './components/effects/Typewriter'
import AnimationCanvas from './features/powerlifting/components/AnimationCanvas'
import VintageControlPanel from './features/powerlifting/components/VintageControlPanel';

// ... (imports remain the same)

const App = () => {
  // ... (hooks and handlers remain the same)

  return (
    <MainLayout>
      <div className="flex flex-1 min-h-0 gap-4">
        <VintageWindow title="Animation" className="w-3/5">
          <AnimationCanvas
            title={`${selectedLift} torque study`}
            joints={joints}
            limbs={limbs}
            barPosition={barPosition}
            rootPosition={rootPosition ?? joints?.[root]}
            torque={torque}
            progress={progress}
            phase={phase}
            surfaces={surfaces}
            angles={angles}
            sceneBounds={sceneBounds}
          />
        </VintageWindow>
        <VintageWindow title="Controls" className="w-2/5 flex flex-col gap-4">
          <VintageControlPanel {...props} />
        </VintageWindow>
      </div>
      <VintageWindow title="Coach's Cue" className="h-24 font-mono text-sm">
        <Typewriter text={cue} />
      </VintageWindow>
    </MainLayout>
  );
}

export default App;
