import { describe, it, expect } from 'vitest';
import { validateImportData } from './importValidation';

describe('validateImportData', () => {
  it('rejects null or non-object', () => {
    expect(validateImportData(null).valid).toBe(false);
    expect(validateImportData('string').valid).toBe(false);
    expect(validateImportData(123).valid).toBe(false);
  });

  it('rejects data without habits array', () => {
    expect(validateImportData({ userStats: { xp: 100, level: 1 } }).valid).toBe(false);
  });

  it('rejects data without userStats', () => {
    expect(validateImportData({ habits: [] }).valid).toBe(false);
  });

  it('rejects userStats without xp and level', () => {
    expect(validateImportData({ habits: [], userStats: {} }).valid).toBe(false);
    expect(validateImportData({ habits: [], userStats: { xp: 100 } }).valid).toBe(false);
  });

  it('accepts valid data', () => {
    const result = validateImportData({
      habits: [],
      userStats: { xp: 1000, level: 2 },
    });
    expect(result.valid).toBe(true);
  });
});
