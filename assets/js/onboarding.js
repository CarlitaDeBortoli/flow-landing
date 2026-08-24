/* =========================================================
   FLOW — onboarding.js
   Wizard de alta de cliente en 4 pasos (Hazte cliente)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('onboarding-form');
  if (!form) return;

  const TOTAL_STEPS = 4;
  let currentStep = 1;

  const panels = Array.from(document.querySelectorAll('[data-step-panel]'));
  const indicators = Array.from(document.querySelectorAll('[data-step-indicator]'));
  const container = document.querySelector('.onboarding-container');

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

    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(fieldName, hasError) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const wrapper = input ? input.closest('.form-field, .upload-field') : null;
    if (wrapper) wrapper.classList.toggle('has-error', hasError);
  }

  /* ---------- Paso 1: validación de datos personales ---------- */
  const DNI_REGEX = /^([0-9]{8}[A-Za-z])$|^([XYZxyz][0-9]{7}[A-Za-z])$/;

  function validateStep1() {
    let valid = true;
    const fields = ['full-name', 'birthdate', 'dni', 'address', 'postal-code', 'city', 'email', 'phone'];

    fields.forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      let fieldValid = input.checkValidity();
      if (name === 'dni' && input.value && !DNI_REGEX.test(input.value.trim())) {
        fieldValid = false;
      }
      showError(name, !fieldValid);
      if (!fieldValid) valid = false;
    });

    return valid;
  }

  /* ---------- Paso 2: subida de DNI + vista previa ---------- */
  function setupUploadPreview(inputName) {
    const input = form.querySelector(`#${inputName}`);
    const preview = form.querySelector(`[data-preview-for="${inputName}"]`);
    const placeholder = form.querySelector(`[data-placeholder-for="${inputName}"]`);
    if (!input) return;

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.hidden = false;
        if (placeholder) placeholder.hidden = true;
      };
      reader.readAsDataURL(file);
      showError(inputName, false);
    });
  }
  setupUploadPreview('dni-front');
  setupUploadPreview('dni-back');

  function validateStep2() {
    let valid = true;
    ['dni-front', 'dni-back'].forEach(name => {
      const input = form.querySelector(`#${name}`);
      const hasFile = input && input.files && input.files.length > 0;
      showError(name, !hasFile);
      if (!hasFile) valid = false;
    });
    return valid;
  }

  /* ---------- Paso 3: verificación biométrica (getUserMedia) ---------- */
  const cameraStartBtn = document.querySelector('[data-camera-start]');
  const cameraCaptureBtn = document.querySelector('[data-camera-capture]');
  const cameraRetryBtn = document.querySelector('[data-camera-retry]');
  const cameraVideo = document.querySelector('[data-camera-video]');
  const cameraCanvas = document.querySelector('[data-camera-canvas]');
  const cameraCaptured = document.querySelector('[data-camera-captured]');
  const cameraFallback = document.querySelector('[data-camera-fallback]');
  const cameraInstruction = document.querySelector('[data-camera-instruction]');
  let cameraStream = null;
  let captureDone = false;

  function stopCameraStream() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  if (cameraStartBtn) {
    cameraStartBtn.addEventListener('click', async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraFallback.hidden = false;
        cameraStartBtn.hidden = true;
        return;
      }
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        cameraVideo.srcObject = cameraStream;
        cameraVideo.hidden = false;
        cameraStartBtn.hidden = true;
        cameraCaptureBtn.hidden = false;
        cameraFallback.hidden = true;
      } catch (err) {
        cameraFallback.hidden = false;
        cameraStartBtn.hidden = true;
      }
    });
  }

  if (cameraCaptureBtn) {
    cameraCaptureBtn.addEventListener('click', () => {
      const w = cameraVideo.videoWidth || 320;
      const h = cameraVideo.videoHeight || 320;
      cameraCanvas.width = w;
      cameraCanvas.height = h;
      const ctx = cameraCanvas.getContext('2d');
      ctx.drawImage(cameraVideo, 0, 0, w, h);
      cameraCaptured.src = cameraCanvas.toDataURL('image/png');
      cameraCaptured.hidden = false;
      cameraVideo.hidden = true;
      cameraCaptureBtn.hidden = true;
      cameraRetryBtn.hidden = false;
      if (cameraInstruction) cameraInstruction.textContent = '¡Listo! Ya verificamos tu identidad.';
      captureDone = true;
      stopCameraStream();
    });
  }

  if (cameraRetryBtn) {
    cameraRetryBtn.addEventListener('click', () => {
      cameraCaptured.hidden = true;
      cameraRetryBtn.hidden = true;
      cameraStartBtn.hidden = false;
      if (cameraInstruction) cameraInstruction.textContent = 'Centra tu cara en el óvalo y mantente quieto unos segundos.';
      captureDone = false;
    });
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

  window.addEventListener('beforeunload', stopCameraStream);
});
