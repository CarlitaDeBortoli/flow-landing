/* =========================================================
   FLOW — login.js
   Validación del formulario de acceso clientes
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  function showError(fieldName, hasError) {
    const input = form.querySelector(`[name="${fieldName}"]`);
    const wrapper = input ? input.closest('.form-field') : null;
    if (wrapper) wrapper.classList.toggle('has-error', hasError);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('#login-email');
    const password = form.querySelector('#login-password');

    const emailValid = email.checkValidity();
    const passwordValid = password.checkValidity();

    showError('email', !emailValid);
    showError('password', !passwordValid);
  });
});
