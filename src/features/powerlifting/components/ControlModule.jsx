const ControlModule = ({ title, children, className }) => {
  return (
    <div className={`control-module ${className}`}>
      {title && <p className="module-title">{title}</p>}
      {children}
    </div>
  );
};

export default ControlModule;
