(function () {
  const form = document.getElementById('public-builder-form');
  if (!form) return;

  const previewScreen = document.getElementById('builder-preview');
  const hiddenLinks = document.getElementById('builder-links-hidden');
  const avatarInput = document.getElementById('avatar-input');
  const linkModal = document.getElementById('link-modal-backdrop');
  const modelModal = document.getElementById('models-modal-backdrop');
  const openModelsModal = document.getElementById('open-models-modal');
  const closeModelsModal = document.getElementById('close-models-modal');
  const chosenModelName = document.getElementById('chosen-model-name');

  const modalLabel = document.getElementById('modal-link-label');
  const modalKind = document.getElementById('modal-link-kind');
  const modalValueWrap = document.getElementById('modal-link-value-wrap');
  const modalValue = document.getElementById('modal-link-value');
  const modalDescription = document.getElementById('modal-link-description');
  const modalHighlight = document.getElementById('modal-link-highlight');
  const saveLinkBtn = document.getElementById('save-link-btn');
  const cancelLinkBtn = document.getElementById('cancel-link-btn');
  const closeLinkModal = document.getElementById('close-link-modal');
  const deleteLinkBtn = document.getElementById('delete-link-btn');

  let activeCard = null;
  let avatarPreviewUrl = previewScreen.querySelector('.avatar')?.src || '';
  let slugTouched = Boolean((form.querySelector('[name="slug"]')?.value || '').trim());

  const icons = {
    link: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 13.4a3 3 0 0 1 0-4.2l2.6-2.6a3 3 0 0 1 4.2 4.2l-.8.8"/><path d="M13.4 10.6a3 3 0 0 1 0 4.2l-2.6 2.6a3 3 0 1 1-4.2-4.2l.8-.8"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4.8L19 9.8a2.2 2.2 0 0 0-3.1-3.1L5.7 16.9 4 20Z"/><path d="m14.5 8.1 3.4 3.4"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.2c0 4.8-3.9 8.8-8.8 8.8-1.5 0-3-.4-4.2-1.1L2 20l1.2-4.7A8.7 8.7 0 0 1 2.4 12c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8Z"/><path d="M8 7.7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.2 2.4 1 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.4.1-1.5-.1-.1-.4-.2-.9-.5s-1.7-.8-2-.9c-.2-.1-.4-.1-.6.2l-.8.9c-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.6l-.8-2Z"/></svg>',
    instagram: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    site: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3.2c2 2.1 3.2 5.2 3.2 8.8 0 3.6-1.1 6.7-3.2 8.8-2-2.1-3.2-5.2-3.2-8.8 0-3.6 1.1-6.7 3.2-8.8Z"/></svg>',
    maps: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c3.6-4.3 5.4-7.5 5.4-9.7a5.4 5.4 0 1 0-10.8 0c0 2.2 1.8 5.4 5.4 9.7Z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 4.8c.4-.4 1-.6 1.6-.3l2 1c.6.3.8 1 .6 1.6l-.6 1.5c-.1.3 0 .6.2.9 1 1.6 2.4 3 4 4 .3.2.6.3.9.2l1.5-.6c.6-.2 1.3 0 1.6.6l1 2c.3.6.1 1.2-.3 1.6l-1 1c-.7.7-1.7 1-2.7.8-2.3-.4-5-2-7.3-4.3s-3.9-5-4.3-7.3c-.2-1 .1-2 .8-2.7l1-1Z"/></svg>',
    email: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    agenda: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/><path d="M8.5 13h3M8.5 16h6"/></svg>',
    clinic: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19V8.5C6 6 8 4 10.5 4h3C16 4 18 6 18 8.5V19"/><path d="M9 19v-4h6v4"/><path d="M10.5 8h3M12 6.5v3"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.8 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 3.8Z"/></svg>',
    video: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="11.5" height="14" rx="2.5"/><path d="m15.5 10 4.5-2.5v9L15.5 14"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 18.5h14"/></svg>'
  };

  const kindMeta = {
    schedule: { label: 'Link personalizado', placeholder: 'https://agenda...', icon: 'agenda', defaultLabel: 'Agendar horário' },
    whatsapp: { label: 'DDD + número do WhatsApp', placeholder: '3491003193', icon: 'whatsapp', defaultLabel: 'Falar no WhatsApp' },
    services: { label: 'Link personalizado', placeholder: 'https://...', icon: 'clinic', defaultLabel: 'Conheça nossos serviços' },
    maps: { label: 'Link do Google Maps', placeholder: 'https://maps.google.com/...', icon: 'maps', defaultLabel: 'Ver localização no Google Maps' },
    reviews: { label: 'Link de avaliações do Google', placeholder: 'https://g.page/r/.../review', icon: 'star', defaultLabel: 'Avaliações no Google' },
    site: { label: 'Link do site oficial', placeholder: 'https://seudominio.com.br', icon: 'site', defaultLabel: 'Site oficial' },
    instagram: { label: '@ do Instagram', placeholder: '@seuusuario', icon: 'instagram', defaultLabel: 'Instagram' },
    youtube: { label: 'Link do canal no YouTube', placeholder: 'https://youtube.com/@...', icon: 'video', defaultLabel: 'YouTube' },
    facebook: { label: 'Link da página no Facebook', placeholder: 'https://facebook.com/...', icon: 'site', defaultLabel: 'Facebook' },
    phone: { label: 'DDD + telefone', placeholder: '3433334444', icon: 'phone', defaultLabel: 'Telefone' },
    email: { label: 'E-mail', placeholder: 'contato@seudominio.com.br', icon: 'email', defaultLabel: 'Email' },
    material: { label: 'Link personalizado', placeholder: 'https://...', icon: 'download', defaultLabel: 'Baixar material gratuito' }
  };

  const modelPresets = {
    ocean: { name: 'Ocean LEME', template: 'ocean', button_style: 'glass', primary: '#1E5C89', secondary: '#5DA1D1', bg1: '#081321', bg2: '#123250' },
    premium: { name: 'Premium médico', template: 'premium', button_style: 'shadow', primary: '#15395F', secondary: '#83C4EF', bg1: '#07101D', bg2: '#19395B' },
    clinic: { name: 'Clínica clean', template: 'clinic', button_style: 'soft', primary: '#266B94', secondary: '#9FD5F4', bg1: '#DCECF7', bg2: '#F7FBFF' },
    minimal: { name: 'Minimalista', template: 'minimal', button_style: 'clean', primary: '#173C60', secondary: '#6EA9D1', bg1: '#0D1B2D', bg2: '#102E4B' },
    frame: { name: 'Moldura premium', template: 'frame', button_style: 'pill', primary: '#245B82', secondary: '#C2E6FF', bg1: '#06101D', bg2: '#1C4568' },
    light: { name: 'Claro premium', template: 'light', button_style: 'solid', primary: '#2B719C', secondary: '#62ADD9', bg1: '#EEF7FD', bg2: '#D7EBF8' }
  };

  const colorPresets = {
    leme: { primary: '#1E5C89', secondary: '#5DA1D1', bg1: '#081321', bg2: '#123250' },
    premium: { primary: '#15395F', secondary: '#83C4EF', bg1: '#07101D', bg2: '#19395B' },
    light: { primary: '#2B719C', secondary: '#62ADD9', bg1: '#EEF7FD', bg2: '#D7EBF8' },
    dark: { primary: '#163B60', secondary: '#5A94C3', bg1: '#040A12', bg2: '#0F2238' }
  };

  function qs(name) { return form.querySelector(`[name="${name}"]`); }
  function getCards() { return [...hiddenLinks.querySelectorAll('[data-link-card]')]; }
  function getField(card, field) { return card.querySelector(`[data-field="${field}"]`); }
  function html(value) { return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function onlyDigits(value) { return String(value || '').replace(/\D/g, ''); }
  function brazilNumber(value) { const digits = onlyDigits(value); return digits.startsWith('55') && digits.length > 11 ? digits : `55${digits}`; }
  function normalizeCustomLink(value) { const raw = String(value || '').trim(); if (!raw) return ''; return /^(https?:\/\/|mailto:|tel:)/i.test(raw) ? raw : `https://${raw}`; }

  function buildUrl(kind, value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (kind === 'whatsapp') return `https://wa.me/${brazilNumber(raw)}`;
    if (kind === 'phone') return `tel:+${brazilNumber(raw)}`;
    if (kind === 'email') return `mailto:${raw.replace(/^mailto:/i, '')}`;
    if (kind === 'instagram') return `https://instagram.com/${raw.replace(/^@/, '')}`;
    return normalizeCustomLink(raw);
  }

  function getCardData(card) {
    return {
      label: getField(card, 'label')?.value || '',
      url: getField(card, 'url')?.value || '',
      icon: getField(card, 'icon')?.value || 'site',
      description: getField(card, 'description')?.value || '',
      is_highlight: getField(card, 'highlight')?.value === 'on',
      kind: getField(card, 'kind')?.value || 'site',
      value: getField(card, 'value')?.value || ''
    };
  }

  function getState() {
    return {
      title: qs('title')?.value.trim() || '',
      slug: qs('slug')?.value.trim() || '',
      subtitle: qs('subtitle')?.value.trim() || '',
      description: qs('description')?.value.trim() || '',
      template: qs('template')?.value || 'ocean',
      button_style: form.querySelector('[name="button_style"]:checked')?.value || 'glass',
      primary_color: qs('primary_color_text')?.value || qs('primary_color')?.value || '#1E5C89',
      secondary_color: qs('secondary_color_text')?.value || qs('secondary_color')?.value || '#5DA1D1',
      background_color: qs('background_color_text')?.value || qs('background_color')?.value || '#081321',
      background_color_2: qs('background_color_2_text')?.value || qs('background_color_2')?.value || '#123250',
      text_color: '#FFFFFF',
      avatar_url: avatarPreviewUrl,
      links: getCards().map(getCardData).filter(link => link.label || link.value || link.url)
    };
  }

  function createHiddenCard(data) {
    const index = getCards().length;
    hiddenLinks.insertAdjacentHTML('beforeend', `
      <div class="builder-hidden-link" data-link-card data-index="${index}">
        <input type="hidden" name="link_label_${index}" value="${html(data.label || '')}" data-field="label">
        <input type="hidden" name="link_url_${index}" value="${html(data.url || '')}" data-field="url">
        <input type="hidden" name="link_icon_${index}" value="${html(data.icon || 'site')}" data-field="icon">
        <input type="hidden" name="link_description_${index}" value="${html(data.description || '')}" data-field="description">
        <input type="hidden" name="link_highlight_${index}" value="${data.is_highlight ? 'on' : ''}" data-field="highlight">
        <input type="hidden" name="link_kind_${index}" value="${html(data.kind || 'site')}" data-field="kind">
        <input type="hidden" name="link_value_${index}" value="${html(data.value || '')}" data-field="value">
      </div>`);
    return getCards()[getCards().length - 1];
  }

  function setCardData(card, data) {
    getField(card, 'label').value = data.label || '';
    getField(card, 'url').value = data.url || '';
    getField(card, 'icon').value = data.icon || 'site';
    getField(card, 'description').value = data.description || '';
    getField(card, 'highlight').value = data.is_highlight ? 'on' : '';
    getField(card, 'kind').value = data.kind || 'site';
    getField(card, 'value').value = data.value || '';
  }

  function reindexLinks() {
    getCards().forEach((card, index) => {
      card.dataset.index = String(index);
      ['label', 'url', 'icon', 'description', 'highlight', 'kind', 'value'].forEach((field) => {
        const input = getField(card, field);
        if (input) input.name = `link_${field}_${index}`;
      });
    });
  }

  function buildBioHtml(state) {
    const links = state.links.map((link, index) => `
      <div class="public-link-wrap editable-public-link">
        <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="#" onclick="return false">
          <span class="link-icon">${icons[link.icon] || icons.site}</span>
          <span class="link-copy"><strong>${html(link.label || 'Novo botão')}</strong>${link.description ? `<small>${html(link.description)}</small>` : ''}</span>
          <span class="arrow">${icons.link}</span>
        </a>
        <button class="edit-bubble link-edit-bubble" type="button" data-edit-link-index="${index}" aria-label="Editar botão">${icons.edit}</button>
      </div>`).join('');

    const avatar = state.avatar_url
      ? `<img class="avatar" src="${html(state.avatar_url)}" alt="${html(state.title || 'Foto')}">`
      : `<div class="avatar fallback">${html((state.title || 'L').charAt(0).toUpperCase())}</div>`;

    return `
      <section class="bio-phone editable-bio-phone">
        <div class="editable-block avatar-edit-block" data-edit-section-area="avatar"><div class="avatar-wrap">${avatar}</div><button class="edit-bubble" type="button" data-edit-section="avatar" aria-label="Trocar foto">${icons.edit}</button></div>
        <div class="editable-block text-edit-block" data-edit-section-area="title"><h1 data-inline-field="title" contenteditable="true" spellcheck="false">${html(state.title || 'Seu nome ou marca')}</h1><button class="edit-bubble" type="button" data-edit-section="title" aria-label="Editar nome">${icons.edit}</button></div>
        <div class="editable-block text-edit-block slim" data-edit-section-area="subtitle"><p class="subtitle" data-inline-field="subtitle" contenteditable="true" spellcheck="false">${html(state.subtitle || 'Seu subtítulo aparece aqui')}</p><button class="edit-bubble" type="button" data-edit-section="subtitle" aria-label="Editar subtítulo">${icons.edit}</button></div>
        <div class="editable-block text-edit-block slim" data-edit-section-area="description"><p class="description" data-inline-field="description" contenteditable="true" spellcheck="false">${html(state.description || 'Uma descrição curta para apresentar seu trabalho, serviço ou marca.')}</p><button class="edit-bubble" type="button" data-edit-section="description" aria-label="Editar descrição">${icons.edit}</button></div>
        <div class="links-stack">${links || '<p class="empty-public">Adicione até 10 botões e veja o resultado em tempo real.</p>'}<button class="add-link-dashed" type="button" data-add-link>${icons.plus}<span>Adicionar novo botão</span></button></div>
        <a class="powered" href="https://lememarketingmedico.com.br" target="_blank" rel="noopener"><img src="/assets/leme-logo.png" alt="LEME Marketing Médico"><span>Feito com LEME Bio</span></a>
      </section>`;
  }

  function renderPreview() {
    const state = getState();
    previewScreen.className = `phone-screen preview-surface template-${state.template} buttons-${state.button_style}`;
    previewScreen.style.setProperty('--primary', state.primary_color);
    previewScreen.style.setProperty('--secondary', state.secondary_color);
    previewScreen.style.setProperty('--text', '#FFFFFF');
    previewScreen.style.background = `radial-gradient(circle at 20% 0%, ${state.secondary_color}40 0, transparent 28%), linear-gradient(145deg, ${state.background_color}, ${state.background_color_2})`;
    const existingBio = previewScreen.querySelector('.bio-phone');
    if (existingBio) existingBio.outerHTML = buildBioHtml(state);
    else previewScreen.insertAdjacentHTML('afterbegin', buildBioHtml(state));
  }

  function focusInlineField(field) {
    const el = previewScreen.querySelector(`[data-inline-field="${field}"]`);
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function openLinkModal(card) {
    activeCard = card;
    const data = card ? getCardData(card) : { kind: 'schedule', label: '', value: '', description: '', is_highlight: false };
    const meta = kindMeta[data.kind] || kindMeta.site;
    modalKind.value = data.kind || 'schedule';
    modalLabel.value = data.label || meta.defaultLabel;
    modalValue.value = data.value || '';
    modalDescription.value = data.description || '';
    modalHighlight.checked = Boolean(data.is_highlight);
    syncKindUI(false);
    linkModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalValue.focus(), 30);
  }

  function closeModal() {
    linkModal.hidden = true;
    document.body.style.overflow = '';
    activeCard = null;
  }

  function syncKindUI(updateLabel = true) {
    const meta = kindMeta[modalKind.value] || kindMeta.site;
    const span = modalValueWrap.querySelector('span');
    if (span) span.textContent = meta.label;
    modalValue.placeholder = meta.placeholder;
    if (updateLabel) modalLabel.value = meta.defaultLabel;
  }

  function saveModal() {
    const kind = modalKind.value;
    const meta = kindMeta[kind] || kindMeta.site;
    const value = modalValue.value.trim();
    const data = {
      kind,
      value,
      url: buildUrl(kind, value),
      label: modalLabel.value.trim() || meta.defaultLabel,
      description: modalDescription.value.trim(),
      is_highlight: modalHighlight.checked,
      icon: meta.icon
    };

    if (!data.url) {
      alert('Preencha o conteúdo do botão.');
      return;
    }

    if (!activeCard) {
      if (getCards().length >= 10) {
        alert('O limite máximo é de 10 botões.');
        return;
      }
      activeCard = createHiddenCard(data);
    }
    setCardData(activeCard, data);
    reindexLinks();
    renderPreview();
    closeModal();
  }

  function deleteModalCard() {
    if (activeCard) activeCard.remove();
    reindexLinks();
    renderPreview();
    closeModal();
  }

  function setColor(name, value) {
    const colorInput = qs(name);
    const textInput = qs(`${name}_text`);
    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value;
  }

  function applyPreset(preset) {
    setColor('primary_color', preset.primary);
    setColor('secondary_color', preset.secondary);
    setColor('background_color', preset.bg1);
    setColor('background_color_2', preset.bg2);
  }

  function applyModel(key) {
    const model = modelPresets[key];
    if (!model) return;
    qs('template').value = model.template;
    const radio = form.querySelector(`[name="button_style"][value="${model.button_style}"]`);
    if (radio) radio.checked = true;
    applyPreset(model);
    if (chosenModelName) chosenModelName.textContent = model.name;
    renderPreview();
    modelModal.hidden = true;
  }

  function syncColorInputs() {
    form.querySelectorAll('[data-color-sync]').forEach((textInput) => {
      const colorInput = qs(textInput.dataset.colorSync);
      if (!colorInput || colorInput.dataset.bound) return;
      colorInput.dataset.bound = '1';
      colorInput.addEventListener('input', () => { textInput.value = colorInput.value; renderPreview(); });
      textInput.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(textInput.value)) colorInput.value = textInput.value; renderPreview(); });
    });
  }

  function syncSlugFromTitle() {
    if (slugTouched) return;
    const slugInput = qs('slug');
    const title = qs('title')?.value || '';
    if (!slugInput) return;
    slugInput.value = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  previewScreen.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add-link]');
    if (add) return openLinkModal(null);

    const linkEdit = event.target.closest('[data-edit-link-index]');
    if (linkEdit) return openLinkModal(getCards()[Number(linkEdit.dataset.editLinkIndex)]);

    const editButton = event.target.closest('[data-edit-section]');
    const editArea = event.target.closest('[data-edit-section-area]');
    const section = editButton?.dataset.editSection || editArea?.dataset.editSectionArea;
    if (section === 'avatar') return avatarInput.click();
    if (section) return focusInlineField(section);
  });

  previewScreen.addEventListener('input', (event) => {
    const editable = event.target.closest('[data-inline-field]');
    if (!editable) return;
    const field = editable.dataset.inlineField;
    const input = qs(field);
    if (input) input.value = editable.textContent.trim();
    if (field === 'title') syncSlugFromTitle();
  });

  previewScreen.addEventListener('keydown', (event) => {
    if (event.target.closest('[data-inline-field]') && event.key === 'Enter') event.preventDefault();
  });

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { avatarPreviewUrl = String(reader.result); renderPreview(); };
    reader.readAsDataURL(file);
  });

  qs('slug')?.addEventListener('input', () => { slugTouched = true; });
  form.addEventListener('change', (event) => {
    if (event.target.name === 'button_style' || event.target.type === 'color') renderPreview();
  });

  modalKind.addEventListener('change', () => syncKindUI(true));
  saveLinkBtn.addEventListener('click', saveModal);
  cancelLinkBtn.addEventListener('click', closeModal);
  closeLinkModal.addEventListener('click', closeModal);
  deleteLinkBtn.addEventListener('click', deleteModalCard);
  linkModal.addEventListener('click', (event) => { if (event.target === linkModal) closeModal(); });

  openModelsModal.addEventListener('click', () => { modelModal.hidden = false; });
  closeModelsModal.addEventListener('click', () => { modelModal.hidden = true; });
  modelModal.addEventListener('click', (event) => {
    if (event.target === modelModal) modelModal.hidden = true;
    const card = event.target.closest('[data-model-preset]');
    if (card) applyModel(card.dataset.modelPreset);
  });

  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => { const preset = colorPresets[button.dataset.preset]; if (preset) { applyPreset(preset); renderPreview(); } });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!linkModal.hidden) closeModal();
    if (!modelModal.hidden) modelModal.hidden = true;
  });

  syncColorInputs();
  reindexLinks();
  renderPreview();
})();
