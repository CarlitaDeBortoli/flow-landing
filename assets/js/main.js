/* =========================================================
   FLOW — main.js
   Header scroll state · animaciones IntersectionObserver
   Menú móvil · FAQ acordeón · Simulador · Cookie consent v2
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initScrollAnimations();
  initFAQ();
  initSimulator();
  initCarousel();
  initClientCounter();
  initCookieConsent();
  initAutoplayVideos();
});

/* ---------- Fallback de autoplay para videos en loop (hero) ---------- */
function initAutoplayVideos() {
  const videos = document.querySelectorAll('video[autoplay]');
  if (!videos.length) return;

  videos.forEach(video => {
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    video.addEventListener('canplay', tryPlay, { once: true });
    video.addEventListener('loadeddata', tryPlay, { once: true });

    const resumeOnInteraction = () => {
      tryPlay();
      ['click', 'touchstart', 'scroll'].forEach(evt =>
        document.removeEventListener(evt, resumeOnInteraction)
      );
    };
    ['click', 'touchstart', 'scroll'].forEach(evt =>
      document.addEventListener(evt, resumeOnInteraction, { once: true, passive: true })
    );
  });
}

/* ---------- Contador animado de clientes ---------- */
function initClientCounter() {
  const el = document.getElementById('client-counter');
  if (!el) return;

  let value = parseInt(el.getAttribute('data-counter-target'), 10) || 0;
  el.textContent = value.toLocaleString('es-ES');

  setInterval(() => {
    value += Math.floor(Math.random() * 3) + 1; // sube de a poco, sin parar
    el.textContent = value.toLocaleString('es-ES');
  }, 150);
}

/* ---------- Header con sombra al hacer scroll ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Menú móvil ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Animaciones de entrada lateral ---------- */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.anim-left, .anim-right, .anim-fade');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ---------- FAQ acordeón accesible ---------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      items.forEach(other => {
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ---------- Carrusel de 3 slides (simulador) ---------- */
function initCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const dotsWrap = carousel.querySelector('[data-carousel-dots]');
  let index = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Ir al slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    track.style.transform = 'translateX(-' + (index * 100) + '%)';
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  // Swipe táctil (solo relevante en el layout de 1 slide de móvil/tablet)
  let startX = 0;
  let isDragging = false;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = e.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 40) {
      goTo(index + (deltaX < 0 ? 1 : -1));
    }
  }, { passive: true });

  render();
  window.addEventListener('resize', render);
}

/* ---------- Simulador de ahorro ---------- */
function initSimulator() {
  const openBtn = document.querySelector('[data-simulator-open]');
  const widget = document.querySelector('.simulator-widget');
  if (!openBtn || !widget) return;

  openBtn.addEventListener('click', () => {
    widget.classList.toggle('is-open');
    if (widget.classList.contains('is-open')) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  const amountInput = widget.querySelector('#sim-amount');
  const monthsInput = widget.querySelector('#sim-months');
  const amountLabel = widget.querySelector('#sim-amount-value');
  const monthsLabel = widget.querySelector('#sim-months-value');
  const resultBox = widget.querySelector('#sim-result');

  const TAE = 0.028; // 2,80% TAE

  function calculate() {
    const monthly = Number(amountInput.value);
    const months = Number(monthsInput.value);
    amountLabel.textContent = monthly.toLocaleString('es-ES') + ' €';
    monthsLabel.textContent = months + ' meses';

    const monthlyRate = TAE / 12;
    let balance = 0;
    for (let i = 0; i < months; i++) {
      balance = (balance + monthly) * (1 + monthlyRate);
    }
    resultBox.textContent = 'Con ' + monthly.toLocaleString('es-ES') + ' € al mes durante ' + months +
      ' meses, tendrías aproximadamente ' + Math.round(balance).toLocaleString('es-ES') + ' €';
  }

  [amountInput, monthsInput].forEach(input => {
    if (input) input.addEventListener('input', calculate);
  });
  calculate();
}

/* ---------- Cookie consent (RGPD + Google Consent Mode v2) ---------- */
const CONSENT_KEY = 'flow_cookie_consent';

function initCookieConsent() {
  const banner = document.querySelector('.cookie-banner');
  if (!banner) return;

  const acceptBtn = banner.querySelector('[data-cookie-accept]');
  const rejectBtn = banner.querySelector('[data-cookie-reject]');
  const prefsToggle = banner.querySelector('[data-cookie-prefs-toggle]');
  const prefsPanel = banner.querySelector('.cookie-prefs');
  const savePrefsBtn = banner.querySelector('[data-cookie-save-prefs]');
  const analyticsCheckbox = banner.querySelector('#pref-analytics');
  const marketingCheckbox = banner.querySelector('#pref-marketing');

  const stored = getStoredConsent();
  if (stored) {
    applyConsent(stored);
  } else {
    banner.classList.add('is-visible');
  }

  acceptBtn?.addEventListener('click', () => {
    const consent = { necessary: true, analytics: true, marketing: true };
    saveConsent(consent);
    applyConsent(consent);
    banner.classList.remove('is-visible');
  });

  rejectBtn?.addEventListener('click', () => {
    const consent = { necessary: true, analytics: false, marketing: false };
    saveConsent(consent);
    applyConsent(consent);
    banner.classList.remove('is-visible');
  });

  prefsToggle?.addEventListener('click', () => {
    prefsPanel.classList.toggle('is-open');
    const expanded = prefsPanel.classList.contains('is-open');
    prefsToggle.setAttribute('aria-expanded', String(expanded));
  });

  savePrefsBtn?.addEventListener('click', () => {
    const consent = {
      necessary: true,
      analytics: !!analyticsCheckbox?.checked,
      marketing: !!marketingCheckbox?.checked,
    };
    saveConsent(consent);
    applyConsent(consent);
    banner.classList.remove('is-visible');
  });
}

function getStoredConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveConsent(consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch (e) { /* almacenamiento no disponible */ }
}

/**
 * Aplica el consentimiento a Google Consent Mode v2.
 * gtag() se define de forma segura en el <head> aunque el script
 * de Analytics/GTM aún no haya cargado (cola de comandos estándar de gtag.js).
 */
function applyConsent(consent) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
  });
}
