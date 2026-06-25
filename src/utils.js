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

const iconOptions = [
  ['link', 'Link'],
  ['whatsapp', 'WhatsApp'],
  ['instagram', 'Instagram'],
  ['site', 'Site'],
  ['agenda', 'Agenda'],
  ['maps', 'Localização'],
  ['phone', 'Telefone'],
  ['email', 'E-mail'],
  ['form', 'Formulário'],
  ['video', 'Vídeo'],
  ['download', 'Download'],
  ['star', 'Destaque'],
  ['clinic', 'Clínica'],
  ['doctor', 'Médico']
];

const iconPaths = {
  link: '<path d="M10.6 13.4a3 3 0 0 1 0-4.2l2.6-2.6a3 3 0 0 1 4.2 4.2l-.8.8"/><path d="M13.4 10.6a3 3 0 0 1 0 4.2l-2.6 2.6a3 3 0 1 1-4.2-4.2l.8-.8"/>',
  whatsapp: '<path d="M20 11.2c0 4.8-3.9 8.8-8.8 8.8-1.5 0-3-.4-4.2-1.1L2 20l1.2-4.7A8.7 8.7 0 0 1 2.4 12c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8Z"/><path d="M8 7.7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.2 2.4 1 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.4.1-1.5-.1-.1-.4-.2-.9-.5s-1.7-.8-2-.9c-.2-.1-.4-.1-.6.2l-.8.9c-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.6l-.8-2Z"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>',
  site: '<circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3.2c2 2.1 3.2 5.2 3.2 8.8 0 3.6-1.1 6.7-3.2 8.8-2-2.1-3.2-5.2-3.2-8.8 0-3.6 1.1-6.7 3.2-8.8Z"/>',
  agenda: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/><path d="M8.5 13h3M8.5 16h6"/>',
  maps: '<path d="M12 20c3.6-4.3 5.4-7.5 5.4-9.7a5.4 5.4 0 1 0-10.8 0c0 2.2 1.8 5.4 5.4 9.7Z"/><circle cx="12" cy="10" r="2.2"/>',
  phone: '<path d="M7.2 4.8c.4-.4 1-.6 1.6-.3l2 1c.6.3.8 1 .6 1.6l-.6 1.5c-.1.3 0 .6.2.9 1 1.6 2.4 3 4 4 .3.2.6.3.9.2l1.5-.6c.6-.2 1.3 0 1.6.6l1 2c.3.6.1 1.2-.3 1.6l-1 1c-.7.7-1.7 1-2.7.8-2.3-.4-5-2-7.3-4.3s-3.9-5-4.3-7.3c-.2-1 .1-2 .8-2.7l1-1Z"/>',
  email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  form: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/>',
  video: '<rect x="4" y="5" width="11.5" height="14" rx="2.5"/><path d="m15.5 10 4.5-2.5v9L15.5 14"/>',
  download: '<path d="M12 4.5v9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 18.5h14"/>',
  star: '<path d="m12 3.8 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 3.8Z"/>',
  clinic: '<path d="M6 19V8.5C6 6 8 4 10.5 4h3C16 4 18 6 18 8.5V19"/><path d="M9 19v-4h6v4"/><path d="M10.5 8h3M12 6.5v3"/>',
  doctor: '<circle cx="12" cy="8" r="3"/><path d="M7 18c.7-2.5 2.7-4 5-4s4.3 1.5 5 4"/><path d="M18.5 9.5v4M16.5 11.5h4"/>'
};

function renderIcon(icon = 'link', className = '') {
  const svg = iconPaths[icon] || iconPaths.link;
  const extra = className ? ` ${escapeAttr(className)}` : '';
  return `<svg class="icon${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg>`;
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
  renderIcon,
  iconOptions
};
