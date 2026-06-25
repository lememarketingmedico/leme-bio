const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, renderIcon } = require('../utils');

function fontClass(font = 'inter') {
  if (font === 'serif') return 'font-serif';
  if (font === 'rounded') return 'font-rounded';
  return 'font-inter';
}

function backgroundStyle(bio) {
  if (bio.background_type === 'image' && bio.background_image_url) {
    return `background-image: linear-gradient(180deg, rgba(0,0,0,.38), rgba(0,0,0,.68)), url('${escapeAttr(bio.background_image_url)}');`;
  }
  if (bio.background_type === 'solid') {
    return `background:${escapeAttr(bio.background_color)};`;
  }
  return `background: radial-gradient(circle at 20% 0%, ${escapeAttr(bio.secondary_color)}40 0, transparent 28%), linear-gradient(145deg, ${escapeAttr(bio.background_color)}, ${escapeAttr(bio.background_color_2)});`;
}

function normalizeSocial(value, type) {
  const raw = String(value || '').trim();
  if (!raw) return '#';
  if (type === 'instagram' && raw.startsWith('@')) return `https://instagram.com/${raw.replace('@', '')}`;
  if (/^(https?:\/\/|mailto:|tel:|whatsapp:)/i.test(raw)) return raw;
  if (type === 'whatsapp' && /^\+?\d{10,15}$/.test(raw.replace(/\D/g, ''))) return `https://wa.me/${raw.replace(/\D/g, '')}`;
  return `https://${raw}`;
}

function quickLinksHtml(bio) {
  const quickLinks = [
    bio.instagram ? ['instagram', normalizeSocial(bio.instagram, 'instagram')] : null,
    bio.whatsapp ? ['whatsapp', normalizeSocial(bio.whatsapp, 'whatsapp')] : null,
    bio.website ? ['site', normalizeSocial(bio.website, 'site')] : null,
    bio.location ? ['maps', normalizeSocial(bio.location, 'maps')] : null
  ].filter(Boolean);

  if (!quickLinks.length) return '';
  return `<nav class="quick-links">${quickLinks.map(([icon, url]) => `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${renderIcon(icon)}</a>`).join('')}</nav>`;
}

function publicBranding() {
  return `<a class="powered" href="https://lememarketingmedico.com.br" target="_blank" rel="noopener">
    <img src="/assets/leme-logo.png" alt="LEME Marketing Médico">
    <span>Feito com LEME Bio</span>
  </a>`;
}

function bioCardHtml(bio, links, opts = {}) {
  const linkHtml = links.map(link => {
    const href = opts.preview ? '#' : `/go/${link.id}`;
    return `
      <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="${href}" ${opts.preview ? 'onclick="return false"' : 'target="_blank" rel="noopener"'}>
        <span class="link-icon">${renderIcon(link.icon)}</span>
        <span class="link-copy"><strong>${escapeHtml(link.label)}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
        <span class="arrow">${renderIcon('link')}</span>
      </a>`;
  }).join('');

  return `<section class="bio-phone ${opts.preview ? 'is-preview' : ''}">
      ${bio.logo_url ? `<img class="client-logo" src="${escapeAttr(bio.logo_url)}" alt="Logo ${escapeAttr(bio.title)}">` : ''}
      <div class="avatar-wrap">
        ${bio.avatar_url ? `<img class="avatar" src="${escapeAttr(bio.avatar_url)}" alt="${escapeAttr(bio.title)}">` : `<div class="avatar fallback">${escapeHtml((bio.title || 'L').charAt(0))}</div>`}
      </div>
      <h1>${escapeHtml(bio.title || 'Seu nome ou marca')}</h1>
      ${bio.subtitle ? `<p class="subtitle">${escapeHtml(bio.subtitle)}</p>` : '<p class="subtitle">Seu subtítulo aparece aqui</p>'}
      ${bio.description ? `<p class="description">${escapeHtml(bio.description)}</p>` : '<p class="description">Uma descrição curta para apresentar seu trabalho, serviço ou marca.</p>'}
      ${quickLinksHtml(bio)}
      <div class="links-stack">${linkHtml || '<p class="empty-public">Adicione até 10 links e veja o resultado em tempo real.</p>'}</div>
      ${publicBranding()}
    </section>`;
}

