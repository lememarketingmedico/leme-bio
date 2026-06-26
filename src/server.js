require('dotenv').config();

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
let sharp = null;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp não disponível. O sistema continuará funcionando sem otimização avançada de imagens.');
}

const db = require('./db');
const { loginPage } = require('./views/layout');
const { dashboardPage, biosListPage, bioFormPage, notFoundAdmin } = require('./views/admin');
const { publicBioPage, homePage, notFoundPage, builderPage, successPage } = require('./views/public');
const { requireAdmin, setAuthCookie, clearAuthCookie } = require('./auth');
const {
  ensureSlug,
  normalizeUrl,
  isSafeHex,
  boolFromForm,
  hashIp,
  iconOptions,
  slugify
} = require('./utils');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 4);
const reservedSlugs = ['admin', 'assets', 'uploads', 'go', 'health', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'create', 'edit', 'success'];
const allowedIcons = iconOptions.map(([value]) => value);

fs.mkdirSync(uploadDir, { recursive: true });

if (String(process.env.TRUST_PROXY || 'true') === 'true') app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/assets', express.static(path.join(__dirname, '..', 'public'), { maxAge: '7d' }));
app.use('/uploads', express.static(uploadDir, { maxAge: '30d' }));

const upload = multer({
  storage: multer.memoryStorage(),
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

function uploadFieldsPublic(req, res, next) {
  const handler = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]);
  handler(req, res, err => {
    if (err) return res.status(400).send(builderPage({ form: buildFormState(req.body), error: err.message }));
    next();
  });
}

async function saveUploadedImage(file, kind = 'avatar') {
  if (!file) return '';

  if (file.mimetype === 'image/svg+xml') {
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.svg`;
    await fs.promises.writeFile(path.join(uploadDir, filename), file.buffer);
    return `/uploads/${filename}`;
  }

  if (sharp) {
    const presets = {
      avatar: { width: 720, height: 720, quality: 82 },
      logo: { width: 800, height: 300, quality: 84 },
      background: { width: 1600, height: 1200, quality: 78 }
    };
    const { width, height, quality } = presets[kind] || presets.avatar;
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
    const outputPath = path.join(uploadDir, filename);
    await sharp(file.buffer)
      .rotate()
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(outputPath);
    return `/uploads/${filename}`;
  }

  const safeExt = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype] || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`;
  await fs.promises.writeFile(path.join(uploadDir, filename), file.buffer);
  return `/uploads/${filename}`;
}

function pickFile(req, name) {
  return req.files?.[name]?.[0] || null;
}

function pickColor(body, name, fallback) {
  return isSafeHex(body[`${name}_text`] || body[name], fallback);
}

async function parseBioPayload(req, existing = {}) {
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
    template: ['premium', 'clinic', 'minimal', 'dark', 'ocean', 'light', 'editorial', 'soft', 'frame'].includes(body.template) ? body.template : 'ocean',
    primary_color: pickColor(body, 'primary_color', existing.primary_color || '#1B2E5A'),
    secondary_color: pickColor(body, 'secondary_color', existing.secondary_color || '#D7B56D'),
    background_type: ['gradient', 'solid', 'image'].includes(body.background_type) ? body.background_type : 'gradient',
    background_color: pickColor(body, 'background_color', existing.background_color || '#0B1020'),
    background_color_2: pickColor(body, 'background_color_2', existing.background_color_2 || '#1B2E5A'),
    button_style: ['glass', 'solid', 'outline', 'soft', 'pill', 'clean', 'shadow', 'glow'].includes(body.button_style) ? body.button_style : 'glass',
    font_family: ['inter', 'serif', 'rounded'].includes(body.font_family) ? body.font_family : 'inter',
    text_color: pickColor(body, 'text_color', existing.text_color || '#FFFFFF'),
    show_branding: true,
    published: boolFromForm(body.published),
    avatar_url: (await saveUploadedImage(pickFile(req, 'avatar'), 'avatar')) || existing.avatar_url || '',
    logo_url: (await saveUploadedImage(pickFile(req, 'logo'), 'logo')) || existing.logo_url || '',
    background_image_url: (await saveUploadedImage(pickFile(req, 'background'), 'background')) || existing.background_image_url || ''
  };
}

