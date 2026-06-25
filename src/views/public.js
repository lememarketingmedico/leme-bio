const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, renderIcon } = require('../utils');

const templateOptions = [
  ['ocean', 'Ocean LEME'],
  ['premium', 'Premium azul'],
  ['clinic', 'Clínica clean'],
  ['minimal', 'Minimalista'],
  ['dark', 'Dark elegante'],
  ['light', 'Claro premium'],
  ['editorial', 'Editorial'],
  ['soft', 'Soft glass']
];

const buttonStyleOptions = [
  ['glass', 'Vidro'],
  ['solid', 'Sólido'],
  ['outline', 'Contorno'],
  ['soft', 'Suave'],
  ['pill', 'Pílula'],
  ['clean', 'Clean'],
  ['shadow', 'Com sombra'],
  ['glow', 'Glow']
];

const buttonKinds = [
  ['whatsapp', 'WhatsApp'],
  ['phone', 'Telefone'],
  ['email', 'E-mail'],
  ['instagram', 'Instagram'],
  ['site', 'Site ou link externo'],
  ['maps', 'Localização / Maps'],
  ['google_review', 'Avaliação no Google'],
  ['form', 'Formulário'],
  ['video', 'Vídeo'],
  ['download', 'Arquivo / download']
];

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

function editBubble(section, label = 'Editar') {
  return `<button class="edit-bubble" type="button" data-edit-section="${escapeAttr(section)}" aria-label="${escapeAttr(label)}">${renderIcon('edit')}</button>`;
}

