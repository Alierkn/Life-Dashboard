/** Get or create device_id from request */
export function getDeviceId(req) {
  const deviceId = req.headers['x-device-id'] || req.query?.device_id || req.body?.device_id;
  if (!deviceId || typeof deviceId !== 'string') {
    return null;
  }
  return deviceId.trim();
}
