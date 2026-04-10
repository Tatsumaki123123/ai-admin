export const API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string) || 'https://ai.apecode.site'
)
  .replace(/\/$/, '')
  .replace('http://localhost:5174', window.location.origin);
