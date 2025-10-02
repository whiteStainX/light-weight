import Typewriter from '../effects/Typewriter';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <h1 className="main-layout__title">
          <Typewriter text="Light weight, baby" />
        </h1>
        <p className="main-layout__subtitle">Data-fueled powerlifting analysis with unapologetically bold energy.</p>
      </header>
      <main className="main-layout__body">{children}</main>
    </div>
  );
};

export default MainLayout;
