require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const db = require('./db');
const { loginPage } = require('./views/layout');
const { dashboardPage, biosListPage, bioFormPage, notFoundAdmin } = require('./views/admin');
const { publicBioPage, homePage, notFoundPage } = require('./views/public');
const { requireAdmin, setAuthCookie, clearAuthCookie } = require('./auth');
const {
  ensureSlug,
  normalizeUrl,
  isSafeHex,
  boolFromForm,
  hashIp
} = require('./utils');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 4);

fs.mkdirSync(uploadDir, { recursive: true });

if (String(process.env.TRUST_PROXY || 'true') === 'true') app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/assets', express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }));
app.use('/uploads', express.static(uploadDir, { maxAge: '30d' }));

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Envie apenas imagens JPG, PNG, WEBP ou SVG.'));
  }
});

function uploadFields(req, res, next) {
  const handler = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
    { name: 'background', maxCount: 1 }
  ]);
  handler(req, res, err => {
    if (err) return res.status(400).send(notFoundAdmin(err.message));
    next();
  });
}

function fileUrl(req, name) {
  const file = req.files?.[name]?.[0];
  return file ? `/uploads/${file.filename}` : null;
}

function pickColor(body, name, fallback) {
  return isSafeHex(body[`${name}_text`] || body[name], fallback);
}

function parseBioPayload(req, existing = {}) {
  const body = req.body;
  const slug = ensureSlug(body.slug || body.title);
  return {
    slug,
    title: String(body.title || '').trim(),
    subtitle: String(body.subtitle || '').trim(),
    description: String(body.description || '').trim(),
    instagram: normalizeSocialInput(body.instagram),
    whatsapp: normalizeSocialInput(body.whatsapp),
    location: normalizeSocialInput(body.location),
    website: normalizeSocialInput(body.website),
    seo_title: String(body.seo_title || '').trim(),
    seo_description: String(body.seo_description || '').trim(),
    template: ['premium', 'clinic', 'minimal', 'dark'].includes(body.template) ? body.template : 'premium',
    primary_color: pickColor(body, 'primary_color', existing.primary_color || '#1B2E5A'),
    secondary_color: pickColor(body, 'secondary_color', existing.secondary_color || '#D7B56D'),
    background_type: ['gradient', 'solid', 'image'].includes(body.background_type) ? body.background_type : 'gradient',
    background_color: pickColor(body, 'background_color', existing.background_color || '#0B1020'),
    background_color_2: pickColor(body, 'background_color_2', existing.background_color_2 || '#1B2E5A'),
    button_style: ['glass', 'solid', 'outline', 'soft'].includes(body.button_style) ? body.button_style : 'glass',
    font_family: ['inter', 'serif', 'rounded'].includes(body.font_family) ? body.font_family : 'inter',
    text_color: pickColor(body, 'text_color', existing.text_color || '#FFFFFF'),
    show_branding: boolFromForm(body.show_branding),
    published: boolFromForm(body.published),
    avatar_url: fileUrl(req, 'avatar') || existing.avatar_url || '',
    logo_url: fileUrl(req, 'logo') || existing.logo_url || '',
    background_image_url: fileUrl(req, 'background') || existing.background_image_url || ''
  };
}

function parseLinkPayload(body) {
  const label = String(body.label || '').trim();
  const url = normalizeUrl(body.url || '');
  if (!label) throw new Error('O texto do link é obrigatório.');
  if (!url) throw new Error('A URL é obrigatória.');
  const allowedIcons = ['link', 'whatsapp', 'instagram', 'site', 'agenda', 'maps', 'phone', 'email', 'form', 'video', 'download', 'star', 'clinic', 'doctor'];
  return {
    label,
    url,
    icon: allowedIcons.includes(body.icon) ? body.icon : 'link',
    description: String(body.description || '').trim(),
    is_highlight: boolFromForm(body.is_highlight),
    is_active: body.is_active === undefined ? true : boolFromForm(body.is_active),
    sort_order: Number.parseInt(body.sort_order, 10) || 0
  };
}

function normalizeSocialInput(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('@')) return raw;
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(raw)) return raw;
  if (/^\+?\d[\d\s().-]{9,}$/.test(raw)) return `https://wa.me/${raw.replace(/\D/g, '')}`;
  return normalizeUrl(raw);
}

