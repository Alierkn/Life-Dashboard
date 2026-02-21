import { useEffect, useCallback } from 'react';
import { getTodayString } from '../utils/date';

const GENERAL_TIPS = [
  'Unutma: İstikrar, mükemmellikten daha önemlidir. Sadece devam et.',
  'Odaklanmakta zorlanıyorsan zamanlayıcıyı 15 dakikaya kur ve sadece başla.',
  'Büyük hedefler küçük ve sıkıcı adımların tekrarından ibarettir.',
  'Günün en zor görevini sabah ilk iş olarak yaparsan (Kurbağayı Ye), günün geri kalanı çok kolay geçer.',
  'Her gün küçük bir adım at. Zamanla büyük bir yol kat edersin.',
  'Mola vermek zayıflık değil, sürdürülebilirlik stratejisidir.',
];

export function useAITip(habits, tasks, userStats) {
  const generateTip = useCallback(() => {
    const today = getTodayString();
    const dailyHabits = habits.filter((h) => h.frequency === 'daily');
    const completedHabits = dailyHabits.filter((h) => h.completedDates.includes(today)).length;
    const pendingTasks = tasks.filter((t) => !t.completed).length;

    if (dailyHabits.length > 0 && completedHabits === 0) {
      return 'Bugün henüz hiçbir alışkanlığını tamamlamadın. En kolayıyla başlamaya ne dersin? Küçük bir adım büyük bir ivme yaratır.';
    }
    if (dailyHabits.length > 0 && completedHabits === dailyHabits.length && pendingTasks === 0) {
      return 'Mükemmel bir gün! Bugünkü tüm alışkanlıklarını ve görevlerini tamamladın. Artık dinlenmeyi hak ediyorsun.';
    }
    if (pendingTasks > 3) {
      return `Bekleyen ${pendingTasks} görevin var. Eisenhower matrisini düşün: En acil ve önemli olanı seç ve diğerlerini şimdilik unut.`;
    }
    if (userStats.xp % 1000 > 800) {
      return 'Harika gidiyorsun! Seviye atlamana çok az kaldı. Biraz daha odaklan ve ödülü kap!';
    }
    return GENERAL_TIPS[Math.floor(Math.random() * GENERAL_TIPS.length)];
  }, [habits, tasks, userStats]);

  return generateTip;
}
