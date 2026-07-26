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
  initCookieConsent();
});

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
