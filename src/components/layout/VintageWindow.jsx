import './VintageWindow.css';

const VintageWindow = ({ title, children, className }) => {
  const windowClasses = ['vintage-window', className].filter(Boolean).join(' ');

  return (
    <div className={windowClasses}>
      <div className="vintage-window-title-bar">
        <span className="vintage-window-title">{title}</span>
      </div>
      <div className="vintage-window-content">
        {children}
      </div>
    </div>
  );
};

export default VintageWindow;
