/**
 * Public runtime configuration for the static V4_Cloud client.
 * Only a Supabase URL and publishable/anon key may be returned here.
 */
function isPublicSupabaseKey(key) {
  if (!key || typeof key !== 'string') return false;
  const normalized = key.trim();
  if (/service[_-]?role|secret[_-]?key|supabase_admin|postgres/i.test(normalized)) return false;
  if (normalized.startsWith('sb_publishable_')) return true;

  const parts = normalized.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return String(payload.role || '').toLowerCase() === 'anon';
  } catch {
    return false;
  }
}

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ configured: false, message: 'Method not allowed' });
  }

  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return response.status(200).json({ configured: false });
  }

  if (parsedUrl.protocol !== 'https:' || !isPublicSupabaseKey(key)) {
    return response.status(200).json({ configured: false });
  }

  return response.status(200).json({
    configured: true,
    SUPABASE_URL: parsedUrl.origin,
    SUPABASE_ANON_KEY: key
  });
}
