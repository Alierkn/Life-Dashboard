import { useEffect } from 'react';
import { getTodayString, getDaysBetween } from '../utils/date';
import { STORAGE_KEYS } from '../constants';

export function usePenaltyCheck(setHabits, setUserStats, setNotification) {
  useEffect(() => {
    const today = getTodayString();
    const lastChecked = localStorage.getItem(STORAGE_KEYS.LAST_CHECKED);

    if (lastChecked && lastChecked !== today) {
      const missedDays = getDaysBetween(lastChecked, today);
      if (missedDays.length > 0) {
        setHabits((prevHabits) => {
          let xpPenalty = 0;
          const newHabits = prevHabits.map((h) => {
            if (h.frequency === 'daily') {
              const missed = missedDays.some((d) => !h.completedDates.includes(d));
              if (missed && h.streak > 0) {
                xpPenalty += 20;
                return { ...h, streak: 0 };
              }
            }
            return h;
          });

          if (xpPenalty > 0) {
            setUserStats((prev) => ({ ...prev, xp: Math.max(0, prev.xp - xpPenalty) }));
            setNotification(`Kaçırılan günlük alışkanlıklar nedeniyle ${xpPenalty} XP kaybettin. Serilerin sıfırlandı!`);
          }
          return newHabits;
        });
      }
    }
    localStorage.setItem(STORAGE_KEYS.LAST_CHECKED, today);
  }, [setHabits, setUserStats, setNotification]);
}
