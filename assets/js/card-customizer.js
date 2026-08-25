/* =========================================================
   FLOW — card-customizer.js
   Wizard de personalización de tarjeta en 4 pasos
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('card-customizer-form');
  if (!form) return;

  const TOTAL_STEPS = 4;
  let currentStep = 1;

  const panels = Array.from(document.querySelectorAll('[data-step-panel]'));
  const indicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const container = document.querySelector('.onboarding-container');

  const EDITION_LABELS = {
    prisma: 'Edición Prisma',
    neon: 'Edición Neón',
    cromo: 'Edición Cromo',
    custom: 'Tu diseño',
  };

  const state = {
    design: null,
    name: '',
    imageDataUrl: null,
    showInitials: false,
    initials: '',
  };

  function goToStep(step) {
    currentStep = step;
    panels.forEach(panel => {
      panel.classList.toggle('is-active', Number(panel.dataset.stepPanel) === step);
    });
    indicators.forEach(indicator => {
      const n = Number(indicator.dataset.stepIndicator);
      indicator.classList.toggle('is-active', n === step);
      indicator.classList.toggle('is-complete', n < step);
      const dot = indicator.querySelector('.progress-dot');
      dot.textContent = n < step ? '✓' : String(n);
    });
    if (step === 2) {
      applyPreview(document.querySelector('[data-live-preview]'));
      updateImageFieldLabel();
    }
    if (step === 3) {
      applyPreview(document.querySelector('[data-summary-preview]'));
      updateConfirmSummary();
    }
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(fieldName, hasError) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const wrapper = input ? input.closest('.form-field, .design-options') : null;
    if (wrapper) wrapper.classList.toggle('has-error', hasError);
    const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.style.display = hasError ? 'block' : 'none';
  }

  /* ---------- Paso 1: selección de diseño ---------- */
  const designOptions = Array.from(document.querySelectorAll('[data-design-option]'));
  designOptions.forEach(option => {
    const input = option.querySelector('input[type="radio"]');
    option.addEventListener('click', () => {
      designOptions.forEach(o => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      input.checked = true;
      state.design = option.dataset.designOption;
      showError('base-design', false);
    });
  });

  function validateStep1() {
    if (!state.design) {
      showError('base-design', true);
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (state.design === 'custom' && !state.imageDataUrl) {
      showError('card-image', true);
      return false;
    }
    showError('card-image', false);
    return true;
  }

  const imageFieldLabel = document.querySelector('[data-image-field-label]');
  function updateImageFieldLabel() {
    if (!imageFieldLabel) return;
    imageFieldLabel.textContent = state.design === 'custom'
      ? 'Sube tu imagen: será el fondo completo de tu tarjeta'
      : '¿Quieres subir tu propia imagen? (opcional)';
  }

  /* ---------- Paso 2: personalización ---------- */
  const nameInput = document.getElementById('card-name');
  nameInput.addEventListener('input', () => {
    const upper = nameInput.value.toUpperCase();
    nameInput.value = upper;
    state.name = upper;
    applyPreview(document.querySelector('[data-live-preview]'));
  });

  const imageInput = document.getElementById('card-image');
  const imagePreview = document.querySelector('[data-preview-for="card-image"]');
  const imagePlaceholder = document.querySelector('[data-placeholder-for="card-image"]');
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      state.imageDataUrl = e.target.result;
      imagePreview.src = state.imageDataUrl;
      imagePreview.hidden = false;
      if (imagePlaceholder) imagePlaceholder.hidden = true;
      showError('card-image', false);
      applyPreview(document.querySelector('[data-live-preview]'));
    };
    reader.readAsDataURL(file);
  });

  const initialsToggle = document.getElementById('add-initials');
  const initialsField = document.querySelector('[data-initials-field]');
  const initialsInput = document.getElementById('card-initials');
  initialsToggle.addEventListener('change', () => {
    state.showInitials = initialsToggle.checked;
    initialsField.hidden = !state.showInitials;
    if (!state.showInitials) {
      state.initials = '';
      initialsInput.value = '';
    }
    applyPreview(document.querySelector('[data-live-preview]'));
  });
  initialsInput.addEventListener('input', () => {
    const upper = initialsInput.value.toUpperCase();
    initialsInput.value = upper;
    state.initials = upper;
    applyPreview(document.querySelector('[data-live-preview]'));
  });

  function applyPreview(cardEl) {
    if (!cardEl || !state.design) return;
    const isCustom = state.design === 'custom';
    const hasImage = !!state.imageDataUrl;
    cardEl.className = 'demo-card demo-card--' + state.design;
    cardEl.classList.toggle('has-custom-image', isCustom && hasImage);

    const editionEl = cardEl.querySelector('[data-preview-edition]');
    if (editionEl) editionEl.textContent = EDITION_LABELS[state.design];

    const nameEl = cardEl.querySelector('[data-preview-name]');
    if (nameEl) nameEl.textContent = state.name || 'CARDHOLDER';

    const initialsEl = cardEl.querySelector('[data-preview-initials]');
    if (initialsEl) {
      initialsEl.hidden = !state.showInitials || !state.initials;
      initialsEl.textContent = state.initials;
    }

    const bgImageEl = cardEl.querySelector('[data-preview-bg-image]');
    const bgScrimEl = cardEl.querySelector('[data-preview-bg-scrim]');
    const placeholderEl = cardEl.querySelector('[data-preview-custom-placeholder]');
    if (isCustom) {
      if (bgImageEl) { bgImageEl.hidden = !hasImage; if (hasImage) bgImageEl.src = state.imageDataUrl; }
      if (bgScrimEl) bgScrimEl.hidden = !hasImage;
      if (placeholderEl) placeholderEl.hidden = hasImage;
    } else {
      if (bgImageEl) bgImageEl.hidden = true;
      if (bgScrimEl) bgScrimEl.hidden = true;
      if (placeholderEl) placeholderEl.hidden = true;
    }

    const imageEl = cardEl.querySelector('[data-preview-image]');
    if (imageEl) {
      imageEl.hidden = isCustom || !hasImage;
      if (hasImage) imageEl.src = state.imageDataUrl;
    }
  }

  /* ---------- Paso 3: confirmación del pedido ---------- */
  function updateConfirmSummary() {
    const nameSummary = document.querySelector('[data-summary-name]');
    if (nameSummary) nameSummary.textContent = state.name || '—';
    const imageSummary = document.querySelector('[data-summary-image]');
    if (imageSummary) imageSummary.textContent = state.imageDataUrl ? 'Sí' : 'No';
  }

  /* ---------- Navegación entre pasos ---------- */
  form.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep === 2 && !validateStep2()) return;
      if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    });
  });

  form.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });
  });

  form.addEventListener('submit', (e) => e.preventDefault());
});
