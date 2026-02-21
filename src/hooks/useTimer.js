import { useState, useEffect, useCallback } from 'react';
import { TIMER_DURATIONS, DEFAULT_BREAK_MINUTES } from '../constants';

export function useTimer(onFocusComplete, addXp) {
  const [timerDuration, setTimerDuration] = useState(25);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerMode, setTimerMode] = useState('focus');
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);

  const handleDurationChange = useCallback(
    (minutes) => {
      if (timerActive) return;
      setTimerDuration(minutes);
      setTimeLeft(minutes * 60);
      setTimerMode('focus');
    },
    [timerActive]
  );

  const toggleTimer = useCallback(() => setTimerActive((prev) => !prev), []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (timerMode === 'focus') {
        addXp(50);
        setTimeLeft(breakMinutes * 60);
        setTimerMode('break');
        onFocusComplete?.();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Odaklanma tamamlandı! Mola zamanı.');
        }
      } else {
        setTimeLeft(timerDuration * 60);
        setTimerMode('focus');
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, timerMode, timerDuration, breakMinutes, addXp, onFocusComplete]);

  return {
    timerDuration,
    timerActive,
    timeLeft,
    timerMode,
    handleDurationChange,
    toggleTimer,
    breakMinutes,
    setBreakMinutes,
  };
}