function publicBioPage(bio, links) {
  const title = bio.seo_title || `${bio.title} | Links`;
  const description = bio.seo_description || bio.description || bio.subtitle || 'Links principais.';
  const styleVars = `--primary:${escapeAttr(bio.primary_color)};--secondary:${escapeAttr(bio.secondary_color)};--text:${escapeAttr(bio.text_color)};`;

  const body = `<main class="public-shell ${fontClass(bio.font_family)} template-${escapeAttr(bio.template)} buttons-${escapeAttr(bio.button_style)}" style="${styleVars}${backgroundStyle(bio)}">
    <div class="ambient one"></div>
    <div class="ambient two"></div>
    ${bioCardHtml(bio, links)}
  </main>`;

  return publicHtml({ title, description, body });
}

function defaultBuilderData() {
  return {
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    instagram: '',
    whatsapp: '',
    website: '',
    location: '',
    template: 'premium',
    button_style: 'glass',
    primary_color: '#1B2E5A',
    secondary_color: '#D7B56D',
    background_type: 'gradient',
    background_color: '#091121',
    background_color_2: '#1B2E5A',
    text_color: '#FFFFFF',
    links: [
      { label: 'Meu WhatsApp', url: '', icon: 'whatsapp', description: '', is_highlight: true },
      { label: 'Meu Instagram', url: '', icon: 'instagram', description: '', is_highlight: false }
    ]
  };
}

function renderLinkRow(link = {}, index = 0) {
  return `<div class="builder-link-row" data-link-row>
    <div class="builder-link-grid">
      <label>Texto do botão<input name="link_label_${index}" maxlength="50" value="${escapeAttr(link.label || '')}" placeholder="Agende sua consulta"></label>
      <label>URL do botão<input name="link_url_${index}" maxlength="300" value="${escapeAttr(link.url || '')}" placeholder="https://..."></label>
      <label>Ícone
        <select name="link_icon_${index}">
          ${['whatsapp','instagram','site','agenda','maps','phone','email','form','video','download','star','clinic','doctor','link'].map(icon => `<option value="${icon}" ${link.icon === icon ? 'selected' : ''}>${iconLabel(icon)}</option>`).join('')}
        </select>
      </label>
      <label>Descrição curta<input name="link_description_${index}" maxlength="70" value="${escapeAttr(link.description || '')}" placeholder="Opcional"></label>
      <label class="tiny-check"><input type="checkbox" name="link_highlight_${index}" ${link.is_highlight ? 'checked' : ''}> Destaque</label>
      <button class="btn ghost small" type="button" data-remove-link>Remover</button>
    </div>
  </div>`;
}

function iconLabel(icon) {
  const labels = {
    whatsapp: 'WhatsApp', instagram: 'Instagram', site: 'Site', agenda: 'Agenda', maps: 'Localização', phone: 'Telefone',
    email: 'E-mail', form: 'Formulário', video: 'Vídeo', download: 'Download', star: 'Destaque', clinic: 'Clínica', doctor: 'Médico', link: 'Link'
  };
  return labels[icon] || icon;
}

