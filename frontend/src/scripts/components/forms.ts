import { authToken, setupLoginForm, setupRegisterForm } from '../utils/auth.js';
import { setupGoogleLogin } from '../utils/google-auth.js';
import { showCustomAlert } from './notif.js';
// src/scripts/components/forms.ts

declare global {
    interface Window {
        google: any;
    }
}

function waitForGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
  
        // Optional timeout safety
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("Google API failed to load in time."));
        }, 5000);
      }
    });
  }
  

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
                <h1 class="Space_Font_auth">Login</h1>
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
                <p class="second_p">or </p>
                <div id="google-login-btn" style="width: 300px; display: flex; justify-content: center;" class="google-login-btn"></div>

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


    waitForGoogleScript()
    .then(() => {
      setupGoogleLogin(
        '996150180782-6saak7404gugo1o374lan8ql2jn1tdr5.apps.googleusercontent.com',
        async (token) => {
         try {
            const response = await fetch('/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: token }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Google login failed');
            }
            const result = await response.json();
            if (result.success) {
                authToken.login();
                window.location.href = '/home'; // Redirect to home page on success
            }

            else {
                showCustomAlert("Google login failed. Please try again.");
            }
        }
        catch (err) {
            console.error('Error during Google login:', err);
            showCustomAlert("Google login failed. Please try again.");
        }
    });
    })
    .catch((err) => console.error(err));

}

export function renderRegisterForm() {
    const container = document.getElementById('auth-form-container');
    if (!container) return;

    container.innerHTML = `
    <div class="auth-layout">
        <div class="wrapper">
            <form id="register-form">
                <h1 class="Space_Font_auth">Sign Up</h1>
                <div class="form-group">
                    <p class="first_p">Username</p>
                    <input type="text" id="register-username" required placeholder="ihajouji" autocomplete="off">
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