function inferLinkConfig(link = {}) {
  if (link.kind) {
    return {
      kind: link.kind,
      value: link.value || '',
      place_id: link.place_id || '',
      icon: link.icon || inferIconFromKind(link.kind)
    };
  }

  const url = String(link.url || '');
  const lower = url.toLowerCase();
  if (lower.startsWith('mailto:')) {
    return { kind: 'email', value: url.replace(/^mailto:/i, ''), place_id: '', icon: 'email' };
  }
  if (lower.startsWith('tel:')) {
    return { kind: 'phone', value: url.replace(/^tel:/i, ''), place_id: '', icon: 'phone' };
  }
  if (lower.includes('wa.me/') || lower.includes('api.whatsapp.com')) {
    const digits = url.replace(/\D/g, '');
    return { kind: 'whatsapp', value: digits, place_id: '', icon: 'whatsapp' };
  }
  if (lower.includes('instagram.com/')) {
    const username = url.split('instagram.com/')[1]?.split(/[/?#]/)[0] || '';
    return { kind: 'instagram', value: username, place_id: '', icon: 'instagram' };
  }
  if (lower.includes('search.google.com/local/writereview')) {
    const match = url.match(/[?&]placeid=([^&]+)/i);
    return { kind: 'google_review', value: link.label || '', place_id: match ? decodeURIComponent(match[1]) : '', icon: 'star' };
  }
  if (lower.includes('google.com/maps') || lower.includes('maps.app.goo.gl')) {
    return { kind: 'maps', value: url, place_id: '', icon: 'maps' };
  }
  return { kind: 'site', value: url, place_id: '', icon: link.icon || 'site' };
}

function inferIconFromKind(kind) {
  const map = {
    whatsapp: 'whatsapp',
    phone: 'phone',
    email: 'email',
    instagram: 'instagram',
    site: 'site',
    maps: 'maps',
    google_review: 'star',
    form: 'form',
    video: 'video',
    download: 'download'
  };
  return map[kind] || 'link';
}

function bioCardHtml(bio, links, opts = {}) {
  const linkHtml = links.map((rawLink, index) => {
    const link = { ...rawLink, ...inferLinkConfig(rawLink) };
    const href = opts.preview ? '#' : `/go/${link.id}`;
    const editButton = opts.editable ? `<button class="edit-bubble link-edit-bubble" type="button" data-edit-link-index="${index}" aria-label="Editar botão">${renderIcon('edit')}</button>` : '';
    return `<div class="public-link-wrap ${opts.editable ? 'editable-public-link' : ''}">
      <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="${href}" ${opts.preview ? 'onclick="return false"' : 'target="_blank" rel="noopener"'}>
        <span class="link-icon">${renderIcon(link.icon)}</span>
        <span class="link-copy"><strong>${escapeHtml(link.label)}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
        <span class="arrow">${renderIcon('link')}</span>
      </a>
      ${editButton}
    </div>`;
  }).join('');

  const addButton = opts.editable
    ? `<button class="add-link-dashed" type="button" data-add-link>${renderIcon('plus')}<span>Adicionar novo botão</span></button>`
    : '';

  const avatar = bio.avatar_url
    ? `<img class="avatar" src="${escapeAttr(bio.avatar_url)}" alt="${escapeAttr(bio.title)}">`
    : `<div class="avatar fallback">${escapeHtml((bio.title || 'L').charAt(0))}</div>`;

  return `<section class="bio-phone ${opts.preview ? 'is-preview' : ''} ${opts.editable ? 'editable-bio-phone' : ''}">
      ${bio.logo_url ? `<img class="client-logo" src="${escapeAttr(bio.logo_url)}" alt="Logo ${escapeAttr(bio.title)}">` : ''}
      <div class="editable-block avatar-edit-block" data-edit-section-area="avatar">
        <div class="avatar-wrap">${avatar}</div>
        ${opts.editable ? editBubble('avatar', 'Trocar foto') : ''}
      </div>
      <div class="editable-block text-edit-block" data-edit-section-area="title">
        <h1>${escapeHtml(bio.title || 'Seu nome ou marca')}</h1>
        ${opts.editable ? editBubble('title', 'Editar nome') : ''}
      </div>
      <div class="editable-block text-edit-block slim" data-edit-section-area="subtitle">
        ${bio.subtitle ? `<p class="subtitle">${escapeHtml(bio.subtitle)}</p>` : '<p class="subtitle">Seu subtítulo aparece aqui</p>'}
        ${opts.editable ? editBubble('subtitle', 'Editar subtítulo') : ''}
      </div>
      <div class="editable-block text-edit-block slim" data-edit-section-area="description">
        ${bio.description ? `<p class="description">${escapeHtml(bio.description)}</p>` : '<p class="description">Uma descrição curta para apresentar seu trabalho, serviço ou marca.</p>'}
        ${opts.editable ? editBubble('description', 'Editar descrição') : ''}
      </div>
      ${quickLinksHtml(bio)}
      <div class="links-stack">${linkHtml || '<p class="empty-public">Adicione até 10 botões e veja o resultado em tempo real.</p>'}${addButton}</div>
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
    template: 'ocean',
    button_style: 'glass',
    primary_color: '#1E5C89',
    secondary_color: '#5DA1D1',
    background_type: 'gradient',
    background_color: '#081321',
    background_color_2: '#123250',
    text_color: '#FFFFFF',
    links: [
      { label: 'Meu WhatsApp', kind: 'whatsapp', value: '', place_id: '', url: '', icon: 'whatsapp', description: '', is_highlight: true },
      { label: 'Meu Instagram', kind: 'instagram', value: '', place_id: '', url: '', icon: 'instagram', description: '', is_highlight: false }
    ]
  };
}

function renderHiddenLink(rawLink = {}, index = 0) {
  const link = { ...rawLink, ...inferLinkConfig(rawLink) };
  return `<div class="builder-hidden-link" data-link-card data-index="${index}">
    <input type="hidden" name="link_label_${index}" value="${escapeAttr(link.label || '')}" data-field="label">
    <input type="hidden" name="link_url_${index}" value="${escapeAttr(link.url || '')}" data-field="url">
    <input type="hidden" name="link_icon_${index}" value="${escapeAttr(link.icon || 'link')}" data-field="icon">
    <input type="hidden" name="link_description_${index}" value="${escapeAttr(link.description || '')}" data-field="description">
    <input type="hidden" name="link_highlight_${index}" value="${link.is_highlight ? 'on' : ''}" data-field="highlight">
    <input type="hidden" name="link_kind_${index}" value="${escapeAttr(link.kind || 'site')}" data-field="kind">
    <input type="hidden" name="link_value_${index}" value="${escapeAttr(link.value || '')}" data-field="value">
    <input type="hidden" name="link_place_id_${index}" value="${escapeAttr(link.place_id || '')}" data-field="place_id">
  </div>`;
}

function selectOptions(options, selected) {
  return options.map(([key, label]) => `<option value="${escapeAttr(key)}" ${selected === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
}

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value || '#000000')}"><input type="text" name="${name}_text" value="${escapeAttr(value || '#000000')}" data-color-sync="${escapeAttr(name)}"></div></label>`;
}

