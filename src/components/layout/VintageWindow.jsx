import './VintageWindow.css';

const VintageWindow = ({ title, children, className }) => {
  return (
    <div className={`vintage-window ${className}`}>
      <div className="vintage-window-title-bar">
        <div className="vintage-window-title">{title}</div>
      </div>
      <div className="vintage-window-content">
        {children}
      </div>
    </div>
  );
};

export default VintageWindow;
