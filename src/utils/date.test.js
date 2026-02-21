import { describe, it, expect } from 'vitest';
import { getTodayString, getPastDays, getDaysBetween, getCurrentWeekDates, formatTime } from './date';

describe('date utils', () => {
  it('getTodayString returns YYYY-MM-DD format', () => {
    const result = getTodayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('getPastDays returns correct number of dates', () => {
    const result = getPastDays(7);
    expect(result).toHaveLength(7);
  });

  it('getPastDays returns dates in ascending order', () => {
    const result = getPastDays(5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i] >= result[i - 1]).toBe(true);
    }
  });

  it('getDaysBetween returns dates between start and end', () => {
    const result = getDaysBetween('2026-01-01', '2026-01-05');
    expect(result).toContain('2026-01-02');
    expect(result).toContain('2026-01-03');
    expect(result).toContain('2026-01-04');
    expect(result).not.toContain('2026-01-01');
    expect(result).not.toContain('2026-01-05');
  });

  it('getDaysBetween returns empty for same day', () => {
    const result = getDaysBetween('2026-01-01', '2026-01-01');
    expect(result).toHaveLength(0);
  });

  it('formatTime formats seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('getCurrentWeekDates returns 7 days with day names', () => {
    const result = getCurrentWeekDates();
    expect(result).toHaveLength(7);
    result.forEach((day) => {
      expect(day).toHaveProperty('dateStr');
      expect(day).toHaveProperty('dayName');
      expect(day.dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
