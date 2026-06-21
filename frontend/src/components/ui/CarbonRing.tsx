'use client';

import React, { useEffect, useRef } from 'react';

interface CarbonRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  showLabel?: boolean;
  'aria-label'?: string;
}

const SCORE_COLORS: Record<string, string> = {
  excellent: '#5B9E6F',
  good: '#7BC47A',
  moderate: '#D4A853',
  high: '#E08645',
  critical: '#D15A4A',
};

function getScoreLevel(score: number): string {
  if (score < 0.8) return 'excellent';
  if (score < 1.2) return 'good';
  if (score < 1.84) return 'moderate';
  if (score < 2.5) return 'high';
  return 'critical';
}

export const CarbonRing: React.FC<CarbonRingProps> = ({
  score,
  maxScore = 2.5,
  size = 160,
  strokeWidth = 12,
  animated = true,
  showLabel = true,
  'aria-label': ariaLabel,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const level = getScoreLevel(score);
  const color = SCORE_COLORS[level];
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const targetOffset = circumference * (1 - pct);

  useEffect(() => {
    if (!animated || !circleRef.current) return;
    const circle = circleRef.current;
    circle.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.0, 0.0, 0.2, 1)';
      circle.style.strokeDashoffset = String(targetOffset);
    });
    return () => cancelAnimationFrame(raf);
  }, [score, circumference, targetOffset, animated]);

  const defaultLabel = ariaLabel ?? `Carbon score: ${score.toFixed(2)} tonnes CO₂ equivalent per year. Level: ${level}.`;

  return (
    <div
      role="img"
      aria-label={defaultLabel}
      style={{ width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(242,239,227,0.08)" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={center} cy={center} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : targetOffset}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      {showLabel && (
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: size > 120 ? 30 : 22, fontWeight: 700, color: '#F2EFE3', letterSpacing: '-0.025em', lineHeight: 1 }}>
            {score.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, color: '#A09880', letterSpacing: '0.05em', textTransform: 'uppercase' }}>tCO₂e</span>
          <span style={{ fontSize: 10, fontWeight: 600, color, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>{level}</span>
        </div>
      )}
    </div>
  );
};
