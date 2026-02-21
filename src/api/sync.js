const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getDeviceId() {
  let id = localStorage.getItem('life_dashboard_device_id');
  if (!id) {
    id = crypto.randomUUID?.() || `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('life_dashboard_device_id', id);
  }
  return id;
}

export async function fetchSync() {
  const deviceId = getDeviceId();
  const res = await fetch(`${API_BASE}/sync?device_id=${encodeURIComponent(deviceId)}`, {
    headers: { 'X-Device-ID': deviceId },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Sync alınamadı');
  }
  return res.json();
}

export async function pushSync(payload) {
  const deviceId = getDeviceId();
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': deviceId,
    },
    body: JSON.stringify({ ...payload, device_id: deviceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Sync gönderilemedi');
  }
  return res.json();
}

export { getDeviceId };
