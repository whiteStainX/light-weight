import Typewriter from '../effects/Typewriter';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <h1 className="main-layout__title">
          <Typewriter text="Light weight, baby!" />
        </h1>
      </header>
      {children}
    </div>
  );
};

export default MainLayout;