async function verifyAdmin(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@leme.local';
  if (email !== adminEmail) return false;

  if (process.env.ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return password === adminPassword;
}

async function waitForDb(retries = 30) {
  for (let i = 0; i < retries; i += 1) {
    try {
      await db.query('SELECT 1');
      return;
    } catch (error) {
      console.log(`Aguardando banco de dados... tentativa ${i + 1}/${retries}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Não foi possível conectar ao banco de dados.');
}

app.get('/health', (req, res) => res.json({ ok: true, app: 'leme-bio' }));

app.get('/admin/login', (req, res) => {
  res.send(loginPage(req.query.error ? 'Login ou senha inválidos.' : ''));
});

app.post('/admin/login', async (req, res) => {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');
  const ok = await verifyAdmin(email, password);
  if (!ok) return res.redirect('/admin/login?error=1');
  setAuthCookie(req, res, email);
  return res.redirect('/admin');
});

app.post('/admin/logout', (req, res) => {
  clearAuthCookie(res);
  res.redirect('/admin/login');
});

app.get('/admin', requireAdmin, async (req, res) => {
  const [stats, bios] = await Promise.all([db.getDashboardStats(), db.getBiosWithStats()]);
  res.send(dashboardPage(stats, bios));
});

app.get('/admin/bios', requireAdmin, async (req, res) => {
  const bios = await db.getBiosWithStats();
  res.send(biosListPage(bios));
});

app.get('/admin/bios/new', requireAdmin, async (req, res) => {
  res.send(bioFormPage({ mode: 'new', bio: { published: true, show_branding: true } }));
});

app.post('/admin/bios', requireAdmin, uploadFields, async (req, res) => {
  try {
    const bio = parseBioPayload(req);
    const result = await db.query(`
      INSERT INTO bios (
        slug, title, subtitle, description, avatar_url, logo_url, instagram, whatsapp, location, website,
        seo_title, seo_description, template, primary_color, secondary_color, background_type,
        background_color, background_color_2, background_image_url, button_style, font_family, text_color,
        show_branding, published, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW())
      RETURNING id
    `, [
      bio.slug, bio.title, bio.subtitle, bio.description, bio.avatar_url, bio.logo_url, bio.instagram, bio.whatsapp,
      bio.location, bio.website, bio.seo_title, bio.seo_description, bio.template, bio.primary_color,
      bio.secondary_color, bio.background_type, bio.background_color, bio.background_color_2, bio.background_image_url,
      bio.button_style, bio.font_family, bio.text_color, bio.show_branding, bio.published
    ]);
    res.redirect(`/admin/bios/${result.rows[0].id}/edit`);
  } catch (error) {
    res.status(400).send(bioFormPage({ mode: 'new', bio: req.body, error: humanDbError(error) }));
  }
});

app.get('/admin/bios/:id/edit', requireAdmin, async (req, res) => {
  const bio = await db.getBioById(req.params.id);
  if (!bio) return res.status(404).send(notFoundAdmin('Página não encontrada.'));
  const [links, analytics] = await Promise.all([db.getLinksByBioId(bio.id), db.getBioAnalytics(bio.id)]);
  res.send(bioFormPage({ mode: 'edit', bio, links, analytics }));
});

app.post('/admin/bios/:id', requireAdmin, uploadFields, async (req, res) => {
  const existing = await db.getBioById(req.params.id);
  if (!existing) return res.status(404).send(notFoundAdmin('Página não encontrada.'));
  try {
    const bio = parseBioPayload(req, existing);
    await db.query(`
      UPDATE bios SET
        slug=$1, title=$2, subtitle=$3, description=$4, avatar_url=$5, logo_url=$6,
        instagram=$7, whatsapp=$8, location=$9, website=$10, seo_title=$11, seo_description=$12,
        template=$13, primary_color=$14, secondary_color=$15, background_type=$16,
        background_color=$17, background_color_2=$18, background_image_url=$19, button_style=$20,
        font_family=$21, text_color=$22, show_branding=$23, published=$24, updated_at=NOW()
      WHERE id=$25
    `, [
      bio.slug, bio.title, bio.subtitle, bio.description, bio.avatar_url, bio.logo_url, bio.instagram,
      bio.whatsapp, bio.location, bio.website, bio.seo_title, bio.seo_description, bio.template,
      bio.primary_color, bio.secondary_color, bio.background_type, bio.background_color, bio.background_color_2,
      bio.background_image_url, bio.button_style, bio.font_family, bio.text_color, bio.show_branding,
      bio.published, existing.id
    ]);
    res.redirect(`/admin/bios/${existing.id}/edit`);
  } catch (error) {
    const links = await db.getLinksByBioId(existing.id);
    const analytics = await db.getBioAnalytics(existing.id);
    res.status(400).send(bioFormPage({ mode: 'edit', bio: { ...existing, ...req.body }, links, analytics, error: humanDbError(error) }));
  }
});

app.post('/admin/bios/:id/delete', requireAdmin, async (req, res) => {
  await db.query('DELETE FROM bios WHERE id = $1', [req.params.id]);
  res.redirect('/admin/bios');
});

app.post('/admin/bios/:id/links', requireAdmin, async (req, res) => {
  const bio = await db.getBioById(req.params.id);
  if (!bio) return res.status(404).send(notFoundAdmin('Página não encontrada.'));
  try {
    const link = parseLinkPayload(req.body);
    await db.query(`
      INSERT INTO links (bio_id, label, url, icon, description, is_highlight, is_active, sort_order, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    `, [bio.id, link.label, link.url, link.icon, link.description, link.is_highlight, link.is_active, link.sort_order]);
    await db.query('UPDATE bios SET updated_at = NOW() WHERE id = $1', [bio.id]);
    res.redirect(`/admin/bios/${bio.id}/edit`);
  } catch (error) {
    res.status(400).send(notFoundAdmin(humanDbError(error)));
  }
});

app.post('/admin/links/:id', requireAdmin, async (req, res) => {
  const linkRow = await db.query('SELECT * FROM links WHERE id = $1', [req.params.id]);
  const oldLink = linkRow.rows[0];
  if (!oldLink) return res.status(404).send(notFoundAdmin('Link não encontrado.'));
  try {
    const link = parseLinkPayload(req.body);
    await db.query(`
      UPDATE links SET label=$1, url=$2, icon=$3, description=$4, is_highlight=$5, is_active=$6, sort_order=$7, updated_at=NOW()
      WHERE id=$8
    `, [link.label, link.url, link.icon, link.description, link.is_highlight, link.is_active, link.sort_order, oldLink.id]);
    await db.query('UPDATE bios SET updated_at = NOW() WHERE id = $1', [oldLink.bio_id]);
    res.redirect(`/admin/bios/${oldLink.bio_id}/edit`);
  } catch (error) {
    res.status(400).send(notFoundAdmin(humanDbError(error)));
  }
});

app.post('/admin/links/:id/delete', requireAdmin, async (req, res) => {
  const linkRow = await db.query('DELETE FROM links WHERE id = $1 RETURNING bio_id', [req.params.id]);
  const bioId = linkRow.rows[0]?.bio_id;
  if (bioId) await db.query('UPDATE bios SET updated_at = NOW() WHERE id = $1', [bioId]);
  res.redirect(bioId ? `/admin/bios/${bioId}/edit` : '/admin/bios');
});

app.get('/go/:id', async (req, res) => {
  const result = await db.query(`
    SELECT l.*, b.slug, b.id AS bio_id, b.published
    FROM links l
    JOIN bios b ON b.id = l.bio_id
    WHERE l.id = $1
  `, [req.params.id]);
  const link = result.rows[0];
  if (!link || !link.published || !link.is_active) return res.status(404).send(notFoundPage());
  await trackEvent(req, link.bio_id, link.id, 'click');
  res.redirect(normalizeUrl(link.url));
});

app.get('/', async (req, res) => {
  res.send(homePage());
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${APP_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', async (req, res) => {
  const bios = await db.query('SELECT slug, updated_at FROM bios WHERE published = true ORDER BY updated_at DESC');
  const urls = bios.rows.map(bio => `<url><loc>${APP_URL}/${bio.slug}</loc><lastmod>${new Date(bio.updated_at).toISOString()}</lastmod></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.get('/:slug', async (req, res) => {
  const reserved = ['admin', 'assets', 'uploads', 'go', 'health', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
  if (reserved.includes(req.params.slug)) return res.status(404).send(notFoundPage());

  const bio = await db.getBioBySlug(req.params.slug);
  if (!bio || !bio.published) return res.status(404).send(notFoundPage());
  const links = await db.getLinksByBioId(bio.id, true);
  await trackEvent(req, bio.id, null, 'visit');
  res.send(publicBioPage(bio, links));
});

app.use((req, res) => res.status(404).send(notFoundPage()));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send(process.env.NODE_ENV === 'production' ? 'Erro interno.' : `<pre>${error.stack}</pre>`);
});

async function trackEvent(req, bioId, linkId, type) {
  try {
    await db.query(`
      INSERT INTO events (bio_id, link_id, event_type, referrer, user_agent, ip_hash)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [
      bioId,
      linkId,
      type,
      String(req.get('referer') || '').slice(0, 500),
      String(req.get('user-agent') || '').slice(0, 500),
      hashIp(req.ip, process.env.COOKIE_SECRET || 'leme-bio')
    ]);
  } catch (error) {
    console.error('Falha ao registrar métrica:', error.message);
  }
}

function humanDbError(error) {
  if (error.code === '23505') return 'Esse slug já está sendo usado. Escolha outro.';
  return error.message || 'Não foi possível salvar.';
}

async function boot() {
  await waitForDb();
  await db.migrate();
  await db.seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`LEME Bio rodando em http://0.0.0.0:${PORT}`);
  });
}

boot().catch(error => {
  console.error(error);
  process.exit(1);
});
