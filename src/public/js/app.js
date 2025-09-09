
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
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this.init();
    }

    async init() {
        this.checkAuth();
        this.initTheme();
        await this.initUserInterface();
        this.setupEventListeners();
        this.loadFolders();
        this.loadNotes();
        this.updateCounts();

        // Set up periodic token expiry check
        this.setupTokenExpiryCheck();
    }

    setupTokenExpiryCheck() {
        // Check token expiry every 30 seconds
        setInterval(() => {
            if (!Auth.isAuthenticated()) {
                window.location.href = '/login';
            }
        }, 30000);
    }

    async createTemplateNote() {
        const success = await NoteTemplate.createTemplateNote(this.baseURL, Auth.getToken(), {
            isFavorite: true
        });

        if (success) {
            this.loadNotes();
            this.updateCounts();
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

        // Update theme toggle text based on current theme
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const textSpan = themeToggleBtn.querySelector('span');
            if (textSpan) {
                textSpan.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
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

        if (user) {
            // Update username
            if (user.name) {
                const usernameElement = document.querySelector('.username');
                if (usernameElement) {
                    usernameElement.textContent = user.name;
                }

                // Update user avatar with first letter of name
                const userAvatar = document.querySelector('.user-avatar');
                if (userAvatar) {
                    userAvatar.innerHTML = user.name.charAt(0).toUpperCase();
                }
            }

            // Update user email
            if (user.email) {
                const userEmailElement = document.querySelector('.user-email');
                if (userEmailElement) {
                    userEmailElement.textContent = user.email;
                }
            }
        }
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.debounce(() => this.loadNotes(), 300);
            });
        }

        // Quick links navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.getAttribute('data-filter');
                this.handleQuickLinkFilter(filter);
            });
        });

        // New note button
        const newNoteBtn = document.getElementById('newNoteBtn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.createNewNote());
        }

        const createTemplateBtn = document.getElementById('createTemplateBtn');
        if (createTemplateBtn) {
            createTemplateBtn.addEventListener('click', () => this.createTemplateNote());
        }

        // Theme toggle
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }

        // Content area actions
        const editNoteBtn = document.getElementById('editNoteBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        if (editNoteBtn) {
            editNoteBtn.addEventListener('click', () => this.toggleEditMode());
        }
        if (folderBtn) {
            folderBtn.addEventListener('click', () => this.openNoteFolderModal());
        }
        if (deleteNoteBtn) {
            deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        }

        // Folder events
        const newFolderBtn = document.getElementById('newFolderBtn');
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => this.createFolder());
        }

        // Folder modal events
        const folderModal = document.getElementById('folderModal');
        const closeFolderModal = document.getElementById('closeFolderModal');
        const cancelFolderBtn = document.getElementById('cancelFolderBtn');
        const folderForm = document.getElementById('folderForm');

        if (closeFolderModal) {
            closeFolderModal.addEventListener('click', () => this.closeFolderModal());
        }

        if (cancelFolderBtn) {
            cancelFolderBtn.addEventListener('click', () => this.closeFolderModal());
        }

        if (folderForm) {
            folderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFolder();
            });
        }

        // Close modal when clicking outside
        if (folderModal) {
            folderModal.addEventListener('click', (e) => {
                if (e.target === folderModal) {
                    this.closeFolderModal();
                }
            });
        }

        // Note folder modal events
        const noteFolderModal = document.getElementById('noteFolderModal');
        const closeNoteFolderModal = document.getElementById('closeNoteFolderModal');
        const closeNoteFolderModalBtn = document.getElementById('closeNoteFolderModalBtn');
        const saveNoteFolderBtn = document.getElementById('saveNoteFolderBtn');

        if (closeNoteFolderModal) {
            closeNoteFolderModal.addEventListener('click', () => this.closeNoteFolderModal());
        }

        if (closeNoteFolderModalBtn) {
            closeNoteFolderModalBtn.addEventListener('click', () => this.closeNoteFolderModal());
        }

        if (saveNoteFolderBtn) {
            saveNoteFolderBtn.addEventListener('click', () => this.saveNoteFolder());
        }

        if (noteFolderModal) {
            noteFolderModal.addEventListener('click', (e) => {
                if (e.target === noteFolderModal) {
                    this.closeNoteFolderModal();
                }
            });
        }



        // Mobile navigation
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.openMobileSidebar());
        }

        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', () => this.closeMobileNote());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.handleResize();
        });



        // Prevent zoom on double tap (iOS)
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);


    }

    handleQuickLinkFilter(filter) {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Clear folder selection
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('active');
        });
        this.currentFolder = null;
        this.filters.folder = null;

        // Apply filter - only 'all' filter remains
        this.filters.favorite = false;
        this.filters.sortBy = 'updatedAt';
        this.filters.sortOrder = 'desc';

        this.loadNotes();
    }

    async loadNotes() {
        try {
            const params = new URLSearchParams();
            if (this.filters.search) params.append('search', this.filters.search);
            if (this.filters.favorite) params.append('favorite', 'true');
            if (this.filters.folder) params.append('folder', this.filters.folder);
            if (this.filters.sortBy) params.append('sortBy', this.filters.sortBy);
            if (this.filters.sortOrder) params.append('sortOrder', this.filters.sortOrder);

            const response = await fetch(`${this.baseURL}/api/v1/notes?${params}`, {
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                this.notes = await response.json();
                this.renderNotes();
                this.updateCounts();
            } else {
                throw new Error('Failed to load notes');
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }



    async loadFolders() {
        try {
            const response = await fetch(`${this.baseURL}/api/v1/folders`, {
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                this.folders = await response.json();
                this.renderFolders();
            }
        } catch (error) {
            console.error('Error loading folders:', error);
        }
    }

    renderFolders() {
        const container = document.getElementById('foldersContainer');
        if (!container) return;

        if (this.folders.length === 0) {
            container.innerHTML = `
                <div class="empty-folders" style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">
                    <i class="fa-regular fa-folder"</i>
                    <div>No folders yet</div>
                </div>`;
            return;
        }

        // Sort folders with newest first (created date)
        const sortedFolders = [...this.folders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = sortedFolders.map(folder => this.createFolderItem(folder)).join('');
        this.setupFolderEvents();
    }

    createFolderItem(folder) {
        const isActive = this.currentFolder && this.currentFolder._id === folder._id;
        const noteCount = this.notes.filter(note => note.folder && note.folder._id === folder._id).length;

        return `
            <div class="folder-item ${isActive ? 'active' : ''}" data-folder-id="${folder._id}">
                <span class="folder-label">
                    <i class="fa-regular fa-folder" style="color: ${folder.color}"></i>
                    ${folder.name}
                </span>
                <span class="folder-count" id="folder-count-${folder._id}">${noteCount}</span>
                <div class="folder-item-actions">
                    <button class="folder-action-btn edit" title="Edit folder">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="folder-action-btn delete" title="Delete folder">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    setupFolderEvents() {
        const folderItems = document.querySelectorAll('.folder-item');

        folderItems.forEach(item => {
            const folderId = item.dataset.folderId;

            // Remove existing event listeners by cloning the element
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            // Folder click event
            newItem.addEventListener('click', (e) => {
                if (!e.target.closest('.folder-item-actions')) {
                    this.selectFolder(folderId);
                }
            });

            // Edit button
            const editBtn = newItem.querySelector('.folder-action-btn.edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editFolder(folderId);
                });
            }

            // Delete button
            const deleteBtn = newItem.querySelector('.folder-action-btn.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteFolder(folderId);
                });
            }
        });
    }

    selectFolder(folderId) {
        // Remove active class from all folders
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected folder
        const selectedItem = document.querySelector(`[data-folder-id="${folderId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        this.currentFolder = this.folders.find(f => f._id === folderId);
        this.filters.folder = folderId;
        this.loadNotes();
    }

    async createFolder() {
        this.openFolderModal();
    }

    async editFolder(folderId) {
        const folder = this.folders.find(f => f._id === folderId);
        if (folder) {
            this.openFolderModal(folder);
        }
    }

    openFolderModal(folder = null) {
        const modal = document.getElementById('folderModal');
        const title = document.getElementById('folderModalTitle');
        const form = document.getElementById('folderForm');
        const nameInput = document.getElementById('folderName');
        const descriptionInput = document.getElementById('folderDescription');
        const colorInput = document.getElementById('folderColor');

        if (folder) {
            title.textContent = 'Edit Folder';
            nameInput.value = folder.name;
            descriptionInput.value = folder.description || '';
            colorInput.value = folder.color;
            form.dataset.folderId = folder._id;
        } else {
            title.textContent = 'Create New Folder';
            form.reset();
            delete form.dataset.folderId;
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        nameInput.focus();
    }

    closeFolderModal() {
        const modal = document.getElementById('folderModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    async saveFolder() {
        const form = document.getElementById('folderForm');
        const folderId = form.dataset.folderId;
        const formData = new FormData(form);

        const folderData = {
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color')
        };

        try {
            const url = folderId
                ? `${this.baseURL}/api/v1/folders/${folderId}`
                : `${this.baseURL}/api/v1/folders`;

            const response = await fetch(url, {
                method: folderId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(folderData)
            });

            if (response.ok) {
                this.closeFolderModal();
                await this.loadFolders();
                // Folder saved successfully
            } else {
                const error = await response.json();
                console.error('Error saving folder:', error.message);
            }
        } catch (error) {
            console.error('Error saving folder:', error);
            // Error logged above
        }
    }

    async deleteFolder(folderId) {
        if (!confirm('Are you sure you want to delete this folder? Notes in this folder will be moved to "No Folder".')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/v1/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                await this.loadFolders();
                await this.loadNotes();
                // Folder deleted successfully

                // Clear folder filter if the deleted folder was selected
                if (this.currentFolder && this.currentFolder._id === folderId) {
                    this.currentFolder = null;
                    this.filters.folder = null;
                }
            } else {
                const error = await response.json();
                console.error('Error deleting folder:', error.message);
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
            // Error logged above
        }
    }

    updateCounts() {
        const allNotesCount = document.getElementById('allNotesCount');

        if (allNotesCount) {
            allNotesCount.textContent = this.notes.length;
        }

        // Update folder counts live
        this.updateFolderCounts();
    }

    updateFolderCounts() {
        this.folders.forEach(folder => {
            const noteCount = this.notes.filter(note => note.folder && note.folder._id === folder._id).length;
            const countElement = document.getElementById(`folder-count-${folder._id}`);
            if (countElement) {
                countElement.textContent = noteCount;
            }
        });
    }

    renderNotes() {
        const container = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyState');

        if (!container) return;

        if (this.notes.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        container.innerHTML = this.notes.map(note => this.createNoteCard(note)).join('');

        // Add click events to note cards
        const noteCards = container.querySelectorAll('.note-card');
        noteCards.forEach(card => {
            card.addEventListener('click', () => {
                const noteId = card.dataset.noteId;
                this.selectNote(noteId);
            });
        });

        // Add action button events
        this.setupNoteActionEvents();
    }

    createNoteCard(note) {
        const date = new Date(note.updatedAt).toLocaleDateString();
        const content = this.stripMarkdown(note.content).substring(0, 220);
        const isSelected = this.currentNote && this.currentNote._id === note._id;

        // Add folder badge if note has a folder
        const folderBadge = note.folder ? `
            <span class="note-folder" style="background-color: ${note.folder.color}15; color: ${note.folder.color}; border-color: ${note.folder.color}30;">
                <i class="fas fa-folder"></i>
                ${note.folder.name}
            </span>
        ` : '';

        const folderColorStyle = note.folder ? ` style="--folder-color: ${note.folder.color};"` : '';

        return `
            <div class="note-card ${isSelected ? 'selected' : ''}" data-note-id="${note._id}"${folderColorStyle}>
                <div class="note-card-header">
                    <div>
                        <h3 class="note-title">
                            ${this.escapeHtml(note.title)}
                        </h3>
                        <div class="note-meta">
                            <span class="note-date">
                                <i class="fas fa-calendar"></i>
                                ${date}
                            </span>
                            ${folderBadge}
                        </div>
                    </div>
                    <div class="note-actions-right">
                        <button class="action-btn delete-btn" data-note-id="${note._id}" title="Delete note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content note-content--faded">${this.escapeHtml(content)}${content.length >= 220 ? '...' : ''}</div>
            </div>
        `;
    }

    setupNoteActionEvents() {
        // Delete buttons
        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNote(btn.dataset.noteId);
            });
        });
    }

    selectNote(noteId) {
        this.currentNote = this.notes.find(n => n._id === noteId);
        this.isEditing = false;

        // Set current note folder
        this.currentNoteFolder = this.currentNote && this.currentNote.folder ? this.currentNote.folder._id : null;

        // Update selected state in note cards
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-note-id="${noteId}"]`).classList.add('selected');

        this.displayNote();
        this.updateContentActions();

        // On mobile, show the content area
        if (this.isMobile) {
            this.openMobileNote();
        }
    }

    displayNote() {
        if (!this.currentNote) {
            document.getElementById('contentPlaceholder').style.display = 'flex';
            document.getElementById('noteContent').style.display = 'none';
            return;
        }

        document.getElementById('contentPlaceholder').style.display = 'none';
        document.getElementById('noteContent').style.display = 'block';

        // Update note content
        document.getElementById('noteTitle').textContent = this.currentNote.title;
        document.getElementById('noteDate').textContent = `Last edited: ${new Date(this.currentNote.updatedAt).toLocaleDateString()}`;

        // Update folder display
        this.displayNoteFolder();

        // Render note content
        const notePreview = document.getElementById('notePreview');
        if (this.currentNote.content) {
            // Display rich text content directly (it's already HTML)
            notePreview.innerHTML = this.currentNote.content;
        } else {
            notePreview.innerHTML = '<p class="text-muted">No content</p>';
        }

        // Update content actions
        this.updateContentActions();
    }

    displayNoteFolder() {
        const noteFolderContainer = document.getElementById('noteFolder');
        if (!noteFolderContainer) return;

        if (this.currentNote && this.currentNote.folder) {
            const folderDisplay = `
                <span class="note-folder-label">Folder: </span>
                <span class="note-folder" style="background-color: ${this.currentNote.folder.color}15; color: ${this.currentNote.folder.color}; border-color: ${this.currentNote.folder.color}30;">
                    <i class="fas fa-folder"></i>
                    ${this.currentNote.folder.name}
                </span>
            `;
            noteFolderContainer.innerHTML = folderDisplay;
            noteFolderContainer.style.display = 'block';
        } else {
            noteFolderContainer.innerHTML = '<span class="note-folder-label">Folder: None</span>';
            noteFolderContainer.style.display = 'block';
        }
    }

    updateContentActions() {
        const editNoteBtn = document.getElementById('editNoteBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        // Show edit button when creating new note or when note exists
        if (this.currentNote || this.isEditing) {
            editNoteBtn.style.display = 'inline-flex';
        } else {
            editNoteBtn.style.display = 'none';
        }

        // Show folder button when editing or when note exists
        if (this.currentNote || this.isEditing) {
            folderBtn.style.display = 'inline-flex';
        } else {
            folderBtn.style.display = 'none';
        }

        // Only show delete button when a note exists (not when creating new)
        if (this.currentNote) {
            deleteNoteBtn.style.display = 'inline-flex';
        } else {
            deleteNoteBtn.style.display = 'none';
        }
    }

    createNewNote() {
        // Create a temporary note object for new notes
        const tempNote = {
            _id: 'temp-' + Date.now(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            folder: null,
            isTemplate: false
        };

        // Add to notes array at the beginning
        this.notes.unshift(tempNote);
        this.currentNote = tempNote;
        this.currentNoteFolder = null;
        this.isEditing = true;

        // Update UI immediately
        this.renderNotes();
        this.updateCounts();

        // Use the legacy editor for new notes
        this.setupLegacyNewNote();
    }

    setupLegacyNewNote() {
        // Show placeholder for new note
        const contentPlaceholder = document.getElementById('contentPlaceholder');
        const noteContent = document.getElementById('noteContent');

        contentPlaceholder.style.display = 'none';
        noteContent.style.display = 'block';

        // Clear content and set up for editing
        document.getElementById('noteTitle').textContent = '';
        document.getElementById('noteDate').textContent = `Last edited: ${new Date().toLocaleDateString()}`;
        document.getElementById('notePreview').innerHTML = '<p class="text-muted">Start writing your note...</p>';

        // Clear folder display
        const noteFolderContainer = document.getElementById('noteFolder');
        if (noteFolderContainer) {
            noteFolderContainer.innerHTML = '<span class="note-folder-label">Folder: None</span>';
            noteFolderContainer.style.display = 'block';
        }

        // Update actions
        this.updateContentActions();

        // Set up edit mode directly
        this.setupLegacyEditMode();

        // On mobile, show the content area
        if (this.isMobile) {
            this.openMobileNote();
        }
    }

    setupEditMode() {
        // Use the legacy editor
        this.setupLegacyEditMode();
    }

    setupLegacyEditMode() {
        const editNoteBtn = document.getElementById('editNoteBtn');
        const noteTitle = document.getElementById('noteTitle');
        const notePreview = document.getElementById('notePreview');

        editNoteBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        editNoteBtn.classList.add('btn-primary');
        editNoteBtn.classList.remove('btn-secondary');

        // Make title editable
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'noteTitleInput';
        titleInput.className = 'note-title-input';
        titleInput.placeholder = 'Enter note title...';
        titleInput.value = noteTitle.textContent;

        noteTitle.innerHTML = '';
        noteTitle.appendChild(titleInput);

        // Build rich text editor
        notePreview.innerHTML = '';

        const editorContainer = document.createElement('div');
        editorContainer.className = 'rich-text-editor';

        const toolbar = document.createElement('div');
        toolbar.className = 'rich-text-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-value="H1" title="Heading 1"><i class="fas fa-heading"></i>1</button>
                <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-value="H2" title="Heading 2"><i class="fas fa-heading"></i>2</button>
                <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-value="P" title="Paragraph"><i class="fas fa-paragraph"></i></button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)"><i class="fas fa-bold"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)"><i class="fas fa-italic"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)"><i class="fas fa-underline"></i></button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-cmd="insertUnorderedList" title="Bulleted List"><i class="fas fa-list-ul"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered List"><i class="fas fa-list-ol"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="outdent" title="Outdent"><i class="fas fa-outdent"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="indent" title="Indent"><i class="fas fa-indent"></i></button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-cmd="formatBlock" data-value="BLOCKQUOTE" title="Quote"><i class="fas fa-quote-right"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="insertHorizontalRule" title="Divider"><i class="fas fa-minus"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="removeFormat" title="Clear Formatting"><i class="fas fa-eraser"></i></button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-cmd="undo" title="Undo (Ctrl+Z)"><i class="fas fa-rotate-left"></i></button>
                <button type="button" class="toolbar-btn" data-cmd="redo" title="Redo (Ctrl+Y)"><i class="fas fa-rotate-right"></i></button>
            </div>
        `;

        const editor = document.createElement('div');
        editor.id = 'noteContentEditor';
        editor.className = 'note-content-editor';
        editor.contentEditable = 'true';
        editor.setAttribute('role', 'textbox');
        editor.setAttribute('aria-multiline', 'true');
        editor.innerHTML = this.currentNote ? (this.currentNote.content || '') : '';

        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editor);
        notePreview.appendChild(editorContainer);

        // Toolbar events
        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.getAttribute('data-cmd');
                const val = btn.getAttribute('data-value');
                if (cmd === 'formatBlock') {
                    document.execCommand('formatBlock', false, val);
                } else {
                    document.execCommand(cmd, false, null);
                }
                editor.focus();
            });
        });

        // Keyboard shortcuts
        editor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                if (e.key.toLowerCase() === 'b') { e.preventDefault(); document.execCommand('bold'); }
                if (e.key.toLowerCase() === 'i') { e.preventDefault(); document.execCommand('italic'); }
                if (e.key.toLowerCase() === 'u') { e.preventDefault(); document.execCommand('underline'); }
                if (e.key.toLowerCase() === 's') { e.preventDefault(); this.saveNote(); }
            }
        });

        // Mark as editing and focus on title input
        this.isEditing = true;
        setTimeout(() => {
            titleInput.focus();
            titleInput.select();
        }, 100);
    }

    toggleEditMode() {
        // Allow toggling edit mode if we have a current note OR if we're already editing (for new notes)
        if (!this.currentNote && !this.isEditing) return;

        if (this.isEditing) {
            // If already editing, save the note
            this.saveNote();
        } else {
            // Enter edit mode
            this.isEditing = true;
            this.setupLegacyEditMode();
        }
    }

    async saveNote() {
        const titleInput = document.getElementById('noteTitleInput');
        const title = titleInput ? titleInput.value.trim() : document.getElementById('noteTitle').textContent;
        const editor = document.getElementById('noteContentEditor');
        const content = editor ? editor.innerHTML.trim() : '';
        const selectedFolder = this.currentNoteFolder || null;

        if (!title) {
            console.warn('Note title is required');
            return;
        }

        if (!content) {
            console.warn('Note content is required');
            return;
        }

        try {
            const noteData = {
                title,
                content: content,
                folder: selectedFolder,
                isFavorite: this.currentNote ? this.currentNote.isFavorite : false
            };

            const isNewNote = this.currentNote && this.currentNote._id.startsWith('temp-');

            const url = isNewNote
                ? `${this.baseURL}/api/v1/notes`
                : `${this.baseURL}/api/v1/notes/${this.currentNote._id}`;

            const method = isNewNote ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                const savedNote = await response.json();
                console.log(isNewNote ? 'Note created successfully!' : 'Note updated successfully!');

                if (isNewNote) {
                    // For new notes, refresh the notes list and select the new note
                    await this.loadNotes();
                    this.selectNote(savedNote._id);
                    this.updateCounts();
                    // Exit edit mode and restore button label
                    this.isEditing = false;
                    const editNoteBtn = document.getElementById('editNoteBtn');
                    if (editNoteBtn) {
                        editNoteBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                        editNoteBtn.classList.remove('btn-primary');
                        editNoteBtn.classList.add('btn-secondary');
                    }
                } else {
                    // Update the existing note in the array
                    const index = this.notes.findIndex(n => n._id === this.currentNote._id);
                    if (index !== -1) {
                        this.notes[index] = savedNote;
                    }

                    // Update current note with saved data
                    this.currentNote = savedNote;
                    this.isEditing = false;

                    // Update UI immediately
                    this.renderNotes();
                    this.updateCounts();
                    this.displayNote();
                    this.updateContentActions();
                    // Restore button label
                    const editNoteBtn = document.getElementById('editNoteBtn');
                    if (editNoteBtn) {
                        editNoteBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
                        editNoteBtn.classList.remove('btn-primary');
                        editNoteBtn.classList.add('btn-secondary');
                    }
                }
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    }

    // toggleNoteFavorite method removed - favorites functionality disabled

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/v1/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {

                // Clear current note if it's the one being deleted
                if (this.currentNote && this.currentNote._id === noteId) {
                    this.currentNote = null;
                    this.isEditing = false;
                    this.displayNote();
                    this.updateContentActions();
                }

                this.loadNotes();
                this.updateCounts();
            } else {
                throw new Error('Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);

        }
    }

    deleteCurrentNote() {
        if (this.currentNote) {
            this.deleteNote(this.currentNote._id);
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update theme toggle text
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            const textSpan = themeToggleBtn.querySelector('span');
            if (textSpan) {
                textSpan.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            }
        }
    }

    // Utility functions
    stripMarkdown(text) {
        return text.replace(/[#*`\[\]()]/g, '').replace(/\n/g, ' ');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    cancelEdit() {
        if (!this.isEditing) return;

        if (this.currentNote) {
            // If editing existing note, revert to view mode
            this.isEditing = false;
            this.displayNote();
        } else {
            // If creating new note, go back to placeholder
            this.isEditing = false;
            document.getElementById('contentPlaceholder').style.display = 'flex';
            document.getElementById('noteContent').style.display = 'none';
        }

        // Reset current note folder
        this.currentNoteFolder = null;

        // Update edit button
        const editNoteBtn = document.getElementById('editNoteBtn');
        editNoteBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editNoteBtn.classList.remove('btn-primary');
        editNoteBtn.classList.add('btn-secondary');

        console.log('Edit cancelled');
    }



    openNoteFolderModal() {
        const modal = document.getElementById('noteFolderModal');
        const folderSelect = document.getElementById('noteFolderSelect');

        // Populate folder selector
        this.populateFolderSelector();

        // Set current folder if note has one
        if (this.currentNote && this.currentNote.folder) {
            folderSelect.value = this.currentNote.folder._id;
            this.currentNoteFolder = this.currentNote.folder._id;
        } else if (this.currentNoteFolder) {
            // For notes being edited that already have a folder assigned
            folderSelect.value = this.currentNoteFolder;
        } else {
            // For new notes or notes without folders, start with no folder selected
            folderSelect.value = '';
            this.currentNoteFolder = null;
        }

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeNoteFolderModal() {
        const modal = document.getElementById('noteFolderModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    saveNoteFolder() {
        const folderSelect = document.getElementById('noteFolderSelect');
        this.currentNoteFolder = folderSelect.value || null;

        this.closeNoteFolderModal();

        // Auto-save the note if we have a current note
        if (this.currentNote) {
            this.saveNoteWithCurrentData();
            console.log('Folder updated');
        } else {
            // For new notes being created, just show folder selected message
            const selectedFolderName = folderSelect.value ?
                folderSelect.options[folderSelect.selectedIndex].text : 'No folder';
            console.log(`Folder selected: ${selectedFolderName}`);
        }
    }

    populateFolderSelector() {
        const folderSelect = document.getElementById('noteFolderSelect');
        if (!folderSelect) return;

        // Clear existing options except "No Folder"
        folderSelect.innerHTML = '<option value="">No Folder</option>';

        // Add folder options
        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder._id;
            option.textContent = folder.name;
            option.style.color = folder.color;
            folderSelect.appendChild(option);
        });
    }

    async saveNoteWithCurrentData() {
        if (!this.currentNote) return;

        const selectedFolder = this.currentNoteFolder || null;

        try {
            const noteData = {
                title: this.currentNote.title,
                content: this.currentNote.content,
                folder: selectedFolder,
                isFavorite: this.currentNote.isFavorite
            };

            const isNewNote = this.currentNote._id.startsWith('temp-');

            const url = isNewNote
                ? `${this.baseURL}/api/v1/notes`
                : `${this.baseURL}/api/v1/notes/${this.currentNote._id}`;

            const method = isNewNote ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                const savedNote = await response.json();

                if (isNewNote) {
                    // For new notes, refresh the notes list and select the new note
                    await this.loadNotes();
                    this.selectNote(savedNote._id);
                    this.updateCounts();
                } else {
                    // Update the existing note in the array
                    const index = this.notes.findIndex(n => n._id === this.currentNote._id);
                    if (index !== -1) {
                        this.notes[index] = savedNote;
                    }

                    this.currentNote = savedNote;

                    // Update UI immediately
                    this.renderNotes();
                    this.updateCounts();
                    this.displayNote();
                    this.updateContentActions();
                }
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            console.error('Failed to save note');
        }
    }

    // Mobile Navigation Methods
    openMobileSidebar() {
        if (!this.isMobile) return;

        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar && overlay) {
            sidebar.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (sidebar && overlay) {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    openMobileNote() {
        if (!this.isMobile) return;

        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    closeMobileNote() {
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    handleResize() {
        // Close mobile elements when switching to desktop
        if (!this.isMobile) {
            this.closeMobileSidebar();
            this.closeMobileNote();
            document.body.style.overflow = '';
        }
    }
}

// Initialize the application
let noteApp;
document.addEventListener('DOMContentLoaded', () => {
    noteApp = new NoteApp();
});
