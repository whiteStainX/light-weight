import { useMemo } from 'react';

import MainLayout from './components/layout/MainLayout';
import VintageWindow from './components/layout/VintageWindow';
import Typewriter from './components/effects/Typewriter';
import AnimationCanvas from './features/powerlifting/components/AnimationCanvas';
import VintageControlPanel from './features/powerlifting/components/VintageControlPanel';
import { usePowerlifting } from './features/powerlifting/hooks/usePowerlifting';
import { PARAMETER_DEFINITIONS, DEFAULT_SETUP_PARAMETERS } from './features/powerlifting/lib/setupParameters';
import { PAVEL_QUOTES, PAVEL_ASCII_ART } from './features/powerlifting/lib/content';

const App = () => {
  const {
    LIFT_OPTIONS,
    selectedLift,
    setSelectedLift,
    activeParameters,
    kinematics,
    animation,
    controls,
  } = usePowerlifting();

  const cue = useMemo(() => {
    const filteredQuotes = PAVEL_QUOTES.filter(q => q.toLowerCase().includes(selectedLift.toLowerCase()));
    const quotePool = filteredQuotes.length > 0 ? filteredQuotes : PAVEL_QUOTES;
    return quotePool[Math.floor(Math.random() * quotePool.length)];
  }, [selectedLift]);

  const parameterDefinitions = PARAMETER_DEFINITIONS[selectedLift] ?? [];

  return (
    <MainLayout>
      <div className="flex flex-1 min-h-0 gap-4">
        <VintageWindow title="Animation" className="w-3/5">
          <AnimationCanvas
            title={`${selectedLift} torque study`}
            joints={kinematics.joints}
            limbs={kinematics.limbs}
            barPosition={kinematics.barPosition}
            rootPosition={kinematics.rootPosition ?? kinematics.joints?.[kinematics.root]}
            torque={kinematics.torque}
            progress={animation.progress}
            phase={animation.phase}
            surfaces={kinematics.surfaces}
            angles={kinematics.angles}
            sceneBounds={kinematics.sceneBounds}
          />
        </VintageWindow>
        <VintageWindow title="Controls" className="w-2/5 flex flex-col gap-4">
          <VintageControlPanel
            lifts={LIFT_OPTIONS}
            selectedLift={selectedLift}
            onSelectLift={setSelectedLift}
            definitions={parameterDefinitions}
            values={activeParameters}
            defaults={DEFAULT_SETUP_PARAMETERS[selectedLift] ?? {}}
            onSetupParameterChange={controls.handleSetupParameterChange}
            onResetSetupParameters={controls.handleResetSetupParameters}
            isPlaying={animation.isPlaying}
            onTogglePlay={animation.togglePlay}
            tempo={animation.tempo}
            onTempoChange={animation.setTempo}
            angles={kinematics.angles}
            manualOffsets={controls.manualOffsets}
            onAngleOffsetChange={controls.handleAngleOffsetChange}
            onResetAngles={controls.handleResetAdjustments}
            barOffset={controls.manualBarOffset}
            onBarOffsetChange={controls.handleBarOffsetChange}
          />
        </VintageWindow>
      </div>
      <VintageWindow title="Coach's Cue" className="h-32 font-mono text-sm">
        <div className="flex items-center h-full">
          <pre className="text-xs leading-none">{PAVEL_ASCII_ART}</pre>
          <div className="flex-1 pl-4">
            <Typewriter text={cue} />
          </div>
        </div>
      </VintageWindow>
    </MainLayout>
  );
};

export default App;
