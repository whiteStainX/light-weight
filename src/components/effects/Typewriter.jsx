import React, { useState, useEffect } from 'react';
import './Typewriter.css';

const Typewriter = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');

    if (!text) return;

    let i = 0;
    let timeoutId;

    const type = () => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
        timeoutId = setTimeout(type, speed);
      }
    };

    // Start the typing
    timeoutId = setTimeout(type, speed);

    // Cleanup function to clear the timeout when the component unmounts or the text changes
    return () => clearTimeout(timeoutId);
  }, [text, speed]);

  return <span className="typewriter">{displayedText}</span>;
};

export default Typewriter;
