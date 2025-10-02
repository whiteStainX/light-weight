import { useMemo, useState, useEffect } from 'react';

import MainLayout from './components/layout/MainLayout';
import VintageWindow from './components/layout/VintageWindow';
import Typewriter from './components/effects/Typewriter';
import ChartCanvas from './features/powerlifting/components/ChartCanvas';
import VintageControlPanel from './features/powerlifting/components/VintageControlPanel';
import { usePowerlifting } from './features/powerlifting/hooks/usePowerlifting';
import { PARAMETER_DEFINITIONS, DEFAULT_SETUP_PARAMETERS } from './features/powerlifting/lib/setupParameters';
import './App.css';

const App = () => {
  const [pavelContent, setPavelContent] = useState({ quotes: [], ascii_art: '' });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/content/pavel');
        const data = await response.json();
        setPavelContent({ quotes: data.quotes || [], ascii_art: data.ascii_art || '' });
      } catch (error) {
        console.error("Failed to fetch content:", error);
        // You could set some default content here on error if you wanted
      }
    };

    fetchContent();
  }, []); // Empty dependency array means this runs once on mount

  const {
    LIFT_OPTIONS,
    selectedLift,
    setSelectedLift,
    setupParameters, // This was missing
    kinematics,
    controls,
  } = usePowerlifting();

  const cue = useMemo(() => {
    if (pavelContent.quotes.length === 0) return "..."; // Return a placeholder while loading
    const filteredQuotes = pavelContent.quotes.filter(q => q.toLowerCase().includes(selectedLift.toLowerCase()));
    const quotePool = filteredQuotes.length > 0 ? filteredQuotes : pavelContent.quotes;
    return quotePool[Math.floor(Math.random() * quotePool.length)];
  }, [selectedLift, pavelContent.quotes]);

  const asciiArt = pavelContent.ascii_art && pavelContent.ascii_art.trim().length > 0
    ? pavelContent.ascii_art
    : ` (•_•)
<)   )╯
 /   \\`;

  return (
    <MainLayout>
      <section className="app-layout">
        <div className="app-layout__primary">
          <VintageWindow title="Analysis" className="app-layout__window app-layout__window--analysis">
            <ChartCanvas title={`${selectedLift} Analysis`} />
          </VintageWindow>
          <VintageWindow title="Controls" className="app-layout__window app-layout__window--controls">
            <VintageControlPanel
              lifts={LIFT_OPTIONS}
              selectedLift={selectedLift}
              onSelectLift={setSelectedLift}
              definitions={PARAMETER_DEFINITIONS} // Pass the whole object
              values={setupParameters} // Pass the whole nested object
              defaults={DEFAULT_SETUP_PARAMETERS}
              onSetupParameterChange={controls.handleSetupParameterChange}
              onResetSetupParameters={controls.handleResetSetupParameters}
              angles={kinematics.angles}
              manualOffsets={controls.manualOffsets}
              onAngleOffsetChange={controls.handleAngleOffsetChange}
              onResetAngles={controls.handleResetAdjustments}
              barOffset={controls.manualBarOffset}
              onBarOffsetChange={controls.handleBarOffsetChange}
            />
          </VintageWindow>
        </div>
        <VintageWindow title="Coach's Cue" className="app-layout__window app-layout__window--coach">
          <div className="coach-cue">
            <pre className="coach-cue__ascii">{asciiArt}</pre>
            <div className="coach-cue__message">
              <Typewriter text={cue} />
            </div>
          </div>
        </VintageWindow>
      </section>
    </MainLayout>
  );
};

export default App;
