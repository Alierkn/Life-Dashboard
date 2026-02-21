import { useState, useEffect } from 'react';

const API_URL = 'https://api.frankfurter.app/latest?from=TRY&to=EUR';
const CACHE_KEY = 'life-dashboard-try-eur-rate';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 saat

function getCachedRate() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { rate, fetchedAt } = JSON.parse(cached);
    if (Date.now() - fetchedAt > CACHE_TTL_MS) return null;
    return rate;
  } catch {
    return null;
  }
}

function setCachedRate(rate) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, fetchedAt: Date.now() }));
  } catch {}
}

export function useExchangeRate() {
  const [rate, setRate] = useState(getCachedRate);
  const [loading, setLoading] = useState(!rate);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rate) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const r = data?.rates?.EUR;
        if (typeof r === 'number') {
          setRate(r);
          setCachedRate(r);
        } else {
          setError('Kur alınamadı');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Kur yüklenemedi');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [rate]);

  return { rate, loading, error };
}
