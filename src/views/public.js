const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, renderIcon } = require('../utils');

const modelPresets = [
  {
    key: 'ocean',
    name: 'Ocean LEME',
    hint: 'Fundo azul profundo, foto com contorno e botões em vidro.',
    template: 'ocean',
    button_style: 'glass',
    primary_color: '#1E5C89',
    secondary_color: '#5DA1D1',
    background_color: '#081321',
    background_color_2: '#123250',
    text_color: '#FFFFFF',
    icon_color: '#FFFFFF'
  },
  {
    key: 'premium',
    name: 'Premium médico',
    hint: 'Mais elegante, com destaque nos botões principais.',
    template: 'premium',
    button_style: 'shadow',
    primary_color: '#15395F',
    secondary_color: '#83C4EF',
    background_color: '#07101D',
    background_color_2: '#19395B',
    text_color: '#FFFFFF',
    icon_color: '#FFFFFF'
  },
  {
    key: 'clinic',
    name: 'Clínica clean',
    hint: 'Visual mais claro, limpo e institucional.',
    template: 'clinic',
    button_style: 'soft',
    primary_color: '#266B94',
    secondary_color: '#9FD5F4',
    background_color: '#DCECF7',
    background_color_2: '#F7FBFF',
    text_color: '#17324A',
    icon_color: '#1E5C89'
  },
  {
    key: 'minimal',
    name: 'Minimalista',
    hint: 'Poucos efeitos, leitura direta e botões limpos.',
    template: 'minimal',
    button_style: 'clean',
    primary_color: '#173C60',
    secondary_color: '#6EA9D1',
    background_color: '#0D1B2D',
    background_color_2: '#102E4B',
    text_color: '#FFFFFF',
    icon_color: '#FFFFFF'
  },
  {
    key: 'frame',
    name: 'Moldura premium',
    hint: 'Card central mais marcado e foto em destaque.',
    template: 'frame',
    button_style: 'pill',
    primary_color: '#245B82',
    secondary_color: '#C2E6FF',
    background_color: '#06101D',
    background_color_2: '#1C4568',
    text_color: '#FFFFFF',
    icon_color: '#FFFFFF'
  },
  {
    key: 'light',
    name: 'Claro premium',
    hint: 'Azul suave, aparência leve e moderna.',
    template: 'light',
    button_style: 'solid',
    primary_color: '#2B719C',
    secondary_color: '#62ADD9',
    background_color: '#EEF7FD',
    background_color_2: '#D7EBF8',
    text_color: '#17324A',
    icon_color: '#1E5C89'
  }
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
  ['schedule', 'Agendar horário'],
  ['whatsapp', 'Falar no WhatsApp'],
  ['services', 'Conheça nossos serviços'],
  ['maps', 'Ver localização no Google Maps'],
  ['reviews', 'Avaliações no Google'],
  ['site', 'Site oficial'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['facebook', 'Facebook'],
  ['phone', 'Telefone'],
  ['email', 'Email'],
  ['material', 'Baixar material gratuito']
];

const kindLabels = Object.fromEntries(buttonKinds);

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
      value: link.value || inferValueFromUrl(link.kind, link.url),
      icon: link.icon || inferIconFromKind(link.kind)
    };
  }

  const url = String(link.url || '');
  const lower = url.toLowerCase();
  if (lower.startsWith('mailto:')) return { kind: 'email', value: url.replace(/^mailto:/i, ''), icon: 'email' };
  if (lower.startsWith('tel:')) return { kind: 'phone', value: url.replace(/^tel:/i, ''), icon: 'phone' };
  if (lower.includes('wa.me/') || lower.includes('api.whatsapp.com')) return { kind: 'whatsapp', value: url.replace(/\D/g, '').replace(/^55/, ''), icon: 'whatsapp' };
  if (lower.includes('instagram.com/')) return { kind: 'instagram', value: url.split('instagram.com/')[1]?.split(/[/?#]/)[0] || '', icon: 'instagram' };
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { kind: 'youtube', value: url, icon: 'video' };
  if (lower.includes('facebook.com')) return { kind: 'facebook', value: url, icon: 'site' };
  if (lower.includes('google.com/maps') || lower.includes('maps.app.goo.gl')) return { kind: 'maps', value: url, icon: 'maps' };
  return { kind: 'site', value: url, icon: link.icon || 'site' };
}

function inferValueFromUrl(kind, url = '') {
  const raw = String(url || '');
  if (kind === 'email') return raw.replace(/^mailto:/i, '');
  if (kind === 'phone') return raw.replace(/^tel:/i, '').replace(/^\+?55/, '');
  if (kind === 'whatsapp') { const digits = raw.replace(/\D/g, ''); return digits.startsWith('55') ? `55|${digits.slice(2)}` : `55|${digits}`; }
  if (kind === 'instagram') return raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0];
  return raw;
}

function inferIconFromKind(kind) {
  const map = {
    schedule: 'agenda', whatsapp: 'whatsapp', services: 'clinic', maps: 'maps', reviews: 'star', site: 'site',
    instagram: 'instagram', youtube: 'video', facebook: 'site', phone: 'phone', email: 'email', material: 'download'
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

  const editableText = opts.editable ? 'contenteditable="true" spellcheck="false"' : '';

  return `<section class="bio-phone ${opts.preview ? 'is-preview' : ''} ${opts.editable ? 'editable-bio-phone' : ''}">
      <div class="editable-block avatar-edit-block" data-edit-section-area="avatar">
        <div class="avatar-wrap">${avatar}</div>
        ${opts.editable ? editBubble('avatar', 'Trocar foto') : ''}
      </div>
      <div class="editable-block text-edit-block" data-edit-section-area="title">
        <h1 data-inline-field="title" ${editableText}>${escapeHtml(bio.title || 'Seu nome ou marca')}</h1>
        ${opts.editable ? editBubble('title', 'Editar nome') : ''}
      </div>
      <div class="editable-block text-edit-block slim" data-edit-section-area="subtitle">
        <p class="subtitle" data-inline-field="subtitle" ${editableText}>${escapeHtml(bio.subtitle || 'Seu subtítulo aparece aqui')}</p>
        ${opts.editable ? editBubble('subtitle', 'Editar subtítulo') : ''}
      </div>
      <div class="editable-block text-edit-block slim" data-edit-section-area="description">
        <p class="description" data-inline-field="description" ${editableText}>${escapeHtml(bio.description || 'Uma descrição curta para apresentar seu trabalho, serviço ou marca.')}</p>
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
  const styleVars = `--primary:${escapeAttr(bio.primary_color)};--secondary:${escapeAttr(bio.secondary_color)};--text:${escapeAttr(bio.text_color || '#FFFFFF')};--icon:${escapeAttr(bio.icon_color || bio.text_color || '#FFFFFF')};`;

  const body = `<main class="public-shell ${fontClass(bio.font_family)} template-${escapeAttr(bio.template)} buttons-${escapeAttr(bio.button_style)}" style="${styleVars}${backgroundStyle(bio)}">
    <div class="ambient one"></div>
    <div class="ambient two"></div>
    ${bioCardHtml(bio, links)}
  </main>`;

  return publicHtml({ title, description, body });
}

function defaultBuilderData() {
  return {
    title: '', slug: '', subtitle: '', description: '',
    template: 'ocean', button_style: 'glass',
    primary_color: '#1E5C89', secondary_color: '#5DA1D1', background_type: 'gradient',
    background_color: '#081321', background_color_2: '#123250', text_color: '#FFFFFF', icon_color: '#FFFFFF',
    links: [
      { label: 'Falar no WhatsApp', kind: 'whatsapp', value: '', url: '', icon: 'whatsapp', description: '', is_highlight: true },
      { label: 'Instagram', kind: 'instagram', value: '', url: '', icon: 'instagram', description: '', is_highlight: false }
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
  </div>`;
}

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value || '#000000')}"><input type="text" name="${name}_text" value="${escapeAttr(value || '#000000')}" data-color-sync="${escapeAttr(name)}"></div></label>`;
}

