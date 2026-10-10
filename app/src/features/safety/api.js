import Constants from 'expo-constants';

// In dev, reach the safety server on the same machine that serves the JS bundle.
// Override with EXPO_PUBLIC_SAFETY_API (e.g. http://192.168.1.5:4000).
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
export const API_BASE = process.env.EXPO_PUBLIC_SAFETY_API ?? `http://${host}:4000`;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Safety API ${res.status}`);
  return res.json();
}

export const raiseSos = (payload) => request('/api/sos', { method: 'POST', body: JSON.stringify(payload) });
export const getIncident = (id) => request(`/api/incidents/${id}`);
export const cancelIncident = (id) => request(`/api/incidents/${id}/cancel`, { method: 'POST' });
export const updateLocation = (id, location) => request(`/api/incidents/${id}/location`, { method: 'POST', body: JSON.stringify(location) });
