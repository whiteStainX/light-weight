const BannerInsignia = ({ className = '' }) => {
  const classes = ['banner-insignia', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <img 
        src="/assets/heads.png" 
        alt="A wireframe rendering of a human head, representing biomechanical analysis." 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default BannerInsignia;