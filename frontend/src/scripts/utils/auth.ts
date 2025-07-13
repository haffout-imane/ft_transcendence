import { renderLoginForm } from '../components/forms.js';
import { showCustomAlert } from '../components/notif.js';
import { handleCode2fa } from './2fa.js';
interface authResponse {
    success: boolean;
    message: string;
}


export const authService = {
    async login(email: string, password: string) {
        try {
            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);
        
            let result: authResponse;
            try {
                result = await response.json();
            }
            catch (error) {
                console.error('Error parsing JSON:', error);
                return { success: false, message: "Invalid response from server." };
            }

            if (result.success) {
                
                
                try {
                    const response = await fetch(`/api/checktwofa`, {
                        method: 'GET',
                        credentials: 'include', // Include cookies in the request
                    });
                    if (!response.ok)
                        throw new Error(`HTTP error! status: ${response.status}`);
                    const twofaEnabled = await response.json();
                    if (twofaEnabled.success) // means we should give him a window where he can enter the code
                    {
                        let result = await handleCode2fa(); // Show the 2FA input window
                        if (result) {
                            showCustomAlert("Login successful");
                            authToken.login(); // Set the authentication status to true
                            return { success: true, message: "Login successful" };
                        }
                    }
                    else {
                        showCustomAlert("Login successful");
                        authToken.login(); // Set the authentication status to true
                        return { success: true, message: "Login successful." };
                    }
                }
                catch (error) {
                    console.error('Error checking 2FA status:', error);
                    return { success: false, message: "Network or server error." };
                }


                
            } 
            else {
                return {
                    success: false,
                    message: result.message || "Login failed."
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: "Network or server error." };
        }
    },

    async register(username: string, email: string, password: string) {
        try {
            const response = await fetch(`/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            let result: authResponse;
            try {
                result = await response.json();
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return { success: false, message: "Invalid response from server." };
            }

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || "Registration failed." };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: "Network or server error." };
        }
    },

    async logout() {
        try {
            const response = await fetch(`/api/logout`, {
                method: 'POST', 
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

            authToken.logout(); // Set the authentication status to false
        }
        catch (error) {
            console.error('Logout error:', error);
            return { success: false, message: "Network or server error." };
        }

    return { success: true };
    }

};
  
function validEmail(email: string): boolean {
    if (!email)
        return false; // Email is required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        return false;
    if (email.length > 100)
        return false;
    return true;
}

export function setupLoginForm() {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        // Prevent the default form submission behavior (which would reload the page)

        btn.disabled = true; // Disable the button to prevent multiple submissions

        const emailInput = document.getElementById('login-email') as HTMLInputElement;
        const passwordInput = document.getElementById('login-password') as HTMLInputElement;
        // Get references to the email and password input fields, and tell TypeScript they're HTMLInputElements
    
        const email = emailInput.value.trim(); 
        const password = passwordInput.value;
        // Extract the values from the inputs
        // 'trim()' removes whitespace from the beginning and end of the email
    
        if (!email || !password) {
            showCustomAlert("Please fill in all fields.");
            btn.disabled = false; // Re-enable the button
            return;
        }

        if (!validEmail(email)) {
            showCustomAlert("Please enter a valid email address.");
            btn.disabled = false; // Re-enable the button
            return;
        }
    
        const result = await authService.login(email, password);
        // Call the login function from the authService and wait for the result
    
        if (result.success) {
            btn.disabled = false; // Re-enable the button          
            window.location.href = '/home';
            // Redirect to the homepage (or dashboard) after successful login
        } else {
            // alert("Login failed. Please check your credentials.");
            showCustomAlert(result.message || "Login failed. Please check your credentials.");
            btn.disabled = false; // Re-enable the button
            passwordInput.value = ''; // Clear the password field for security
        }

    });
    
}

function validUsername(username: string): boolean {
    if (!username)
    {
        showCustomAlert("Username is required.");
        return false; // Username is required
    }
    
    if (username.length < 3 || username.length > 30)
    {
        showCustomAlert("Username must be between 3 and 30 characters long.");
        return false; // Length must be between 3 and 30 characters
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username))
    {
        showCustomAlert("Username can only contain letters, numbers, and underscores.");
        return false; // Only letters, numbers, and underscores are allowed
    }
    return true; // If all checks pass, the username is valid
}


function validPassword(password: string): boolean {
    if (!password) {
        showCustomAlert("Password is required.");
        return false; // Password is required
    }
    
    if (password.length < 8) {
        showCustomAlert("Password must be at least 8 characters long.");
        return false; // Length must be at least 8 characters
    }
    
    // password must contain at least one uppercase letter, one lowercase letter, one number
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        showCustomAlert("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
        return false; // Must contain at least one uppercase letter, one lowercase letter, and one number
    }
    
    return true; // If all checks pass, the password is valid
}

export function setupRegisterForm() {
    const form = document.getElementById('register-form') as HTMLFormElement;
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        btn.disabled = true; // Disable the button to prevent multiple submissions

        const username = (document.getElementById('register-username') as HTMLInputElement).value.trim();
        const email = (document.getElementById('register-email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('register-password') as HTMLInputElement).value;
        const confirm = (document.getElementById('register-confirm') as HTMLInputElement).value;

        // Username validation
        if (!validUsername(username)) {
            btn.disabled = false; // Re-enable the button
            return;
        }

        // Email validation
        if (!validEmail(email)) {
            showCustomAlert("Please enter a valid email address.");
            btn.disabled = false; // Re-enable the button
            return;
        }

        // Password validation
        if (!validPassword(password)) {
            btn.disabled = false; // Re-enable the button
            return;
        }


        if (password !== confirm) {
            showCustomAlert("Passwords doesn't match!");
            btn.disabled = false; // Re-enable the button
            return;
        }

        const result = await authService.register(username, email, password);
        if (result.success) {
            showCustomAlert('Registration successful! Please login.');
            renderLoginForm();
            document.querySelector('.auth-tab[data-tab="login"]')?.classList.add('active');
            document.querySelector('.auth-tab[data-tab="register"]')?.classList.remove('active');

        }
        else
        {
            showCustomAlert(result.message || 'Registration failed. Please try again.');
            btn.disabled = false; // Re-enable the button

        }
    });
}

export const authToken = {

    isAuthenticated: false, // Default authentication status

    checkAuth(): boolean {  
        return this.isAuthenticated;
    },

    login(): void {
        this.isAuthenticated = true; // Set the auth status to true
    },

    logout(): void {
        this.isAuthenticated = false; // Set the auth status to false
    }
};