function builderPage({ form = {}, error = '', editMode = false, editToken = '' }) {
  const data = { ...defaultBuilderData(), ...form };
  const links = Array.isArray(form.links) && form.links.length ? form.links : data.links;
  const previewBio = {
    ...data,
    avatar_url: form.avatar_preview_url || '',
    logo_url: form.logo_preview_url || ''
  };

  const body = `<main class="builder-page">
    <section class="builder-hero">
      <div class="builder-copy">
        <img class="hero-logo" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
        <span class="home-badge">LEME Bio</span>
        <h1>Crie seu link na bio em poucos minutos.</h1>
        <p>Monte sua página sem login, personalize as cores, adicione até 10 links e veja a prévia mobile em tempo real.</p>
        <ul class="hero-points">
          <li>${renderIcon('star')} Visual bonito e otimizado</li>
          <li>${renderIcon('link')} Até 10 links por página</li>
          <li>${renderIcon('doctor')} Marca LEME fixa para divulgação</li>
        </ul>
      </div>
      <div class="hero-preview-card">
        <div class="hero-preview-label">Prévia real</div>
        <div class="hero-preview-phone">${bioCardHtml(previewBio, links, { preview: true })}</div>
      </div>
    </section>

    <section class="builder-panel">
      <div class="panel-intro">
        <div>
          <h2>${editMode ? 'Edite sua página' : 'Monte sua página agora'}</h2>
          <p>Preencha os campos abaixo. A prévia ao lado acompanha suas mudanças em tempo real.</p>
        </div>
        <div class="link-limit-badge"><strong id="link-count">${links.length}</strong>/10 links</div>
      </div>
      ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}
      <form class="builder-grid" method="post" action="${editMode ? `/edit/${escapeAttr(editToken)}` : '/create'}" enctype="multipart/form-data" id="public-builder-form">
        <section class="panel builder-form-card">
          <h3>1. Informações principais</h3>
          <div class="grid-2">
            <label>Nome exibido<input name="title" required maxlength="80" value="${escapeAttr(data.title || '')}" placeholder="Seu nome ou marca"></label>
            <label>Slug da URL<input name="slug" required maxlength="80" value="${escapeAttr(data.slug || '')}" placeholder="seu-nome"></label>
          </div>
          <div class="grid-2">
            <label>Subtítulo<input name="subtitle" maxlength="80" value="${escapeAttr(data.subtitle || '')}" placeholder="Especialidade, profissão ou nicho"></label>
            <label>Descrição curta<input name="description" maxlength="180" value="${escapeAttr(data.description || '')}" placeholder="Explique rapidamente o que você faz"></label>
          </div>
          <div class="grid-2">
            <label>Instagram<input name="instagram" value="${escapeAttr(data.instagram || '')}" placeholder="@usuario ou link"></label>
            <label>WhatsApp<input name="whatsapp" value="${escapeAttr(data.whatsapp || '')}" placeholder="5511999999999 ou link"></label>
            <label>Site<input name="website" value="${escapeAttr(data.website || '')}" placeholder="https://seusite.com"></label>
            <label>Localização<input name="location" value="${escapeAttr(data.location || '')}" placeholder="Link do Google Maps"></label>
          </div>
          <div class="grid-2">
            <label>Foto ou logo principal<input type="file" name="avatar" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
            <label>Logo secundária opcional<input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label>
          </div>
          <p class="hint">As imagens são otimizadas automaticamente para carregar rápido.</p>
        </section>

        <section class="panel builder-form-card">
          <h3>2. Estilo</h3>
          <div class="grid-2">
            <label>Template
              <select name="template">
                <option value="premium" ${data.template === 'premium' ? 'selected' : ''}>Premium</option>
                <option value="clinic" ${data.template === 'clinic' ? 'selected' : ''}>Clínica</option>
                <option value="minimal" ${data.template === 'minimal' ? 'selected' : ''}>Minimalista</option>
                <option value="dark" ${data.template === 'dark' ? 'selected' : ''}>Dark elegante</option>
              </select>
            </label>
            <label>Botões
              <select name="button_style">
                <option value="glass" ${data.button_style === 'glass' ? 'selected' : ''}>Vidro</option>
                <option value="solid" ${data.button_style === 'solid' ? 'selected' : ''}>Sólido</option>
                <option value="outline" ${data.button_style === 'outline' ? 'selected' : ''}>Contorno</option>
                <option value="soft" ${data.button_style === 'soft' ? 'selected' : ''}>Suave</option>
              </select>
            </label>
          </div>
          <div class="grid-2 colors-grid">
            ${colorInput('primary_color', 'Cor principal', data.primary_color)}
            ${colorInput('secondary_color', 'Cor secundária', data.secondary_color)}
            ${colorInput('background_color', 'Fundo 1', data.background_color)}
            ${colorInput('background_color_2', 'Fundo 2', data.background_color_2)}
            ${colorInput('text_color', 'Texto', data.text_color)}
          </div>
        </section>

        <section class="panel builder-form-card">
          <div class="panel-intro inner">
            <div>
              <h3>3. Seus links</h3>
              <p>Adicione até 10 links. Você pode destacar o principal.</p>
            </div>
            <button class="btn" type="button" id="add-link-btn">Adicionar link</button>
          </div>
          <div id="builder-links-list">${links.map((link, index) => renderLinkRow(link, index)).join('')}</div>
          <template id="link-row-template">${renderLinkRow({}, '__INDEX__')}</template>
          <p class="hint">A marca LEME aparece no rodapé e não pode ser removida.</p>
        </section>

        <div class="builder-submit-row">
          <button class="btn primary large" type="submit">${editMode ? 'Salvar alterações' : 'Criar meu link na bio'}</button>
          <span class="submit-tip">Ao publicar, sua página ficará disponível imediatamente.</span>
        </div>
      </form>
    </section>

    <section class="builder-mobile-preview-section">
      <div class="panel-intro mobile-only-head"><h2>Prévia mobile</h2><p>Veja como a sua página ficará no celular.</p></div>
      <div class="mobile-preview-wrapper" id="sticky-mobile-preview">
        <div class="preview-surface" id="builder-preview" data-template="${escapeAttr(previewBio.template)}" data-button-style="${escapeAttr(previewBio.button_style)}" data-font-family="${escapeAttr(previewBio.font_family || 'inter')}" style="--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};${backgroundStyle(previewBio)}">
          ${bioCardHtml(previewBio, links, { preview: true })}
        </div>
      </div>
    </section>
  </main>`;

  return publicHtml({
    title: editMode ? 'Editar página | LEME Bio' : 'Criar link na bio | LEME Bio',
    description: 'Crie seu link na bio sem login com a plataforma da LEME Marketing Médico.',
    body,
    head: '<script defer src="/assets/builder.js"></script>'
  });
}

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value || '#000000')}"><input type="text" name="${name}_text" value="${escapeAttr(value || '#000000')}" data-color-sync="${escapeAttr(name)}"></div></label>`;
}

