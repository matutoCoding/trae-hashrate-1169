import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getRemainingTime } from '@/utils/dateUtils';

interface CountdownRingProps {
  deadline: string;
  size?: number;
  strokeWidth?: number;
  showLabels?: boolean;
}

const CountdownRing: React.FC<CountdownRingProps> = ({
  deadline,
  size = 100,
  strokeWidth = 6,
  showLabels = true,
}) => {
  const [remaining, setRemaining] = useState(() => getRemainingTime(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = 24 * 3600;
  const elapsedSeconds = Math.min(remaining.hours * 3600 + remaining.minutes * 60 + remaining.seconds, totalSeconds);
  const progress = remaining.isOverdue ? 0 : 1 - elapsedSeconds / totalSeconds;
  const offset = circumference * (1 - progress);

  const color = remaining.isOverdue
    ? '#EF4444'
    : remaining.hours < 1
    ? '#F97316'
    : remaining.hours < 4
    ? '#06B6D4'
    : '#10B981';

  const { hours, minutes, seconds } = remaining;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display font-bold ${remaining.isOverdue ? 'text-danger animate-pulse' : 'text-text-primary'}`} style={{ fontSize: size * 0.28 }}>
            {remaining.isOverdue ? (
              '超时'
            ) : (
              <>
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
              </>
            )}
          </span>
          {!remaining.isOverdue && showLabels && (
            <span className="text-[10px] text-text-muted font-mono mt-0.5">
              :{String(seconds).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CountdownRing;