function buttonKindOptions() {
  return buttonKinds.map(([key, label]) => `<option value="${escapeAttr(key)}">${escapeHtml(label)}</option>`).join('');
}

function buttonStyleRadios(selected) {
  return buttonStyleOptions.map(([key, label]) => `<label class="style-pill"><input type="radio" name="button_style" value="${escapeAttr(key)}" ${selected === key ? 'checked' : ''}><span>${escapeHtml(label)}</span></label>`).join('');
}

function modelCards() {
  return modelPresets.map(model => `<button type="button" class="model-preview-card" data-model-preset="${escapeAttr(model.key)}">
    <span class="mini-phone model-${escapeAttr(model.key)} template-${escapeAttr(model.template)} buttons-${escapeAttr(model.button_style)}"
      style="--primary:${escapeAttr(model.primary_color)};--secondary:${escapeAttr(model.secondary_color)};--text:${escapeAttr(model.text_color || '#FFFFFF')};--icon:${escapeAttr(model.icon_color || model.text_color || '#FFFFFF')};background:linear-gradient(145deg, ${escapeAttr(model.background_color)}, ${escapeAttr(model.background_color_2)});">
      <span class="mini-bg-card"></span>
      <span class="mini-avatar"></span>
      <span class="mini-line big"></span>
      <span class="mini-line"></span>
      <span class="mini-button one"></span>
      <span class="mini-button two"></span>
      <span class="mini-button three"></span>
    </span>
    <strong>${escapeHtml(model.name)}</strong>
    <small>${escapeHtml(model.hint)}</small>
  </button>`).join('');
}

