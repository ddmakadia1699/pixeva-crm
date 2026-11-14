/**
 * Pixeva CRM — shared JWT authentication for Lambda handlers.
 *
 * Verifies a Supabase Auth access token (ES256/RS256) against the project's public
 * JWKS endpoint. No secret is needed. The tenant (account_id) MUST come from the
 * verified token's `sub` claim, never from a client-supplied header or body field.
 */
const { createRemoteJWKSet, jwtVerify } = require('jose');

let cachedJwks = null;
let cachedJwksBase = '';

function getJwks(base) {
  if (!cachedJwks || cachedJwksBase !== base) {
    cachedJwks = createRemoteJWKSet(new URL(`${base}/auth/v1/.well-known/jwks.json`), {
      cooldownDuration: 30000,
      cacheMaxAge: 600000,
    });
    cachedJwksBase = base;
  }
  return cachedJwks;
}

function getHeader(event, name) {
  const headers = event?.headers || {};
  const wanted = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === wanted) return headers[key];
  }
  return undefined;
}

function getBearerToken(event) {
  const value = getHeader(event, 'authorization');
  if (!value || typeof value !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match ? match[1] : null;
}

/**
 * @returns {Promise<{ok: true, userId: string} | {ok: false, status: number, error: string}>}
 */
async function authenticate(event) {
  const token = getBearerToken(event);
  if (!token) return { ok: false, status: 401, error: 'Authentication required' };

  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  if (!base || base.includes('your-supabase-project')) {
    return { ok: false, status: 500, error: 'Authentication is not configured' };
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(base), {
      issuer: `${base}/auth/v1`,
      audience: 'authenticated',
      algorithms: ['ES256', 'RS256'],
    });
    if (!payload.sub || typeof payload.sub !== 'string') {
      return { ok: false, status: 401, error: 'Invalid token' };
    }
    return { ok: true, userId: payload.sub };
  } catch (err) {
    // Could not reach the key endpoint: temporary, not the caller's fault.
    if (err && typeof err.code === 'string' && err.code.startsWith('ERR_JWKS')) {
      console.error('[auth] JWKS fetch problem:', err.code);
      return { ok: false, status: 503, error: 'Authentication service unavailable' };
    }
    return { ok: false, status: 401, error: 'Invalid or expired token' };
  }
}

function authFailure(result, headers) {
  return {
    statusCode: result.status,
    headers,
    body: JSON.stringify({ success: false, error: result.error }),
  };
}

module.exports = { authenticate, authFailure, getBearerToken };
