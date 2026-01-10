import React, { useEffect, useRef, useState } from 'react';

export function Speedometer({ value, className = '' }) {
  const needleContainerRef = useRef(null);
  const valueDisplayRef = useRef(null);
  const bounceIntervalIdRef = useRef(null);
  const [baseValue, setBaseValue] = useState(value ?? 50);
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
  const bounceIntervalMs = 160;

  // Calculate bounce amplitude based on value using a bell curve
  // Teams near 50% have high variability (amplitude 8), teams near 0% or 100% have low (amplitude 2)
  // Teams with odds < 1% or exactly 100% have zero amplitude (no bounce)
  const calculateBounceAmplitude = (val) => {
    // No bounce for teams with less than 1% or exactly 100%
    if (val < 1 || val === 100) {
      return 0;
    }
    
    const minAmplitude = 2;
    const maxAmplitude = 8;
    // Distance from 50, normalized to 0-1
    const distanceFrom50 = Math.abs(val - 50) / 50;
    // Bell curve: amplitude is highest at 50, lowest at 0 and 100
    // Using (1 - distance^2) for a parabolic bell shape
    const bellFactor = 1 - Math.pow(distanceFrom50, 2);
    return minAmplitude + (maxAmplitude - minAmplitude) * bellFactor;
  };

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
    const newValue = value ?? 50;
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

        const bounceAmplitude = calculateBounceAmplitude(baseValue);
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