async function parsePublicBioPayload(req, existing = {}) {
  const body = req.body;
  const slug = ensureSlug(body.slug || body.title);
  if (reservedSlugs.includes(slug)) throw new Error('Escolha outro endereço para sua página.');
  return {
    slug,
    title: String(body.title || '').trim(),
    subtitle: String(body.subtitle || '').trim(),
    description: String(body.description || '').trim(),
    instagram: normalizeSocialInput(body.instagram),
    whatsapp: normalizeSocialInput(body.whatsapp),
    website: normalizeSocialInput(body.website),
    location: normalizeSocialInput(body.location),
    seo_title: String(body.title || '').trim(),
    seo_description: String(body.description || '').trim(),
    template: ['premium', 'clinic', 'minimal', 'dark', 'ocean', 'light', 'editorial', 'soft', 'frame'].includes(body.template) ? body.template : 'ocean',
    primary_color: pickColor(body, 'primary_color', existing.primary_color || '#1B2E5A'),
    secondary_color: pickColor(body, 'secondary_color', existing.secondary_color || '#D7B56D'),
    background_type: 'gradient',
    background_color: pickColor(body, 'background_color', existing.background_color || '#091121'),
    background_color_2: pickColor(body, 'background_color_2', existing.background_color_2 || '#1B2E5A'),
    background_image_url: '',
    button_style: ['glass', 'solid', 'outline', 'soft', 'pill', 'clean', 'shadow', 'glow'].includes(body.button_style) ? body.button_style : 'glass',
    font_family: 'inter',
    text_color: pickColor(body, 'text_color', existing.text_color || '#FFFFFF'),
    show_branding: true,
    published: true,
    avatar_url: (await saveUploadedImage(pickFile(req, 'avatar'), 'avatar')) || existing.avatar_url || '',
    logo_url: (await saveUploadedImage(pickFile(req, 'logo'), 'logo')) || existing.logo_url || ''
  };
}

