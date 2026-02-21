/**
 * Haftalık plan dosyasını (CSV veya Excel) parse eder ve ders listesine dönüştürür.
 * Desteklenen sütunlar (büyük/küçük harf duyarsız):
 * - Öğrenci, Student, öğrenci
 * - Ders, Konu, Subject, ders, konu
 * - Gün, Day, gün (Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
 * - Saat, Time, saat (14:00 veya 14:00:00)
 * - Süre, Duration, süre (dakika)
 * - Ücret, Fee, ücret
 */

import * as XLSX from 'xlsx';

const DAY_MAP = {
  pazar: 0,
  pazartesi: 1,
  salı: 2,
  sali: 2,
  çarşamba: 3,
  carsamba: 3,
  perşembe: 4,
  persembe: 4,
  cuma: 5,
  cumartesi: 6,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

const NORMALIZE_KEYS = {
  öğrenci: 'student',
  öğrenciadı: 'student',
  student: 'student',
  ders: 'subject',
  konu: 'subject',
  subject: 'subject',
  gün: 'day',
  day: 'day',
  gun: 'day',
  saat: 'time',
  time: 'time',
  süre: 'duration',
  duration: 'duration',
  sure: 'duration',
  ücret: 'fee',
  fee: 'fee',
  ucret: 'fee',
};

function normalizeHeader(header) {
  const key = String(header || '').trim().toLowerCase().replace(/\s+/g, '');
  return NORMALIZE_KEYS[key] || key;
}

function parseDayToNumber(dayStr) {
  if (dayStr == null || dayStr === '') return null;
  const normalized = String(dayStr).trim().toLowerCase().replace(/[^a-zçğıöşü]/g, '');
  return DAY_MAP[normalized] ?? null;
}

function parseTime(str) {
  if (!str) return '14:00';
  const s = String(str).trim();
  const match = s.match(/(\d{1,2})[:\s.](\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return '14:00';
}

function parseNumber(str, fallback = 60) {
  if (str == null || str === '') return fallback;
  const n = parseInt(String(str).replace(/\D/g, ''), 10);
  return isNaN(n) ? fallback : n;
}

/** @param {string} csvText */
export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headerLine = lines[0];
  const headers = headerLine.split(/[,;\t]/).map((h) => normalizeHeader(h));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(/[,;\t]/).map((v) => v.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      if (h && values[idx] !== undefined) row[h] = values[idx];
    });
    if (row.student || row.subject) rows.push(row);
  }
  return rows;
}

/** @param {ArrayBuffer} buffer */
export function parseExcel(buffer) {
  try {
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
    if (!data || data.length < 2) return [];
    const headerRow = data[0].map((h) => normalizeHeader(h));
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const values = data[i];
      const row = {};
      headerRow.forEach((h, idx) => {
        if (h && values && values[idx] !== undefined) row[h] = values[idx];
      });
      if (row.student || row.subject) rows.push(row);
    }
    return rows;
  } catch (e) {
    console.error('Excel parse error:', e);
    return [];
  }
}

/**
 * @param {Array<{student?: string, subject?: string, day?: string, time?: string, duration?: string, fee?: string}>} rows
 * @param {string} weekStartDate - Hafta başlangıç tarihi (YYYY-MM-DD, Pazartesi olmalı)
 */
export function rowsToLessons(rows, weekStartDate) {
  const weekStart = new Date(weekStartDate);
  const dayOfWeek = weekStart.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(weekStart);
  monday.setDate(weekStart.getDate() + mondayOffset);

  const lessons = [];
  for (const row of rows) {
    const dayNum = parseDayToNumber(row.day);
    if (dayNum == null && row.day) continue;

    const date = new Date(monday);
    const offset = dayNum === 0 ? 6 : (dayNum ?? 1) - 1;
    date.setDate(monday.getDate() + offset);
    const dateStr = date.toISOString().split('T')[0];

    const student = String(row.student || '').trim();
    const subject = String(row.subject || '').trim();
    if (!student && !subject) continue;

    lessons.push({
      studentName: student || 'Öğrenci',
      subject: subject || 'Ders',
      date: dateStr,
      time: parseTime(row.time),
      duration: parseNumber(row.duration, 60),
      fee: String(row.fee || '').trim().replace(/\D/g, '') || '',
      notes: '',
    });
  }
  return lessons;
}
