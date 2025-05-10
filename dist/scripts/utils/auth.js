var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { renderLoginForm } from '../components/forms.js';
export const authService = {
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Login attempt:', email);
            if (email === "fail@example.com") {
                return { success: false, message: "Invalid credentials." };
            }
            return { success: true, token: 'mock-token' };
        });
    },
    register(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Register attempt:', username, email);
            return { success: true };
        });
    }
};
export function setupLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // Prevent the default form submission behavior (which would reload the page)
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        // Get references to the email and password input fields, and tell TypeScript they're HTMLInputElements
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        // Extract the values from the inputs
        // 'trim()' removes whitespace from the beginning and end of the email
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        // Basic check to ensure both fields are filled in
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        // Use a regular expression to check if the email is in a valid format
        const result = yield authService.login(email, password);
        // Call the login function from the authService and wait for the result
        if (result.success) {
            localStorage.setItem('auth_token', result.token);
            // Save the auth token to local storage (to use it for future authenticated requests)
            window.location.href = '/';
            // Redirect to the homepage (or dashboard) after successful login
        }
        else {
            alert("Login failed. Please check your credentials.");
            // Show an error message if the login was unsuccessful
        }
    }));
}
export function setupRegisterForm() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (e) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        if (password !== confirm) {
            alert("Passwords don't match!");
            return;
        }
        const result = yield authService.register(username, email, password);
        if (result.success) {
            alert('Registration successful! Please login.');
            renderLoginForm(); // <- you'll fix this in a sec
            (_a = document.querySelector('.auth-tab[data-tab="login"]')) === null || _a === void 0 ? void 0 : _a.classList.add('active');
            (_b = document.querySelector('.auth-tab[data-tab="register"]')) === null || _b === void 0 ? void 0 : _b.classList.remove('active');
        }
        else
            alert('Registration failed. Please try again.');
    }));
}
export const auth = {
    isAuthenticated: false,
    checkAuth() {
        const token = localStorage.getItem('auth_token');
        this.isAuthenticated = !!token; // Check if the auth token exists in local storage
        return this.isAuthenticated;
    },
    login(token) {
        localStorage.setItem('auth_token', token); // Save the token to local storage
        this.isAuthenticated = true; // Set the auth status to true
    },
    logout() {
        localStorage.removeItem('auth_token'); // Remove the token from local storage
        this.isAuthenticated = false; // Set the auth status to false
    }
};
// the real version when backend is ready using API
// export const authService = {
//     async login(email: string, password: string) {
//         const response = await fetch('https://your-backend-url.com/api/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ email, password }),
//         });
//         const data = await response.json();
//         if (!response.ok) {
//             return { success: false, message: data.error };
//         }
//         return { success: true, token: data.token };
//     },
//     async register(username: string, email: string, password: string) {
//         const response = await fetch('https://your-backend-url.com/api/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, email, password }),
//         });
//         const data = await response.json();
//         if (!response.ok) {
//             return { success: false, message: data.error };
//         }
//         return { success: true };
//     }
// };