function successPage({ bioUrl, editUrl }) {
  const body = `<main class="public-home success-home">
    <section>
      <img class="hero-logo small" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
      <div class="home-badge">Página criada</div>
      <h1>Seu link na bio já está no ar.</h1>
      <p>Guarde os links abaixo para divulgar sua página e, se quiser, fazer alterações depois.</p>
      <div class="success-links">
        <div><span>Link público</span><a href="${escapeAttr(bioUrl)}" target="_blank" rel="noopener">${escapeHtml(bioUrl)}</a></div>
        <div><span>Link de edição</span><a href="${escapeAttr(editUrl)}" target="_blank" rel="noopener">${escapeHtml(editUrl)}</a></div>
      </div>
      <div class="success-actions">
        <a href="${escapeAttr(bioUrl)}" class="home-button" target="_blank" rel="noopener">Abrir minha página</a>
        <a href="${escapeAttr(editUrl)}" class="home-button secondary" target="_blank" rel="noopener">Editar depois</a>
      </div>
    </section>
  </main>`;
  return publicHtml({ title: 'Página criada | LEME Bio', description: 'Sua página foi criada com sucesso.', body });
}

function homePage() {
  return builderPage({});
}

function notFoundPage() {
  const body = `<main class="public-home"><section><img class="hero-logo small" src="/assets/leme-logo.png" alt="LEME Marketing Médico"><div class="home-badge">404</div><h1>Página não encontrada.</h1><p>Verifique se o link está correto.</p><a class="home-button" href="/">Criar meu link na bio</a></section></main>`;
  return publicHtml({ title: 'Página não encontrada', description: '', body });
}

module.exports = { publicBioPage, homePage, notFoundPage, builderPage, successPage };
