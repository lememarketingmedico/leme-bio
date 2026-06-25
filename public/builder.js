(function () {
  const form = document.getElementById('public-builder-form');
  if (!form) return;

  const previewTargets = [document.getElementById('builder-preview'), document.getElementById('builder-preview-mobile')].filter(Boolean);
  const linksList = document.getElementById('builder-links-list');
  const addTemplate = document.getElementById('link-row-template');
  const avatarInput = document.getElementById('avatar-file-input');
  const logoInput = document.getElementById('logo-file-input');

  const sectionModal = document.getElementById('section-modal-backdrop');
  const sectionTitle = document.getElementById('section-modal-title');
  const sectionInput = document.getElementById('section-input');
  const sectionTextarea = document.getElementById('section-textarea');
  const sectionSingleField = document.getElementById('section-single-field');
  const sectionTextareaField = document.getElementById('section-textarea-field');
  const saveSectionBtn = document.getElementById('save-section-btn');
  const cancelSectionBtn = document.getElementById('cancel-section-btn');
  const closeSectionBtn = document.getElementById('close-section-modal');

  const linkModal = document.getElementById('link-modal-backdrop');
  const modalLabel = document.getElementById('modal-link-label');
  const modalUrl = document.getElementById('modal-link-url');
  const modalIcon = document.getElementById('modal-link-icon');
  const modalDescription = document.getElementById('modal-link-description');
  const modalHighlight = document.getElementById('modal-link-highlight');
  const saveLinkBtn = document.getElementById('save-link-btn');
  const cancelLinkBtn = document.getElementById('cancel-link-btn');
  const closeLinkModal = document.getElementById('close-link-modal');
  const deleteLinkBtn = document.getElementById('delete-link-btn');

  let activeSection = null;
  let activeCard = null;
  let avatarPreviewUrl = '';
  let logoPreviewUrl = '';

  const iconSvg = {
    link: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 13.4a3 3 0 0 1 0-4.2l2.6-2.6a3 3 0 0 1 4.2 4.2l-.8.8"/><path d="M13.4 10.6a3 3 0 0 1 0 4.2l-2.6 2.6a3 3 0 1 1-4.2-4.2l.8-.8"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11.2c0 4.8-3.9 8.8-8.8 8.8-1.5 0-3-.4-4.2-1.1L2 20l1.2-4.7A8.7 8.7 0 0 1 2.4 12c0-4.8 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8Z"/><path d="M8 7.7c-.2-.5-.4-.5-.7-.5h-.6c-.2 0-.6.1-.8.4-.3.3-1 1-1 2.4s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.2 2.4 1 2.9.8 3.4.8.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.4.1-1.5-.1-.1-.4-.2-.9-.5s-1.7-.8-2-.9c-.2-.1-.4-.1-.6.2l-.8.9c-.2.2-.3.2-.6.1-.3-.2-1.1-.4-2.1-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.6l-.8-2Z"/></svg>',
    instagram: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>',
    site: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17"/><path d="M12 3.2c2 2.1 3.2 5.2 3.2 8.8 0 3.6-1.1 6.7-3.2 8.8-2-2.1-3.2-5.2-3.2-8.8 0-3.6 1.1-6.7 3.2-8.8Z"/></svg>',
    agenda: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3.5v3M16 3.5v3M4 9.5h16"/><path d="M8.5 13h3M8.5 16h6"/></svg>',
    maps: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c3.6-4.3 5.4-7.5 5.4-9.7a5.4 5.4 0 1 0-10.8 0c0 2.2 1.8 5.4 5.4 9.7Z"/><circle cx="12" cy="10" r="2.2"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 4.8c.4-.4 1-.6 1.6-.3l2 1c.6.3.8 1 .6 1.6l-.6 1.5c-.1.3 0 .6.2.9 1 1.6 2.4 3 4 4 .3.2.6.3.9.2l1.5-.6c.6-.2 1.3 0 1.6.6l1 2c.3.6.1 1.2-.3 1.6l-1 1c-.7.7-1.7 1-2.7.8-2.3-.4-5-2-7.3-4.3s-3.9-5-4.3-7.3c-.2-1 .1-2 .8-2.7l1-1Z"/></svg>',
    email: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>',
    form: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 11.5h7M8.5 15h4"/></svg>',
    video: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="11.5" height="14" rx="2.5"/><path d="m15.5 10 4.5-2.5v9L15.5 14"/></svg>',
    download: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5v9"/><path d="m8.5 10.5 3.5 3.5 3.5-3.5"/><path d="M5 18.5h14"/></svg>',
    star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.8 2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8L12 3.8Z"/></svg>',
    clinic: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19V8.5C6 6 8 4 10.5 4h3C16 4 18 6 18 8.5V19"/><path d="M9 19v-4h6v4"/><path d="M10.5 8h3M12 6.5v3"/></svg>',
    doctor: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3"/><path d="M7 18c.7-2.5 2.7-4 5-4s4.3 1.5 5 4"/><path d="M18.5 9.5v4M16.5 11.5h4"/></svg>',
    edit: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4.8L19 9.8a2.2 2.2 0 0 0-3.1-3.1L5.7 16.9 4 20Z"/><path d="m14.5 8.1 3.4 3.4"/></svg>',
    plus: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'
  };

  function qs(name) { return form.querySelector(`[name="${name}"]`); }
  function getCards() { return [...linksList.querySelectorAll('[data-link-card]')]; }
  function getField(card, field) { return card.querySelector(`[data-field="${field}"]`); }
  function getCardData(card) {
    return {
      label: getField(card, 'label')?.value || '',
      url: getField(card, 'url')?.value || '',
      icon: getField(card, 'icon')?.value || 'link',
      description: getField(card, 'description')?.value || '',
      is_highlight: getField(card, 'highlight')?.value === 'on'
    };
  }
  function setCardData(card, data) {
    getField(card, 'label').value = data.label || '';
    getField(card, 'url').value = data.url || '';
    getField(card, 'icon').value = data.icon || 'link';
    getField(card, 'description').value = data.description || '';
    getField(card, 'highlight').value = data.is_highlight ? 'on' : '';
  }
  function reindexLinks() {
    getCards().forEach((card, index) => {
      card.dataset.index = String(index);
      getField(card, 'label').name = `link_label_${index}`;
      getField(card, 'url').name = `link_url_${index}`;
      getField(card, 'icon').name = `link_icon_${index}`;
      getField(card, 'description').name = `link_description_${index}`;
      getField(card, 'highlight').name = `link_highlight_${index}`;
    });
  }
  function slugify(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 80);
  }
  function getState() {
    return {
      title: qs('title')?.value.trim() || '',
      slug: qs('slug')?.value.trim() || '',
      subtitle: qs('subtitle')?.value.trim() || '',
      description: qs('description')?.value.trim() || '',
      template: qs('template')?.value || 'ocean',
      buttonStyle: qs('button_style')?.value || 'glass',
      primary: qs('primary_color_text')?.value || qs('primary_color')?.value || '#1E5C89',
      secondary: qs('secondary_color_text')?.value || qs('secondary_color')?.value || '#5DA1D1',
      background1: qs('background_color_text')?.value || qs('background_color')?.value || '#081321',
      background2: qs('background_color_2_text')?.value || qs('background_color_2')?.value || '#123250',
      links: getCards().map(getCardData).filter(item => item.label || item.url || item.description)
    };
  }

  function renderAvatarHtml(state) {
    if (avatarPreviewUrl) return `<img class="avatar" src="${avatarPreviewUrl}" alt="Prévia">`;
    const existing = document.querySelector('#builder-preview .avatar:not(.fallback)');
    if (existing && existing.getAttribute('src') && !existing.getAttribute('src').startsWith('data:')) return `<img class="avatar" src="${existing.getAttribute('src')}" alt="Prévia">`;
    return `<div class="avatar fallback">${escapeHtml((state.title || 'L').charAt(0).toUpperCase())}</div>`;
  }

  function renderLinksHtml(state) {
    const links = state.links.map((link, index) => `
      <div class="public-link-wrap editable-public-link">
        <a class="public-link ${link.is_highlight ? 'highlight' : ''}" href="#" onclick="return false">
          <span class="link-icon">${iconSvg[link.icon] || iconSvg.link}</span>
          <span class="link-copy"><strong>${escapeHtml(link.label || 'Novo botão')}</strong>${link.description ? `<small>${escapeHtml(link.description)}</small>` : ''}</span>
          <span class="arrow">${iconSvg.link}</span>
        </a>
        <button class="edit-bubble link-edit-bubble" type="button" data-edit-link-index="${index}" aria-label="Editar botão">${iconSvg.edit}</button>
      </div>
    `).join('');
    return `${links}<button class="add-link-dashed" type="button" data-add-link>${iconSvg.plus}<span>Adicionar novo botão</span></button>`;
  }

  function renderPreview() {
    const state = getState();
    if (!state.slug && state.title) qs('slug').value = slugify(state.title);

    previewTargets.forEach(preview => {
      preview.className = `phone-screen preview-surface template-${state.template} buttons-${state.buttonStyle}`;
      preview.style.setProperty('--primary', state.primary);
      preview.style.setProperty('--secondary', state.secondary);
      preview.style.setProperty('--text', '#FFFFFF');
      preview.style.background = `radial-gradient(circle at 20% 0%, ${state.secondary}40 0, transparent 28%), linear-gradient(145deg, ${state.background1}, ${state.background2})`;

      const avatarWrap = preview.querySelector('.avatar-wrap');
      const titleEl = preview.querySelector('h1');
      const subtitleEl = preview.querySelector('.subtitle');
      const descriptionEl = preview.querySelector('.description');
      const linksStack = preview.querySelector('.links-stack');
      const logo = preview.querySelector('.client-logo');

      if (avatarWrap) avatarWrap.innerHTML = renderAvatarHtml(state);
      if (titleEl) titleEl.textContent = state.title || 'Seu nome ou marca';
      if (subtitleEl) subtitleEl.textContent = state.subtitle || 'Seu subtítulo aparece aqui';
      if (descriptionEl) descriptionEl.textContent = state.description || 'Uma descrição curta para apresentar seu trabalho, serviço ou marca.';
      if (linksStack) linksStack.innerHTML = renderLinksHtml(state);
      if (logoPreviewUrl) {
        if (logo) logo.src = logoPreviewUrl;
        else preview.querySelector('.bio-phone').insertAdjacentHTML('afterbegin', `<img class="client-logo" src="${logoPreviewUrl}" alt="Logo">`);
      }
    });
  }

  function updateColorSync() {
    form.querySelectorAll('[data-color-sync]').forEach(input => {
      const colorInput = form.querySelector(`input[type="color"][name="${input.dataset.colorSync}"]`);
      if (!colorInput || colorInput.dataset.bound) return;
      colorInput.dataset.bound = '1';
      colorInput.addEventListener('input', () => { input.value = colorInput.value; renderPreview(); });
      input.addEventListener('input', () => {
        if (/^#[0-9a-f]{6}$/i.test(input.value)) colorInput.value = input.value;
        renderPreview();
      });
    });
  }

  function applyPreset(value) {
    const [primary, secondary, bg1, bg2] = String(value || '').split(',');
    const fields = [
      ['primary_color', primary], ['secondary_color', secondary], ['background_color', bg1], ['background_color_2', bg2]
    ];
    fields.forEach(([name, color]) => {
      const picker = qs(name);
      const text = qs(`${name}_text`);
      if (picker && color) picker.value = color;
      if (text && color) text.value = color;
    });
    renderPreview();
  }

  function openSectionModal(section) {
    if (section === 'avatar') { avatarInput.click(); return; }
    if (section === 'logo') { logoInput.click(); return; }
    activeSection = section;
    const labels = { title: 'Editar nome', subtitle: 'Editar subtítulo', description: 'Editar descrição' };
    sectionTitle.textContent = labels[section] || 'Editar seção';
    const isLong = section === 'description';
    sectionSingleField.hidden = isLong;
    sectionTextareaField.hidden = !isLong;
    if (isLong) sectionTextarea.value = qs(section)?.value || '';
    else sectionInput.value = qs(section)?.value || '';
    sectionModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => (isLong ? sectionTextarea : sectionInput).focus(), 20);
  }
  function closeSectionModalFn() { sectionModal.hidden = true; document.body.style.overflow = ''; activeSection = null; }
  function saveSection() {
    if (!activeSection) return;
    const value = activeSection === 'description' ? sectionTextarea.value.trim() : sectionInput.value.trim();
    const input = qs(activeSection);
    if (input) input.value = value;
    if (activeSection === 'title' && (!qs('slug').value || qs('slug').dataset.auto !== '0')) {
      qs('slug').value = slugify(value);
      qs('slug').dataset.auto = '1';
    }
    renderPreview();
    closeSectionModalFn();
  }

  function openLinkModal(card) {
    activeCard = card;
    const data = getCardData(card);
    modalLabel.value = data.label;
    modalUrl.value = data.url;
    modalIcon.value = data.icon;
    modalDescription.value = data.description;
    modalHighlight.checked = data.is_highlight;
    deleteLinkBtn.hidden = getCards().length <= 1;
    linkModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalLabel.focus(), 20);
  }
  function closeLinkModalFn() { linkModal.hidden = true; document.body.style.overflow = ''; activeCard = null; }
  function addLinkCard() {
    const cards = getCards();
    if (cards.length >= 10) return;
    linksList.insertAdjacentHTML('beforeend', addTemplate.innerHTML.replaceAll('__INDEX__', String(cards.length)));
    reindexLinks();
    activeCard = getCards()[getCards().length - 1];
    setCardData(activeCard, { label: '', url: '', icon: 'link', description: '', is_highlight: false });
    renderPreview();
    openLinkModal(activeCard);
  }
  function saveLink() {
    if (!activeCard) return;
    setCardData(activeCard, {
      label: modalLabel.value.trim(),
      url: modalUrl.value.trim(),
      icon: modalIcon.value,
      description: modalDescription.value.trim(),
      is_highlight: modalHighlight.checked
    });
    renderPreview();
    closeLinkModalFn();
  }
  function deleteLink() {
    if (!activeCard || getCards().length <= 1) return;
    activeCard.remove();
    reindexLinks();
    renderPreview();
    closeLinkModalFn();
  }

  function attachImagePreview(input, type) {
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'avatar') avatarPreviewUrl = reader.result;
        if (type === 'logo') logoPreviewUrl = reader.result;
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('click', event => {
    const sectionBtn = event.target.closest('[data-edit-section]');
    if (sectionBtn && form.contains(sectionBtn)) {
      event.preventDefault();
      openSectionModal(sectionBtn.dataset.editSection);
      return;
    }
    const sectionArea = event.target.closest('[data-edit-section-area]');
    if (sectionArea && form.contains(sectionArea)) {
      event.preventDefault();
      openSectionModal(sectionArea.dataset.editSectionArea);
      return;
    }
    const linkBtn = event.target.closest('[data-edit-link-index]');
    if (linkBtn && form.contains(linkBtn)) {
      event.preventDefault();
      const card = getCards()[Number(linkBtn.dataset.editLinkIndex)];
      if (card) openLinkModal(card);
      return;
    }
    const addBtn = event.target.closest('[data-add-link]');
    if (addBtn && form.contains(addBtn)) {
      event.preventDefault();
      addLinkCard();
      return;
    }
    const preset = event.target.closest('[data-preset]');
    if (preset && form.contains(preset)) {
      event.preventDefault();
      applyPreset(preset.dataset.preset);
    }
  });

  form.addEventListener('input', renderPreview);
  form.addEventListener('change', renderPreview);
  saveSectionBtn.addEventListener('click', saveSection);
  cancelSectionBtn.addEventListener('click', closeSectionModalFn);
  closeSectionBtn.addEventListener('click', closeSectionModalFn);
  sectionModal.addEventListener('click', e => { if (e.target === sectionModal) closeSectionModalFn(); });
  saveLinkBtn.addEventListener('click', saveLink);
  cancelLinkBtn.addEventListener('click', closeLinkModalFn);
  closeLinkModal.addEventListener('click', closeLinkModalFn);
  deleteLinkBtn.addEventListener('click', deleteLink);
  linkModal.addEventListener('click', e => { if (e.target === linkModal) closeLinkModalFn(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!sectionModal.hidden) closeSectionModalFn();
    if (!linkModal.hidden) closeLinkModalFn();
  });

  updateColorSync();
  attachImagePreview(avatarInput, 'avatar');
  attachImagePreview(logoInput, 'logo');
  reindexLinks();
  renderPreview();
})();
