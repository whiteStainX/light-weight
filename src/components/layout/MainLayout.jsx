import Typewriter from '../effects/Typewriter';
import BannerInsignia from '../visual/BannerInsignia';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div aria-label="Project Light-Weight insignia">
          <BannerInsignia className="w-20 h-20" />
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
