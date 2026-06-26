const crypto = require('crypto');
const { Pool } = require('pg');
const { normalizeUrl } = require('./utils');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS bios (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      description TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      logo_url TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      location TEXT DEFAULT '',
      website TEXT DEFAULT '',
      seo_title TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      template TEXT DEFAULT 'premium',
      primary_color TEXT DEFAULT '#1B2E5A',
      secondary_color TEXT DEFAULT '#D7B56D',
      background_type TEXT DEFAULT 'gradient',
      background_color TEXT DEFAULT '#0B1020',
      background_color_2 TEXT DEFAULT '#1B2E5A',
      background_image_url TEXT DEFAULT '',
      button_style TEXT DEFAULT 'glass',
      font_family TEXT DEFAULT 'inter',
      text_color TEXT DEFAULT '#FFFFFF',
      icon_color TEXT DEFAULT '#FFFFFF',
      show_branding BOOLEAN DEFAULT true,
      published BOOLEAN DEFAULT true,
      edit_token TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`ALTER TABLE bios ADD COLUMN IF NOT EXISTS edit_token TEXT DEFAULT '';`);
  await query(`ALTER TABLE bios ADD COLUMN IF NOT EXISTS show_branding BOOLEAN DEFAULT true;`);
  await query(`ALTER TABLE bios ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;`);
  await query(`ALTER TABLE bios ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT '#FFFFFF';`);
  await query(`UPDATE bios SET edit_token = md5(random()::text || clock_timestamp()::text) WHERE edit_token IS NULL OR edit_token = '';`);
  await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_bios_edit_token ON bios(edit_token) WHERE edit_token <> '';`);

  await query(`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      bio_id INTEGER NOT NULL REFERENCES bios(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT DEFAULT 'link',
      description TEXT DEFAULT '',
      is_highlight BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      bio_id INTEGER REFERENCES bios(id) ON DELETE CASCADE,
      link_id INTEGER REFERENCES links(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      referrer TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      ip_hash TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_bios_slug ON bios(slug);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_links_bio_order ON links(bio_id, sort_order, id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_events_bio_created ON events(bio_id, created_at DESC);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_events_link_created ON events(link_id, created_at DESC);`);
}

async function seedIfEmpty() {
  const count = await query('SELECT COUNT(*)::int AS total FROM bios');
  if (count.rows[0].total > 0) return;

  const bio = await query(`
    INSERT INTO bios (
      slug, title, subtitle, description, instagram, whatsapp, website, location,
      seo_title, seo_description, template, primary_color, secondary_color,
      background_type, background_color, background_color_2, button_style, text_color, edit_token
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING id
  `, [
    'demo',
    'LEME Bio Demo',
    'Link na bio premium para médicos e clínicas',
    'Uma página elegante, rápida e personalizada para centralizar seus canais principais.',
    'https://instagram.com/leme.marketingmedico',
    'https://wa.me/5534999999999',
    'https://lememarketingmedico.com.br',
    'https://maps.google.com',
    'LEME Bio Demo',
    'Página de demonstração do LEME Bio.',
    'premium',
    '#1B2E5A',
    '#D7B56D',
    'gradient',
    '#080D1C',
    '#1B2E5A',
    'glass',
    '#FFFFFF',
    crypto.randomBytes(24).toString('hex')
  ]);

  const bioId = bio.rows[0].id;
  const links = [
    ['Agendar uma conversa', 'https://wa.me/5534999999999', 'whatsapp', 'Fale com a equipe LEME', true, 1],
    ['Conheça nosso site', 'https://lememarketingmedico.com.br', 'site', 'Marketing médico com estratégia', false, 2],
    ['Ver Instagram', 'https://instagram.com/leme.marketingmedico', 'instagram', '', false, 3]
  ];
  for (const item of links) {
    await query(`
      INSERT INTO links (bio_id, label, url, icon, description, is_highlight, sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [bioId, item[0], normalizeUrl(item[1]), item[2], item[3], item[4], item[5]]);
  }
}

async function getBioBySlug(slug) {
  const result = await query('SELECT * FROM bios WHERE slug = $1 LIMIT 1', [slug]);
  return result.rows[0] || null;
}

async function getBioById(id) {
  const result = await query('SELECT * FROM bios WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

async function getBioByEditToken(token) {
  const result = await query('SELECT * FROM bios WHERE edit_token = $1 LIMIT 1', [token]);
  return result.rows[0] || null;
}

async function getLinksByBioId(bioId, activeOnly = false) {
  const sql = activeOnly
    ? 'SELECT * FROM links WHERE bio_id = $1 AND is_active = true ORDER BY sort_order ASC, id ASC'
    : 'SELECT * FROM links WHERE bio_id = $1 ORDER BY sort_order ASC, id ASC';
  const result = await query(sql, [bioId]);
  return result.rows;
}

async function getDashboardStats() {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM bios) AS bios,
      (SELECT COUNT(*)::int FROM events WHERE event_type = 'visit' AND created_at >= NOW() - INTERVAL '30 days') AS visits_30,
      (SELECT COUNT(*)::int FROM events WHERE event_type = 'click' AND created_at >= NOW() - INTERVAL '30 days') AS clicks_30,
      (SELECT COUNT(*)::int FROM links) AS links
  `);
  return result.rows[0];
}

async function getBiosWithStats() {
  const result = await query(`
    SELECT
      b.*,
      COUNT(e.id) FILTER (WHERE e.event_type = 'visit' AND e.created_at >= NOW() - INTERVAL '30 days')::int AS visits_30,
      COUNT(e.id) FILTER (WHERE e.event_type = 'click' AND e.created_at >= NOW() - INTERVAL '30 days')::int AS clicks_30
    FROM bios b
    LEFT JOIN events e ON e.bio_id = b.id
    GROUP BY b.id
    ORDER BY b.updated_at DESC
  `);
  return result.rows;
}

async function getBioAnalytics(bioId) {
  const totals = await query(`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'visit')::int AS visits_total,
      COUNT(*) FILTER (WHERE event_type = 'click')::int AS clicks_total,
      COUNT(*) FILTER (WHERE event_type = 'visit' AND created_at >= NOW() - INTERVAL '30 days')::int AS visits_30,
      COUNT(*) FILTER (WHERE event_type = 'click' AND created_at >= NOW() - INTERVAL '30 days')::int AS clicks_30
    FROM events
    WHERE bio_id = $1
  `, [bioId]);

  const linkStats = await query(`
    SELECT l.id, l.label, l.url,
      COUNT(e.id) FILTER (WHERE e.event_type = 'click')::int AS clicks
    FROM links l
    LEFT JOIN events e ON e.link_id = l.id
    WHERE l.bio_id = $1
    GROUP BY l.id
    ORDER BY clicks DESC, l.sort_order ASC
  `, [bioId]);

  const daily = await query(`
    SELECT to_char(date_trunc('day', created_at), 'DD/MM') AS day,
      COUNT(*) FILTER (WHERE event_type = 'visit')::int AS visits,
      COUNT(*) FILTER (WHERE event_type = 'click')::int AS clicks
    FROM events
    WHERE bio_id = $1 AND created_at >= NOW() - INTERVAL '14 days'
    GROUP BY date_trunc('day', created_at)
    ORDER BY date_trunc('day', created_at) ASC
  `, [bioId]);

  return { totals: totals.rows[0], linkStats: linkStats.rows, daily: daily.rows };
}

module.exports = {
  pool,
  query,
  migrate,
  seedIfEmpty,
  getBioBySlug,
  getBioById,
  getBioByEditToken,
  getLinksByBioId,
  getDashboardStats,
  getBiosWithStats,
  getBioAnalytics
};
