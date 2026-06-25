const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createToken(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = sign(`${header}.${body}`, secret);
  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

function getCookieOptions(req) {
  const secureByEnv = String(process.env.COOKIE_SECURE || 'false') === 'true';
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: secureByEnv,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  };
}

function requireAdmin(req, res, next) {
  const secret = process.env.COOKIE_SECRET || 'dev-secret';
  const payload = verifyToken(req.cookies.leme_bio_auth, secret);
  if (!payload || payload.email !== (process.env.ADMIN_EMAIL || 'admin@leme.local')) {
    return res.redirect('/admin/login');
  }
  req.admin = payload;
  return next();
}

function setAuthCookie(req, res, email) {
  const secret = process.env.COOKIE_SECRET || 'dev-secret';
  const token = createToken({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }, secret);
  res.cookie('leme_bio_auth', token, getCookieOptions(req));
}

function clearAuthCookie(res) {
  res.clearCookie('leme_bio_auth', { path: '/' });
}

module.exports = { createToken, verifyToken, requireAdmin, setAuthCookie, clearAuthCookie };
