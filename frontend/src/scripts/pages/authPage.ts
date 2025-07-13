import { renderLoginForm, renderRegisterForm } from '../components/forms.js';

export function renderAuthPage() {
    const mainPage = document.getElementById('main-page');
    if (!mainPage) return;

    mainPage.innerHTML = `
        <div class="auth-container">

            <div id="auth-form-container"></div>
        </div>`
    ;

    renderLoginForm(); // Default view
}