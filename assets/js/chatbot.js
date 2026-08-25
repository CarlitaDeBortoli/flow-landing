/* =========================================================
   FLOW — chatbot.js
   Asistente virtual flotante con respuestas por palabras clave
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('[data-chatbot]');
  if (!widget) return;

  const toggleBtn = widget.querySelector('[data-chatbot-toggle]');
  const closeBtn = widget.querySelector('[data-chatbot-close]');
  const windowEl = widget.querySelector('[data-chatbot-window]');
  const messagesEl = widget.querySelector('[data-chatbot-messages]');
  const form = widget.querySelector('[data-chatbot-form]');
  const input = widget.querySelector('[data-chatbot-input]');

  let hasGreeted = false;

  const RESPONSES = {
    que_es_flow: "Flow by BBVA es tu nueva forma de gestionar el dinero. Una app 100% digital, diseñada para que tú tengas el control total de tus finanzas sin complicaciones. Con Flow puedes pagar, ahorrar, viajar y mucho más. ¡Todo desde tu móvil!",
    registro: "Registrarte es muy fácil y tarda menos de 5 minutos:\n1️⃣ Haz clic en 'Hazte cliente' en el menú.\n2️⃣ Rellena tus datos personales.\n3️⃣ Verifica tu identidad con una foto de tu DNI.\n4️⃣ Haz una verificación facial rápida.\n¡Y listo! Tu cuenta estará activa en menos de 24h.",
    tarjetas: "Tenemos 3 tarjetas pensadas para ti:\n💳 Flow Débito (gratis) — para el día a día.\n✈️ Flow Travel (4€/mes) — para viajeros con beneficios exclusivos.\n💎 Flow Credit (6€/mes) — crédito inteligente con cashback.\n¿Quieres saber más sobre alguna?",
    seguridad: "Totalmente. Flow es una app de BBVA, uno de los bancos más seguros del mundo con más de 100 años de historia. Tu dinero está protegido con los mismos estándares de seguridad de la banca tradicional: autenticación biométrica, cifrado de datos y supervisión 24/7.",
    agente: "Nuestro equipo está disponible de lunes a viernes de 9:00 a 20:00. Puedes contactarnos en:\n📧 flow@bbva.es | 📞 900 102 801.\n¡Estaremos encantados de ayudarte!",
    fallback: "Hmm, no estoy seguro de entenderte del todo. 😅 Prueba preguntándome sobre el registro, las tarjetas, la seguridad o el soporte. ¡Estoy aquí para ayudarte!",
  };

  const QUICK_REPLIES = [
    { label: '¿Qué es Flow?', key: 'que_es_flow' },
    { label: '¿Cómo me registro?', key: 'registro' },
    { label: 'Ver tarjetas disponibles', key: 'tarjetas' },
    { label: '¿Es seguro Flow?', key: 'seguridad' },
    { label: 'Hablar con un agente', key: 'agente' },
  ];

  const KEYWORD_MAP = [
    { key: 'registro', words: ['registr', 'registrarme', 'abrir cuenta', 'crear cuenta', 'alta', 'hazte cliente', 'unirme', 'apuntarme', 'como me hago cliente', 'como me uno'] },
    { key: 'tarjetas', words: ['tarjeta', 'tarjetas', 'travel', 'credit', 'debito', 'débito', 'credito', 'crédito', 'precio', 'precios', 'cuanto cuesta', 'planes'] },
    { key: 'seguridad', words: ['seguro', 'seguridad', 'confianza', 'protegido', 'estafa', 'fraude', 'fiable'] },
    { key: 'agente', words: ['agente', 'humano', 'persona', 'hablar con alguien', 'contacto', 'contactar', 'soporte', 'telefono', 'teléfono', 'email', 'correo', 'reclamo', 'reclamacion'] },
    { key: 'que_es_flow', words: ['que es flow', 'qué es flow', 'flow es', 'que es', 'qué es', 'informacion', 'información', 'de que se trata'] },
  ];

  const DIACRITICS_REGEX = new RegExp(
    '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
    'g'
  );

  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(DIACRITICS_REGEX, '');
  }

  function matchIntent(text) {
    const normalized = normalize(text);
    for (const entry of KEYWORD_MAP) {
      const matched = entry.words.some(word => {
        const nWord = normalize(word);
        if (nWord.includes(' ')) {
          return nWord.split(' ').every(part => normalized.includes(part));
        }
        return normalized.includes(nWord);
      });
      if (matched) return entry.key;
    }
    return null;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-msg ' + sender;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function addQuickReplies() {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot-quick-replies';
    QUICK_REPLIES.forEach(qr => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chatbot-chip';
      chip.textContent = qr.label;
      chip.addEventListener('click', () => {
        addMessage(qr.label, 'user');
        wrap.remove();
        respond(qr.key);
      });
      wrap.appendChild(chip);
    });
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function respond(intentKey) {
    const typing = document.createElement('div');
    typing.className = 'chatbot-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    scrollToBottom();

    setTimeout(() => {
      typing.remove();
      addMessage(RESPONSES[intentKey] || RESPONSES.fallback, 'bot');
    }, 550);
  }

  function greet() {
    if (hasGreeted) return;
    hasGreeted = true;
    addMessage('¡Hola! 👋 Soy Flow, tu asistente financiero. Estoy aquí para ayudarte con todo lo que necesites. ¿Sobre qué te puedo ayudar hoy?', 'bot');
    addQuickReplies();
  }

  function openChat() {
    widget.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    windowEl.setAttribute('aria-hidden', 'false');
    greet();
    if (window.innerWidth > 480) {
      setTimeout(() => input.focus(), 300);
    }
  }

  function closeChat() {
    widget.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    windowEl.setAttribute('aria-hidden', 'true');
  }

  toggleBtn.addEventListener('click', () => {
    widget.classList.contains('is-open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    const intentKey = matchIntent(text);
    respond(intentKey || 'fallback');
  });
});
