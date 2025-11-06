class NoteApp {
    constructor() {
        this.baseURL = window.location.origin;
        this.notes = [];
        this.folders = [];
        this.currentNote = null;
        this.currentFolder = null;
        this.currentNoteFolder = null;
        this.filters = {
            search: '',
            favorite: false,
            folder: null,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        };
        this.isEditing = false;
        this.isMobile = window.innerWidth <= 768;
        
        // Initialize modules
        this.uiManager = new UIManager(this);
        this.dataManager = new DataManager(this);
        this.eventManager = new EventManager(this);
        this.mobileManager = new MobileManager(this);
        
        this.init();
    }

    async init() {
        this.checkAuth();
        this.initTheme();
        await this.initUserInterface();
        this.eventManager.setupEventListeners();
        this.dataManager.loadFolders();
        this.dataManager.loadNotes();
        this.uiManager.updateCounts();
    }

    async createTemplateNote() {
        const success = await NoteTemplate.createTemplateNote(this.baseURL, Auth.getToken(), {
            isFavorite: true
        });
        
        if (success) {
            this.dataManager.loadNotes();
            this.uiManager.updateCounts();
        }
    }

    checkAuth() {
        if (!Auth.isAuthenticated()) {
            window.location.href = '/login';
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    async initUserInterface() {
        // Set user name in the interface
        let user = Auth.getUser();
        
        // If user data is not in localStorage, fetch it from the API
        if (!user) {
            try {
                const response = await fetch(`${this.baseURL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${Auth.getToken()}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    user = data.user;
                    localStorage.setItem('user', JSON.stringify(user));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        
        if (user && user.name) {
            const usernameElement = document.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = user.name;
            }

            // Update user avatar with first letter of name
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.textContent = user.name.charAt(0).toUpperCase();
                userAvatar.innerHTML = user.name.charAt(0).toUpperCase();
            }
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // Utility methods
    stripMarkdown(text) {
        return text.replace(/[#*`~\[\]()]/g, '').trim();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
