import React, { useEffect, useRef, useState } from 'react';

export function Speedometer({ value, className = '' }) {
  const needleContainerRef = useRef(null);
  const valueDisplayRef = useRef(null);
  const bounceIntervalIdRef = useRef(null);
  const [baseValue, setBaseValue] = useState(value || 50);
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuration
  const config = {
    minAngle: -215.2,  // Angle at value 0
    maxAngle: 34.2,   // Angle at value 100
    minValue: 0,
    maxValue: 100
  };

  // Smoothness config
  const bounceSmoothMs = 500;
  const bounceTimingFn = 'cubic-bezier(.22,1,.36,1)';
  const bounceAmplitude = 2; // +/- value
  const bounceIntervalMs = 160;

  // Apply transition function
  const applyTransition = () => {
    if (needleContainerRef.current) {
      needleContainerRef.current.style.transition = `transform ${bounceSmoothMs}ms ${bounceTimingFn}`;
    }
  };

  // Update needle position
  const updateNeedle = (val) => {
    // Clamp value between min and max
    const clampedValue = Math.max(config.minValue, Math.min(config.maxValue, val));
    
    // Calculate angle
    const angleRange = config.maxAngle - config.minAngle;
    const valueRange = config.maxValue - config.minValue;
    const normalizedValue = (clampedValue - config.minValue) / valueRange;
    const angle = config.minAngle + (normalizedValue * angleRange);

    // Update needle rotation
    if (needleContainerRef.current) {
      needleContainerRef.current.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }

    // Update value display
    if (valueDisplayRef.current) {
      valueDisplayRef.current.textContent = Math.round(clampedValue);
    }
  };


  // Initialize transition
  useEffect(() => {
    applyTransition();
  }, []);

  // Update when value changes
  useEffect(() => {
    const newValue = value || 50;
    setBaseValue(newValue);
    updateNeedle(newValue);
  }, [value]);

  // Start bounce effect
  useEffect(() => {
    const startBounceEffect = () => {
      if (bounceIntervalIdRef.current) {
        clearInterval(bounceIntervalIdRef.current);
      }

      bounceIntervalIdRef.current = setInterval(() => {
        if (isAnimating) return;

        const jitter = Math.round((Math.random() * (bounceAmplitude * 2)) - bounceAmplitude);
        const bounced = Math.max(config.minValue, Math.min(config.maxValue, baseValue + jitter));
        updateNeedle(bounced);
      }, bounceIntervalMs);
    };

    startBounceEffect();

    return () => {
      if (bounceIntervalIdRef.current) {
        clearInterval(bounceIntervalIdRef.current);
      }
    };
  }, [baseValue, isAnimating]);

  return (
    <div className={`gauge-wrapper ${className}`} style={{ position: 'relative', width: '340px', height: '340px', margin: '0 auto' }}>
      {/* Gauge Background */}
      <div className="gauge-background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <object 
          className="gauge-background" 
          data="/gauge/svg/light/gauge-dial.svg" 
          type="image/svg+xml"
          style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
        >
        </object>
      </div>
      
      {/* Needle Container */}
      <div 
        ref={needleContainerRef}
        className="gauge-needle-container" 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          willChange: 'transform'
        }}
      >
        <object 
          className="gauge-needle" 
          data="/gauge/svg/light/needle.svg" 
          type="image/svg+xml"
          style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
        >
        </object>
      </div>
      
      {/* Value Display */}
      <div 
        ref={valueDisplayRef}
        className="value-display light" 
        style={{
          position: 'absolute',
          top: '74%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '32px',
          fontWeight: 'semibold',
          fontFamily: 'Geist Mono, monospace',
          color: 'black',
          width: '70px',
          height: 'auto',
          padding: '10px 10px 5px 10px',
          boxShadow: 'none',
          display: 'inline-block',
          textAlign: 'center',
          zIndex: 10
        }}
      >
        {value || 50}
      </div>
    </div>
  );
}

