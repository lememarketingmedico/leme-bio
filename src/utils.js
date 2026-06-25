const crypto = require('crypto');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function ensureSlug(value = '') {
  const slug = slugify(value);
  if (!slug) throw new Error('O slug é obrigatório.');
  return slug;
}

function normalizeUrl(url = '') {
  const value = String(url).trim();
  if (!value) return '';
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(value)) return value;
  return `https://${value}`;
}

function isSafeHex(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
}

function boolFromForm(value) {
  return value === 'on' || value === 'true' || value === true || value === '1';
}

function hashIp(ip = '', secret = 'leme-bio') {
  return crypto.createHmac('sha256', secret).update(String(ip)).digest('hex').slice(0, 32);
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo'
  }).format(new Date(value));
}

function iconEmoji(icon = 'link') {
  const icons = {
    link: '🔗',
    whatsapp: '💬',
    instagram: '📸',
    site: '🌐',
    agenda: '📅',
    maps: '📍',
    phone: '📞',
    email: '✉️',
    form: '📝',
    video: '▶️',
    download: '⬇️',
    star: '⭐',
    heart: '♡',
    clinic: '🏥',
    doctor: '🩺'
  };
  return icons[icon] || icons.link;
}

module.exports = {
  escapeHtml,
  escapeAttr,
  slugify,
  ensureSlug,
  normalizeUrl,
  isSafeHex,
  boolFromForm,
  hashIp,
  formatNumber,
  formatDateTime,
  iconEmoji
};
