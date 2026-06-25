const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, iconEmoji } = require('../utils');

function fontClass(font = 'inter') {
  if (font === 'serif') return 'font-serif';
  if (font === 'rounded') return 'font-rounded';
  return 'font-inter';
}

function backgroundStyle(bio) {
  if (bio.background_type === 'image' && bio.background_image_url) {
    return `background-image: linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,.68)), url('${escapeAttr(bio.background_image_url)}');`;
  }
  if (bio.background_type === 'solid') {
    return `background:${escapeAttr(bio.background_color)};`;
  }
  return `background: radial-gradient(circle at 20% 0%, ${escapeAttr(bio.secondary_color)}55 0, transparent 28%), linear-gradient(145deg, ${escapeAttr(bio.background_color)}, ${escapeAttr(bio.background_color_2)});`;
}

function publicBioPage(bio, links) {
  const title = bio.seo_title || `${bio.title} | Links`;
  const description = bio.seo_description || bio.description || bio.subtitle || 'Links principais.';
  const styleVars = `--primary:${escapeAttr(bio.primary_color)};--secondary:${escapeAttr(bio.secondary_color)};--text:${escapeAttr(bio.text_color)};`;

  const quickLinks = [
    bio.instagram ? ['instagram', normalizeSocial(bio.instagram, 'instagram')] : null,
    bio.whatsapp ? ['whatsapp', normalizeSocial(bio.whatsapp, 'whatsapp')] : null,
    bio.website ? ['site', normalizeSocial(bio.website, 'site')] : null,
    bio.location ? ['maps', normalizeSocial(bio.location, 'maps')] : null
  ].filter(Boolean).map(([icon, url]) => `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${iconEmoji(icon)}</a>`).join('');

  const linkHtml = links.map(link => `
    <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="/go/${link.id}" target="_blank" rel="noopener">
      <span class="link-icon">${iconEmoji(link.icon)}</span>
      <span class="link-copy"><strong>${escapeHtml(link.label)}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
      <span class="arrow">›</span>
    </a>`).join('');

  const body = `<main class="public-shell ${fontClass(bio.font_family)} template-${escapeAttr(bio.template)} buttons-${escapeAttr(bio.button_style)}" style="${styleVars}${backgroundStyle(bio)}">
    <div class="ambient one"></div>
    <div class="ambient two"></div>
    <section class="bio-phone">
      ${bio.logo_url ? `<img class="client-logo" src="${escapeAttr(bio.logo_url)}" alt="Logo ${escapeAttr(bio.title)}">` : ''}
      <div class="avatar-wrap">
        ${bio.avatar_url ? `<img class="avatar" src="${escapeAttr(bio.avatar_url)}" alt="${escapeAttr(bio.title)}">` : `<div class="avatar fallback">${escapeHtml((bio.title || 'L').charAt(0))}</div>`}
      </div>
      <h1>${escapeHtml(bio.title)}</h1>
      ${bio.subtitle ? `<p class="subtitle">${escapeHtml(bio.subtitle)}</p>` : ''}
      ${bio.description ? `<p class="description">${escapeHtml(bio.description)}</p>` : ''}
      ${quickLinks ? `<nav class="quick-links">${quickLinks}</nav>` : ''}
      <div class="links-stack">${linkHtml || '<p class="empty-public">Nenhum link disponível.</p>'}</div>
      ${bio.show_branding ? `<a class="powered" href="https://lememarketingmedico.com.br" target="_blank" rel="noopener">Criado por LEME Marketing Médico</a>` : ''}
    </section>
  </main>`;

  return publicHtml({ title, description, body });
}

function homePage() {
  const body = `<main class="public-home">
    <section>
      <div class="home-badge">LEME Bio</div>
      <h1>Links na bio premium para médicos e clínicas.</h1>
      <p>Este endereço hospeda páginas personalizadas dos clientes da LEME.</p>
      <a href="/admin" class="home-button">Entrar no painel</a>
    </section>
  </main>`;
  return publicHtml({ title: 'LEME Bio', description: 'Sistema de link na bio da LEME Marketing Médico.', body });
}

function notFoundPage() {
  const body = `<main class="public-home"><section><div class="home-badge">404</div><h1>Página não encontrada.</h1><p>Verifique se o link está correto.</p><a class="home-button" href="/">Voltar</a></section></main>`;
  return publicHtml({ title: 'Página não encontrada', description: '', body });
}

function normalizeSocial(value, type) {
  const raw = String(value || '').trim();
  if (!raw) return '#';
  if (type === 'instagram' && raw.startsWith('@')) return `https://instagram.com/${raw.replace('@', '')}`;
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(raw)) return raw;
  if (type === 'whatsapp' && /^\+?\d{10,15}$/.test(raw.replace(/\D/g, ''))) return `https://wa.me/${raw.replace(/\D/g, '')}`;
  return `https://${raw}`;
}

module.exports = { publicBioPage, homePage, notFoundPage };
