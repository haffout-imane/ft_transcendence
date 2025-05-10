import { setupLoginForm, setupRegisterForm } from '../utils/auth.js';

// src/scripts/components/forms.ts
export function renderLoginForm() {
    const container = document.getElementById('auth-form-container');
    if (!container) return;
    
    container.innerHTML = `
    <div class="auth-layout">
        <div class="logo">
        <img src="./../assets/logo.png">
        </div>
        <div class="wrapper">
            <form id="login-form">
                <h1 class="Space_Font">Login</h1>
                <p class="first_p">Email</p>
                <div>
                    <input type="email" id="login-email" placeholder="Username@gmail.com" required>
                </div><br>
                <p class="first_p">Password</p>
                <div>
                    <input type="password" id="login-password" placeholder="Password" required>
                </div>
                <div class="forgot">
                    <a href="#" class="auth-link">Forgot Password?</a>
                </div>
                <button type="submit" class="btn">Login</button>
                <p class="second_p">or continue with</p>
                <button type="button" class="btn2">
                    <img src="./../assets/google.png" alt="Google" class="google-logo">
                </button>
                <p class="second_p">Don't have an account yet?
                <a href="#" id="show-register-link" class="auth-link">Sign Up</a>
                </p>
            </form>
        </div>
    </div>`
    ;

    // Add click handler for Sign Up link
    document.getElementById('show-register-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        renderRegisterForm();
    });


    setupLoginForm();
}

export function renderRegisterForm() {
    const container = document.getElementById('auth-form-container');
    if (!container) return;

    container.innerHTML = `
    <div class="auth-layout">
        <div class="wrapper">
            <form id="register-form">
                <h1 class="Space_Font">Sign Up</h1>
                <div class="form-group">
                    <p class="first_p">Username</p>
                    <input type="text" id="register-username" required placeholder="ihajouji">
                </div>
                <div class="form-group">
                    <p class="first_p">Email</p>
                    <input type="email" id="register-email" required placeholder="ihajouji@gmail.com">
                </div>
                <div class="form-group">
                    <p class="first_p">Password</p>
                    <input type="password" id="register-password" required placeholder="password">
                </div>
                <div class="form-group">
                    <p class="first_p">Confirm Password</p>
                    <input type="password" id="register-confirm" required placeholder="password">
                </div>
                <button type="submit" class="btn">Sign Up</button>
                <p>Already have an account?
                    <a href="#" id="show-login-link" class="auth-link">Login</a>
                </p>
            </form>
        </div>
        <div class="logo">
        <img src="./../assets/logo.png">
        </div>
    </div>`
    ;

    // Add click handler for Sign In link
    document.getElementById('show-login-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        renderLoginForm();
    });

    setupRegisterForm();
}