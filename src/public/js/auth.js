// Authentication functionality
class Auth {
    constructor() {
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Tab switching for login/register
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and forms
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.form-content').forEach(form => form.classList.remove('active'));
        
        // Add active class to selected tab and form
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            console.warn('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                // Store user info for the app to use
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                window.location.href = '/';
            } else {
                console.warn(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            console.warn('An error occurred during login', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!name || !email || !password) {
            console.warn('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            console.warn('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                // Store user info for the app to use
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                
                // Create template note for new user
                await this.createTemplateNote(data.token);
                
                // Redirect immediately without notification
                window.location.href = '/';
            } else {
                console.warn(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            console.warn('An error occurred during registration', 'error');
        }
    }

    async createTemplateNote(token) {
        const success = await NoteTemplate.createTemplateNote(this.baseURL, token);
        if (!success) {
            console.error('Failed to create template note for new user');
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token && window.location.pathname === '/login') {
            window.location.href = '/';
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});