function buttonKindOptions() {
  return buttonKinds.map(([key, label]) => `<option value="${escapeAttr(key)}">${escapeHtml(label)}</option>`).join('');
}

function builderPage({ form = {}, error = '', editMode = false, editToken = '' }) {
  const data = { ...defaultBuilderData(), ...form };
  const links = Array.isArray(form.links) && form.links.length ? form.links : data.links;
  const previewBio = {
    ...data,
    avatar_url: form.avatar_preview_url || '',
    logo_url: form.logo_preview_url || ''
  };
  const helpMessage = encodeURIComponent('Gostaria de ajuda para criar meu link da bio');
  const styleVars = `--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};`;

  const body = `<main class="builder-page visual-editor-page">
    <section class="builder-shell">
      <form class="builder-form-visual" method="post" action="${editMode ? `/edit/${escapeAttr(editToken)}` : '/create'}" enctype="multipart/form-data" id="public-builder-form">
        <input type="file" name="avatar" id="avatar-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
        <input type="file" name="logo" id="logo-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
        <input type="hidden" name="title" value="${escapeAttr(data.title || '')}">
        <input type="hidden" name="subtitle" value="${escapeAttr(data.subtitle || '')}">
        <input type="hidden" name="description" value="${escapeAttr(data.description || '')}">

        <div class="builder-left-column">
          <div class="builder-header-clean">
            <img class="builder-brand-white" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
            <div>
              <span class="home-badge">LEME Bio</span>
              <h1>Personalize sua página</h1>
              <p>Edite foto, textos e botões direto no mockup. Na esquerda você ajusta só o visual.</p>
            </div>
          </div>

          ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}

          <div class="control-grid-two">
            <section class="panel builder-form-card compact-card">
              <div class="section-head single"><div><h2>Modelos</h2><p>Escolha o estilo base da página.</p></div></div>
              <label>Modelo da página<select name="template">${selectOptions(templateOptions, data.template)}</select></label>
            </section>

            <section class="panel builder-form-card compact-card">
              <div class="section-head single"><div><h2>Botões</h2><p>Defina o estilo visual dos botões.</p></div></div>
              <label>Estilo dos botões<select name="button_style">${selectOptions(buttonStyleOptions, data.button_style)}</select></label>
            </section>
          </div>

          <section class="panel builder-form-card compact-card">
            <div class="section-head single"><div><h2>Cores</h2><p>Escolha um preset rápido ou ajuste manualmente.</p></div></div>
            <div class="preset-palette-grid">
              <button type="button" class="preset-chip" data-preset="leme">Azul LEME</button>
              <button type="button" class="preset-chip" data-preset="premium">Premium</button>
              <button type="button" class="preset-chip" data-preset="light">Claro</button>
              <button type="button" class="preset-chip" data-preset="dark">Dark</button>
            </div>
            <div class="grid-2 colors-grid spaced-top">
              ${colorInput('primary_color', 'Cor principal', data.primary_color)}
              ${colorInput('secondary_color', 'Cor de apoio', data.secondary_color)}
              ${colorInput('background_color', 'Fundo 1', data.background_color)}
              ${colorInput('background_color_2', 'Fundo 2', data.background_color_2)}
            </div>
          </section>

          <section class="panel builder-form-card compact-card">
            <div class="section-head single"><div><h2>Opções extras</h2><p>Logo opcional e endereço final da página.</p></div></div>
            <div class="grid-2">
              <label>Endereço da página<input name="slug" required maxlength="80" value="${escapeAttr(data.slug || '')}" placeholder="seu-nome"></label>
              <label>Logo opcional da marca<button type="button" class="fake-file-btn" id="logo-select-button">Selecionar logo</button></label>
            </div>
            <p class="hint">As imagens são otimizadas automaticamente para carregar mais rápido.</p>
          </section>

          <section class="panel builder-form-card compact-card help-card">
            <div class="section-head single stack-on-mobile">
              <div>
                <h2>Precisa de ajuda?</h2>
                <p>Se preferir, a equipe da LEME pode montar seu link da bio para você.</p>
              </div>
              <a class="btn primary" href="https://wa.me/553491003193?text=${helpMessage}" target="_blank" rel="noopener">Falar com a LEME</a>
            </div>
          </section>

          <div class="builder-submit-row wide">
            <button class="btn primary large" type="submit">${editMode ? 'Salvar alterações' : 'Criar meu link na bio'}</button>
          </div>
        </div>

        <div class="builder-right-column">
          <div class="preview-floating-shell">
            <div class="preview-floating-head">
              <span class="home-badge">Editor visual</span>
              <p>Clique nos ícones discretos para editar. Os textos abrem um editor translúcido e os botões usam pop-up.</p>
            </div>
            <div class="phone-mockup floating-mockup">
              <div class="phone-notch"></div>
              <div class="phone-screen preview-surface template-${escapeAttr(previewBio.template)} buttons-${escapeAttr(previewBio.button_style)} ${fontClass(previewBio.font_family)}" id="builder-preview" style="${styleVars}${backgroundStyle(previewBio)}">
                ${bioCardHtml(previewBio, links, { preview: true, editable: true })}
                <div class="inline-editor-panel" id="inline-text-editor" hidden>
                  <div class="inline-editor-head">
                    <strong id="inline-editor-title">Editar texto</strong>
                    <button type="button" class="modal-close tiny" id="close-inline-editor">×</button>
                  </div>
                  <div class="inline-editor-body">
                    <input type="text" id="inline-editor-input" maxlength="180">
                    <small id="inline-editor-help">As alterações aparecem em tempo real.</small>
                  </div>
                </div>
              </div>
            </div>
            <div id="builder-links-hidden">${links.map((link, index) => renderHiddenLink(link, index)).join('')}</div>
          </div>
        </div>

        <div class="builder-modal-backdrop" id="link-modal-backdrop" hidden>
          <div class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="link-modal-title">
            <div class="builder-modal-head">
              <h3 id="link-modal-title">Configurar botão</h3>
              <button type="button" class="modal-close" id="close-link-modal">×</button>
            </div>
            <div class="builder-modal-body">
              <label>Texto do botão<input type="text" id="modal-link-label" maxlength="50" placeholder="Agende sua consulta"></label>
              <label>Tipo do botão<select id="modal-link-kind">${buttonKindOptions()}</select></label>
              <label id="modal-link-value-wrap"><span>Valor do botão</span><input type="text" id="modal-link-value" maxlength="300" placeholder="Digite aqui"></label>
              <div id="google-business-search-block" class="google-search-block" hidden>
                <button type="button" class="btn small" id="google-business-search-btn">Buscar perfil no Google</button>
                <div class="google-search-results" id="google-business-results"></div>
              </div>
              <label>Descrição curta<input type="text" id="modal-link-description" maxlength="70" placeholder="Opcional"></label>
              <label class="modal-checkbox"><input type="checkbox" id="modal-link-highlight"> Deixar esse botão em destaque</label>
            </div>
            <div class="builder-modal-actions">
              <button type="button" class="btn ghost" id="delete-link-btn">Excluir botão</button>
              <div class="builder-modal-actions-right">
                <button type="button" class="btn" id="cancel-link-btn">Cancelar</button>
                <button type="button" class="btn primary" id="save-link-btn">Salvar botão</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  </main>`;

  return publicHtml({
    title: editMode ? 'Editar página | LEME Bio' : 'Criar link na bio | LEME Bio',
    description: 'Crie seu link na bio sem login com a plataforma da LEME Marketing Médico.',
    body,
    head: '<script defer src="/assets/builder.js"></script>'
  });
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