function builderPage({ form = {}, error = '', editMode = false, editToken = '' }) {
  const data = { ...defaultBuilderData(), ...form };
  const links = Array.isArray(form.links) && form.links.length ? form.links : data.links;
  const previewBio = { ...data, avatar_url: form.avatar_preview_url || '' };
  const helpMessage = encodeURIComponent('Gostaria de ajuda para criar meu link da bio');
  const styleVars = `--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color || '#FFFFFF')};--icon:${escapeAttr(previewBio.icon_color || previewBio.text_color || '#FFFFFF')};`;
  const selectedModel = modelPresets.find(model => model.template === data.template && model.button_style === data.button_style) || modelPresets.find(model => model.template === data.template) || modelPresets[0];

  const body = `<main class="builder-page visual-editor-page">
    <section class="builder-shell">
      <form class="builder-form-visual" method="post" action="${editMode ? `/edit/${escapeAttr(editToken)}` : '/create'}" enctype="multipart/form-data" id="public-builder-form">
        <input type="file" name="avatar" id="avatar-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
        <input type="hidden" name="title" value="${escapeAttr(data.title || '')}">
        <input type="hidden" name="subtitle" value="${escapeAttr(data.subtitle || '')}">
        <input type="hidden" name="description" value="${escapeAttr(data.description || '')}">
        <input type="hidden" name="template" value="${escapeAttr(data.template || 'ocean')}">

        <div class="builder-left-column">
          <div class="builder-header-clean">
            <img class="builder-brand-white" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
            <div>
              <span class="home-badge">LEME Bio</span>
              <h1>Personalize sua página</h1>
              <p>Clique nos textos do mockup para editar. Use a esquerda apenas para escolher modelo, botões e cores.</p>
            </div>
          </div>

          ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}

          <div class="control-grid-two">
            <section class="panel builder-form-card compact-card model-summary-card">
              <div class="section-head single"><div><h2>Modelo</h2><p>Escolha uma página pronta e depois ajuste as cores.</p></div></div>
              <button type="button" class="chosen-model-button" id="open-models-modal">
                <span class="chosen-model-mini"></span>
                <span><strong id="chosen-model-name">${escapeHtml(selectedModel.name)}</strong><small>Ver modelos prontos</small></span>
              </button>
            </section>

            <section class="panel builder-form-card compact-card">
              <div class="section-head single"><div><h2>Estilo dos botões</h2><p>Troque rapidamente o formato dos botões.</p></div></div>
              <div class="button-style-grid">${buttonStyleRadios(data.button_style)}</div>
            </section>
          </div>

          <section class="panel builder-form-card compact-card">
            <div class="section-head single"><div><h2>Cores</h2><p>Use um preset ou ajuste manualmente.</p></div></div>
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
              ${colorInput('text_color', 'Cor do texto', data.text_color || '#FFFFFF')}
              ${colorInput('icon_color', 'Cor dos ícones', data.icon_color || data.text_color || '#FFFFFF')}
            </div>
          </section>

          <section class="panel builder-form-card compact-card">
            <div class="section-head single"><div><h2>Endereço</h2><p>Esse será o final do seu link.</p></div></div>
            <label>Endereço da página<input name="slug" required maxlength="80" value="${escapeAttr(data.slug || '')}" placeholder="seu-nome"></label>
          </section>

          <section class="panel builder-form-card compact-card help-card">
            <div class="section-head single stack-on-mobile">
              <div><h2>Precisa de ajuda?</h2><p>A equipe da LEME pode montar seu link da bio para você.</p></div>
              <a class="btn primary" href="https://wa.me/553491003193?text=${helpMessage}" target="_blank" rel="noopener">Falar com a LEME</a>
            </div>
          </section>

          <div class="builder-submit-row wide"><button class="btn primary large" type="submit">${editMode ? 'Salvar alterações' : 'Criar meu link na bio'}</button></div>
        </div>

        <div class="builder-right-column">
          <div class="preview-floating-shell">
            <div class="preview-floating-head"><span class="home-badge">Editor visual</span><p>Mockup em 9:16. Clique no nome, subtítulo ou descrição para editar direto.</p></div>
            <div class="phone-mockup floating-mockup">
              <div class="phone-screen preview-surface template-${escapeAttr(previewBio.template)} buttons-${escapeAttr(previewBio.button_style)} ${fontClass(previewBio.font_family)}" id="builder-preview" style="${styleVars}${backgroundStyle(previewBio)}">
                ${bioCardHtml(previewBio, links, { preview: true, editable: true })}
              </div>
            </div>
            <div id="builder-links-hidden">${links.map((link, index) => renderHiddenLink(link, index)).join('')}</div>
          </div>
        </div>

        <div class="builder-modal-backdrop" id="models-modal-backdrop" hidden>
          <div class="builder-modal models-modal" role="dialog" aria-modal="true" aria-labelledby="models-modal-title">
            <div class="builder-modal-head"><h3 id="models-modal-title">Escolha um modelo pronto</h3><button type="button" class="modal-close" id="close-models-modal">×</button></div>
            <div class="models-grid">${modelCards()}</div>
          </div>
        </div>

        <div class="builder-modal-backdrop" id="link-modal-backdrop" hidden>
          <div class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="link-modal-title">
            <div class="builder-modal-head"><h3 id="link-modal-title">Configurar botão</h3><button type="button" class="modal-close" id="close-link-modal">×</button></div>
            <div class="builder-modal-body">
              <label>Tipo do botão<select id="modal-link-kind">${buttonKindOptions()}</select></label>
              <label>Texto do botão<input type="text" id="modal-link-label" maxlength="50" placeholder="Ex.: Agendar horário"></label>
              <div id="modal-link-value-wrap" class="modal-dynamic-field">
                <label class="modal-main-value"><span>Link personalizado</span><input type="text" id="modal-link-value" maxlength="300" placeholder="https://..."></label>
                <div class="whatsapp-split-fields" id="whatsapp-split-fields" hidden>
                  <label>Código do país
                    <select id="modal-country-code">
                      <option value="55" selected>+55 Brasil</option>
                      <option value="1">+1 EUA/Canadá</option>
                      <option value="351">+351 Portugal</option>
                      <option value="44">+44 Reino Unido</option>
                      <option value="34">+34 Espanha</option>
                      <option value="54">+54 Argentina</option>
                      <option value="56">+56 Chile</option>
                      <option value="57">+57 Colômbia</option>
                      <option value="52">+52 México</option>
                    </select>
                  </label>
                  <label>Número com DDD<input type="text" id="modal-phone-number" maxlength="30" placeholder="3491003193"></label>
                </div>
              </div>
              <label>Descrição curta<input type="text" id="modal-link-description" maxlength="70" placeholder="Opcional"></label>
              <label class="modal-checkbox"><input type="checkbox" id="modal-link-highlight"> Deixar esse botão em destaque</label>
            </div>
            <div class="builder-modal-actions">
              <button type="button" class="btn ghost" id="delete-link-btn">Excluir botão</button>
              <div class="builder-modal-actions-right"><button type="button" class="btn" id="cancel-link-btn">Cancelar</button><button type="button" class="btn primary" id="save-link-btn">Salvar botão</button></div>
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
      <div class="success-actions"><a href="${escapeAttr(bioUrl)}" class="home-button" target="_blank" rel="noopener">Abrir minha página</a><a href="${escapeAttr(editUrl)}" class="home-button secondary" target="_blank" rel="noopener">Editar depois</a></div>
    </section>
  </main>`;
  return publicHtml({ title: 'Página criada | LEME Bio', description: 'Sua página foi criada com sucesso.', body });
}

function homePage() { return builderPage({}); }

function notFoundPage() {
  const body = `<main class="public-home"><section><img class="hero-logo small" src="/assets/leme-logo.png" alt="LEME Marketing Médico"><div class="home-badge">404</div><h1>Página não encontrada.</h1><p>Verifique se o link está correto.</p><a class="home-button" href="/">Criar meu link na bio</a></section></main>`;
  return publicHtml({ title: 'Página não encontrada', description: '', body });
}

module.exports = { publicBioPage, homePage, notFoundPage, builderPage, successPage };
