import './VintageWindow.css';

const VintageWindow = ({ title, children, className }) => {
  return (
    <div className={`vintage-window ${className}`}>
      <div className="vintage-window-title-bar">
        <span>{title}</span>
      </div>
      <div className="vintage-window-content bg-mac-dither">
        {children}
      </div>
    </div>
  );
};

export default VintageWindow;
