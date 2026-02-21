/**
 * @param {unknown} data
 * @returns {{ valid: boolean; error?: string }}
 */
export function validateImportData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Geçersiz dosya formatı.' };
  }

  const d = /** @type {Record<string, unknown>} */ (data);

  if (!Array.isArray(d.habits)) {
    return { valid: false, error: 'Dosyada alışkanlık verisi bulunamadı.' };
  }

  if (!d.userStats || typeof d.userStats !== 'object') {
    return { valid: false, error: 'Dosyada kullanıcı istatistikleri bulunamadı.' };
  }

  const stats = /** @type {Record<string, unknown>} */ (d.userStats);
  if (typeof stats.xp !== 'number' || typeof stats.level !== 'number') {
    return { valid: false, error: 'Kullanıcı istatistikleri eksik veya hatalı.' };
  }

  if (d.habits && !Array.isArray(d.habits)) {
    return { valid: false, error: 'Alışkanlık verisi hatalı formatda.' };
  }

  return { valid: true };
}
