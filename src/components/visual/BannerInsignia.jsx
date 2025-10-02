const BannerInsignia = ({ className = '' }) => {
  const classes = ['banner-insignia', className].filter(Boolean).join(' ');

  return (
    <svg
      className={classes}
      viewBox="0 0 120 120"
      role="img"
      aria-labelledby="bannerInsigniaTitle bannerInsigniaDesc"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="bannerInsigniaTitle">Project Light-Weight crest</title>
      <desc id="bannerInsigniaDesc">
        Circular crest featuring a barbell, laurel wreath, and compass star to symbolize collective strength and precise data.
      </desc>
      <defs>
        <linearGradient id="insigniaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--neo-accent-2)" />
          <stop offset="100%" stopColor="var(--neo-accent-1)" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="var(--neo-surface)" stroke="var(--neo-border)" strokeWidth="6" />
      <circle cx="60" cy="60" r="40" fill="url(#insigniaGradient)" stroke="var(--neo-border)" strokeWidth="4" />
      <g stroke="var(--neo-border)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M32 60h56" />
        <path d="M41 50v20" />
        <path d="M79 50v20" />
        <circle cx="60" cy="60" r="8" />
      </g>
      <g fill="var(--neo-border)">
        <path d="M60 20l5 12h-10z" />
        <path d="M60 100l-5-12h10z" />
        <path d="M20 60l12 5v-10z" />
        <path d="M100 60l-12-5v10z" />
      </g>
      <g stroke="var(--neo-border)" strokeWidth="2" strokeLinecap="round">
        <path d="M46 30c-10 7-16 18-16 30" />
        <path d="M74 30c10 7 16 18 16 30" />
      </g>
    </svg>
  );
};

export default BannerInsignia;