function parseLinkPayload(body) {
  const label = String(body.label || '').trim();
  const url = normalizeUrl(body.url || '');
  if (!label) throw new Error('O texto do link é obrigatório.');
  if (!url) throw new Error('A URL é obrigatória.');
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

function parsePublicLinksPayload(body) {
  const links = [];
  for (let index = 0; index < 10; index += 1) {
    const label = String(body[`link_label_${index}`] || '').trim();
    const url = String(body[`link_url_${index}`] || '').trim();
    const description = String(body[`link_description_${index}`] || '').trim();
    const icon = allowedIcons.includes(body[`link_icon_${index}`]) ? body[`link_icon_${index}`] : 'link';
    const is_highlight = boolFromForm(body[`link_highlight_${index}`]);

    if (!label && !url) continue;
    if (!label || !url) throw new Error(`Preencha o conteúdo do botão ${index + 1}.`);
    links.push({
      label,
      url: normalizeUrl(url),
      icon,
      description,
      is_highlight,
      is_active: true,
      sort_order: index + 1
    });
  }
  if (links.length > 10) throw new Error('O limite máximo é de 10 links.');
  return links;
}

function buildFormState(body = {}, bio = {}) {
  const state = {
    title: body.title || bio.title || '',
    slug: body.slug || bio.slug || '',
    subtitle: body.subtitle || bio.subtitle || '',
    description: body.description || bio.description || '',
    instagram: body.instagram || bio.instagram || '',
    whatsapp: body.whatsapp || bio.whatsapp || '',
    website: body.website || bio.website || '',
    location: body.location || bio.location || '',
    template: body.template || bio.template || 'premium',
    button_style: body.button_style || bio.button_style || 'glass',
    primary_color: body.primary_color_text || body.primary_color || bio.primary_color || '#1B2E5A',
    secondary_color: body.secondary_color_text || body.secondary_color || bio.secondary_color || '#D7B56D',
    background_color: body.background_color_text || body.background_color || bio.background_color || '#091121',
    background_color_2: body.background_color_2_text || body.background_color_2 || bio.background_color_2 || '#1B2E5A',
    text_color: body.text_color_text || body.text_color || bio.text_color || '#FFFFFF',
    avatar_preview_url: bio.avatar_url || '',
    logo_preview_url: bio.logo_url || ''
  };

  const links = [];
  for (let index = 0; index < 10; index += 1) {
    const label = body[`link_label_${index}`];
    const url = body[`link_url_${index}`];
    const description = body[`link_description_${index}`];
    const icon = body[`link_icon_${index}`];
    if (label !== undefined || url !== undefined || description !== undefined || icon !== undefined) {
      links.push({
        label: String(label || ''),
        url: String(url || ''),
        description: String(description || ''),
        icon: allowedIcons.includes(icon) ? icon : 'link',
        is_highlight: boolFromForm(body[`link_highlight_${index}`]),
        kind: String(body[`link_kind_${index}`] || ''),
        value: String(body[`link_value_${index}`] || ''),
        place_id: String(body[`link_place_id_${index}`] || '')
      });
    }
  }
  if (!links.length && Array.isArray(bio.links)) state.links = bio.links;
  else state.links = links;
  return state;
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
    const bio = await parseBioPayload(req);
    const result = await db.query(`
      INSERT INTO bios (
        slug, title, subtitle, description, avatar_url, logo_url, instagram, whatsapp, location, website,
        seo_title, seo_description, template, primary_color, secondary_color, background_type,
        background_color, background_color_2, background_image_url, button_style, font_family, text_color,
        show_branding, published, updated_at, edit_token
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW(),$25)
      RETURNING id
    `, [
      bio.slug, bio.title, bio.subtitle, bio.description, bio.avatar_url, bio.logo_url, bio.instagram, bio.whatsapp,
      bio.location, bio.website, bio.seo_title, bio.seo_description, bio.template, bio.primary_color,
      bio.secondary_color, bio.background_type, bio.background_color, bio.background_color_2, bio.background_image_url,
      bio.button_style, bio.font_family, bio.text_color, true, bio.published, crypto.randomBytes(24).toString('hex')
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
    const bio = await parseBioPayload(req, existing);
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
      bio.background_image_url, bio.button_style, bio.font_family, bio.text_color, true,
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
    const count = await db.query('SELECT COUNT(*)::int AS total FROM links WHERE bio_id = $1', [bio.id]);
    if (count.rows[0].total >= 10) throw new Error('O limite máximo é de 10 links por página.');
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

app.get('/', async (req, res) => {
  res.send(homePage());
});

app.post('/create', uploadFieldsPublic, async (req, res) => {
  try {
    const bio = await parsePublicBioPayload(req);
    const links = parsePublicLinksPayload(req.body);
    const editToken = crypto.randomBytes(24).toString('hex');
    const result = await db.query(`
      INSERT INTO bios (
        slug, title, subtitle, description, avatar_url, logo_url, instagram, whatsapp, location, website,
        seo_title, seo_description, template, primary_color, secondary_color, background_type,
        background_color, background_color_2, background_image_url, button_style, font_family, text_color,
        show_branding, published, updated_at, edit_token
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,NOW(),$25)
      RETURNING id, slug
    `, [
      bio.slug, bio.title, bio.subtitle, bio.description, bio.avatar_url, bio.logo_url, bio.instagram, bio.whatsapp,
      bio.location, bio.website, bio.seo_title, bio.seo_description, bio.template, bio.primary_color,
      bio.secondary_color, bio.background_type, bio.background_color, bio.background_color_2, bio.background_image_url,
      bio.button_style, bio.font_family, bio.text_color, true, true, editToken
    ]);

    for (const link of links) {
      await db.query(`
        INSERT INTO links (bio_id, label, url, icon, description, is_highlight, is_active, sort_order, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,true,$7,NOW())
      `, [result.rows[0].id, link.label, link.url, link.icon, link.description, link.is_highlight, link.sort_order]);
    }

    res.redirect(`/success/${result.rows[0].slug}?edit=${editToken}`);
  } catch (error) {
    res.status(400).send(builderPage({ form: buildFormState(req.body), error: humanDbError(error) }));
  }
});

app.get('/edit/:token', async (req, res) => {
  const bio = await db.getBioByEditToken(req.params.token);
  if (!bio) return res.status(404).send(notFoundPage());
  const links = await db.getLinksByBioId(bio.id);
  res.send(builderPage({
    form: {
      ...bio,
      avatar_preview_url: bio.avatar_url,
      logo_preview_url: bio.logo_url,
      links: links.map(link => ({
        label: link.label,
        url: link.url,
        icon: link.icon,
        description: link.description,
        is_highlight: link.is_highlight
      }))
    },
    editMode: true,
    editToken: bio.edit_token
  }));
});

app.post('/edit/:token', uploadFieldsPublic, async (req, res) => {
  const existing = await db.getBioByEditToken(req.params.token);
  if (!existing) return res.status(404).send(notFoundPage());
  try {
    const bio = await parsePublicBioPayload(req, existing);
    const links = parsePublicLinksPayload(req.body);
    await db.query(`
      UPDATE bios SET
        slug=$1, title=$2, subtitle=$3, description=$4, avatar_url=$5, logo_url=$6,
        instagram=$7, whatsapp=$8, location=$9, website=$10, seo_title=$11, seo_description=$12,
        template=$13, primary_color=$14, secondary_color=$15, background_type=$16,
        background_color=$17, background_color_2=$18, background_image_url=$19, button_style=$20,
        font_family=$21, text_color=$22, show_branding=true, published=true, updated_at=NOW()
      WHERE id=$23
    `, [
      bio.slug, bio.title, bio.subtitle, bio.description, bio.avatar_url, bio.logo_url,
      bio.instagram, bio.whatsapp, bio.location, bio.website, bio.seo_title, bio.seo_description,
      bio.template, bio.primary_color, bio.secondary_color, bio.background_type, bio.background_color,
      bio.background_color_2, bio.background_image_url, bio.button_style, bio.font_family, bio.text_color, existing.id
    ]);

    await db.query('DELETE FROM links WHERE bio_id = $1', [existing.id]);
    for (const link of links) {
      await db.query(`
        INSERT INTO links (bio_id, label, url, icon, description, is_highlight, is_active, sort_order, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,true,$7,NOW())
      `, [existing.id, link.label, link.url, link.icon, link.description, link.is_highlight, link.sort_order]);
    }

    res.redirect(`/success/${bio.slug}?edit=${existing.edit_token}`);
  } catch (error) {
    res.status(400).send(builderPage({
      form: { ...buildFormState(req.body), avatar_preview_url: existing.avatar_url, logo_preview_url: existing.logo_url },
      error: humanDbError(error),
      editMode: true,
      editToken: existing.edit_token
    }));
  }
});

app.get('/success/:slug', async (req, res) => {
  const bio = await db.getBioBySlug(req.params.slug);
  if (!bio) return res.status(404).send(notFoundPage());
  const editToken = req.query.edit || bio.edit_token;
  res.send(successPage({
    bioUrl: `${APP_URL}/${bio.slug}`,
    editUrl: `${APP_URL}/edit/${editToken}`
  }));
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

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${APP_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', async (req, res) => {
  const bios = await db.query('SELECT slug, updated_at FROM bios WHERE published = true ORDER BY updated_at DESC');
  const urls = bios.rows.map(bio => `<url><loc>${APP_URL}/${bio.slug}</loc><lastmod>${new Date(bio.updated_at).toISOString()}</lastmod></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

app.get('/:slug', async (req, res) => {
  if (reservedSlugs.includes(req.params.slug)) return res.status(404).send(notFoundPage());

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
  if (error.code === '23505') return 'Esse endereço já está sendo usado. Escolha outro slug.';
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
