import Typewriter from '../effects/Typewriter';
import BannerInsignia from '../visual/BannerInsignia';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__crest" aria-label="Project Light-Weight insignia">
          <BannerInsignia className="main-layout__crest-icon" />
          <div className="main-layout__crest-copy">
            <span className="main-layout__crest-title">Collective of Iron Analytics</span>
            <span className="main-layout__crest-subtitle">Data. Discipline. Solidarity.</span>
          </div>
        </div>
        <h1 className="main-layout__title">
          <Typewriter text="Light weight, comrade!" />
        </h1>
        <p className="main-layout__subtitle">Data-fueled powerlifting analysis with unapologetically bold energy.</p>
      </header>
      <main className="main-layout__body">{children}</main>
    </div>
  );
};

export default MainLayout;
