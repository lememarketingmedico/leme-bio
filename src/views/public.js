const { publicHtml } = require('./layout');
const { escapeHtml, escapeAttr, renderIcon } = require('../utils');

const templateOptions = [
  ['premium', 'Premium azul'],
  ['clinic', 'Clínica clean'],
  ['minimal', 'Minimalista'],
  ['dark', 'Dark elegante'],
  ['ocean', 'Ocean LEME'],
  ['light', 'Claro premium'],
  ['editorial', 'Editorial']
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

function bioCardHtml(bio, links, opts = {}) {
  const linkHtml = links.map((link, index) => {
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
      { label: 'Meu WhatsApp', url: '', icon: 'whatsapp', description: '', is_highlight: true },
      { label: 'Meu Instagram', url: '', icon: 'instagram', description: '', is_highlight: false }
    ]
  };
}

function renderHiddenLink(link = {}, index = 0) {
  return `<div class="builder-hidden-link" data-link-card data-index="${index}">
    <input type="hidden" name="link_label_${index}" value="${escapeAttr(link.label || '')}" data-field="label">
    <input type="hidden" name="link_url_${index}" value="${escapeAttr(link.url || '')}" data-field="url">
    <input type="hidden" name="link_icon_${index}" value="${escapeAttr(link.icon || 'link')}" data-field="icon">
    <input type="hidden" name="link_description_${index}" value="${escapeAttr(link.description || '')}" data-field="description">
    <input type="hidden" name="link_highlight_${index}" value="${link.is_highlight ? 'on' : ''}" data-field="highlight">
  </div>`;
}

function selectOptions(options, selected) {
  return options.map(([key, label]) => `<option value="${escapeAttr(key)}" ${selected === key ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('');
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

  const body = `<main class="builder-page visual-editor-page">
    <section class="builder-workspace visual-editor-workspace">
      <form class="builder-form-visual" method="post" action="${editMode ? `/edit/${escapeAttr(editToken)}` : '/create'}" enctype="multipart/form-data" id="public-builder-form">
        <aside class="builder-column builder-visual-column">
          <div class="builder-editor-scroll">
            <div class="builder-topbar compact-topbar">
              <img class="hero-logo compact" src="/assets/leme-logo.png" alt="LEME Marketing Médico">
              <div class="builder-topbar-copy">
                <span class="home-badge">LEME Bio</span>
                <h1>Personalize o visual</h1>
                <p>Edite os textos, foto e botões direto no celular ao lado. Aqui você muda apenas o estilo da página.</p>
              </div>
            </div>

            ${error ? `<div class="alert danger">${escapeHtml(error)}</div>` : ''}

            <section class="panel builder-form-card compact-card">
              <div class="section-head single">
                <div>
                  <h2>Modelos</h2>
                  <p>Escolha a base visual da página.</p>
                </div>
              </div>
              <label>Modelo da página
                <select name="template">${selectOptions(templateOptions, data.template)}</select>
              </label>
            </section>

            <section class="panel builder-form-card compact-card">
              <div class="section-head single">
                <div>
                  <h2>Botões</h2>
                  <p>Defina o estilo dos botões do link na bio.</p>
                </div>
              </div>
              <label>Estilo dos botões
                <select name="button_style">${selectOptions(buttonStyleOptions, data.button_style)}</select>
              </label>
            </section>

            <section class="panel builder-form-card compact-card">
              <div class="section-head single">
                <div>
                  <h2>Cores</h2>
                  <p>Use os tons da LEME ou ajuste conforme a marca.</p>
                </div>
              </div>
              <div class="preset-grid">
                <button type="button" class="preset-chip" data-preset="#1E5C89,#5DA1D1,#081321,#123250">Azul LEME</button>
                <button type="button" class="preset-chip" data-preset="#0F3559,#76B9E7,#06101D,#1B4163">Premium</button>
                <button type="button" class="preset-chip" data-preset="#183C5D,#9BC9E8,#EFF6FB,#DCECF7">Claro</button>
                <button type="button" class="preset-chip" data-preset="#111827,#6AA8D6,#070B14,#111827">Dark</button>
              </div>
              <div class="grid-2 colors-grid simplified-colors">
                ${colorInput('primary_color', 'Principal', data.primary_color)}
                ${colorInput('secondary_color', 'Apoio', data.secondary_color)}
                ${colorInput('background_color', 'Fundo 1', data.background_color)}
                ${colorInput('background_color_2', 'Fundo 2', data.background_color_2)}
              </div>
            </section>

            <section class="panel builder-form-card compact-card help-card">
              <div class="section-head single">
                <div>
                  <h2>Quer que a LEME faça?</h2>
                  <p>Se preferir, nós montamos gratuitamente para você.</p>
                </div>
              </div>
              <a class="btn help-whatsapp" href="https://wa.me/553491003193?text=${helpMessage}" target="_blank" rel="noopener">Pedir ajuda no WhatsApp</a>
            </section>

            <div class="builder-submit-row wide">
              <button class="btn primary large" type="submit">${editMode ? 'Salvar alterações' : 'Criar meu link na bio'}</button>
            </div>
          </div>
        </aside>

        <section class="builder-column builder-preview-column visual-preview-column">
          <div class="preview-sticky-shell">
            <div class="preview-side-header">
              <span class="home-badge">Editor visual</span>
              <p>Clique nos círculos com lápis para editar foto, textos e botões.</p>
            </div>
            <div class="phone-mockup visual-phone-mockup">
              <div class="phone-notch"></div>
              <div class="phone-screen preview-surface" id="builder-preview" style="--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};${backgroundStyle(previewBio)}">
                ${bioCardHtml(previewBio, links, { preview: true, editable: true })}
              </div>
            </div>
          </div>
        </section>

        <section class="builder-mobile-preview-section">
          <div class="section-head single mobile-head-preview">
            <div>
              <h2>Editor visual</h2>
              <p>Clique no mockup para editar.</p>
            </div>
          </div>
          <div class="phone-mockup phone-mockup-mobile visual-phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-screen preview-surface" id="builder-preview-mobile" style="--primary:${escapeAttr(previewBio.primary_color)};--secondary:${escapeAttr(previewBio.secondary_color)};--text:${escapeAttr(previewBio.text_color)};${backgroundStyle(previewBio)}">
              ${bioCardHtml(previewBio, links, { preview: true, editable: true })}
            </div>
          </div>
        </section>

        <div class="builder-hidden-fields" aria-hidden="true">
          <input type="hidden" name="title" value="${escapeAttr(data.title || '')}">
          <input type="hidden" name="slug" value="${escapeAttr(data.slug || '')}">
          <input type="hidden" name="subtitle" value="${escapeAttr(data.subtitle || '')}">
          <input type="hidden" name="description" value="${escapeAttr(data.description || '')}">
          <input type="hidden" name="text_color" value="#FFFFFF">
          <input type="hidden" name="text_color_text" value="#FFFFFF">
          <input type="file" name="avatar" id="avatar-file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
          <input type="file" name="logo" id="logo-file-input" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden>
          <div id="builder-links-list">${links.map((link, index) => renderHiddenLink(link, index)).join('')}</div>
          <template id="link-row-template">${renderHiddenLink({}, '__INDEX__')}</template>
        </div>

        ${sectionModal()}
        ${linkModal()}
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

function colorInput(name, label, value) {
  return `<label>${escapeHtml(label)}<div class="color-row"><input type="color" name="${name}" value="${escapeAttr(value || '#000000')}"><input type="text" name="${name}_text" value="${escapeAttr(value || '#000000')}" data-color-sync="${escapeAttr(name)}"></div></label>`;
}

function iconLabel(icon) {
  const labels = {
    whatsapp: 'WhatsApp', instagram: 'Instagram', site: 'Site', agenda: 'Agenda', maps: 'Localização', phone: 'Telefone',
    email: 'E-mail', form: 'Formulário', video: 'Vídeo', download: 'Download', star: 'Destaque', clinic: 'Clínica', doctor: 'Médico', link: 'Link'
  };
  return labels[icon] || icon;
}

function sectionModal() {
  return `<div class="builder-modal-backdrop" id="section-modal-backdrop" hidden>
    <div class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="section-modal-title">
      <div class="builder-modal-head">
        <h3 id="section-modal-title">Editar seção</h3>
        <button type="button" class="modal-close" id="close-section-modal">×</button>
      </div>
      <div class="builder-modal-body">
        <label id="section-single-field">Texto<input type="text" id="section-input" maxlength="180"></label>
        <label id="section-textarea-field" hidden>Texto<textarea id="section-textarea" rows="5" maxlength="220"></textarea></label>
      </div>
      <div class="builder-modal-actions">
        <span class="submit-tip">A alteração aparece na prévia em tempo real.</span>
        <div class="builder-modal-actions-right">
          <button type="button" class="btn" id="cancel-section-btn">Cancelar</button>
          <button type="button" class="btn primary" id="save-section-btn">Salvar</button>
        </div>
      </div>
    </div>
  </div>`;
}

function linkModal() {
  return `<div class="builder-modal-backdrop" id="link-modal-backdrop" hidden>
    <div class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="link-modal-title">
      <div class="builder-modal-head">
        <h3 id="link-modal-title">Configurar botão</h3>
        <button type="button" class="modal-close" id="close-link-modal">×</button>
      </div>
      <div class="builder-modal-body">
        <label>Texto do botão<input type="text" id="modal-link-label" maxlength="50" placeholder="Agendar consulta"></label>
        <label>URL do botão<input type="text" id="modal-link-url" maxlength="300" placeholder="https://..."></label>
        <label>Ícone
          <select id="modal-link-icon">
            ${['whatsapp','instagram','site','agenda','maps','phone','email','form','video','download','star','clinic','doctor','link'].map(icon => `<option value="${icon}">${iconLabel(icon)}</option>`).join('')}
          </select>
        </label>
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
  </div>`;
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
