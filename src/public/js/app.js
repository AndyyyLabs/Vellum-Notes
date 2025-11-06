
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

        const createFirstNoteBtn = document.getElementById('createFirstNoteBtn');
        if (createFirstNoteBtn) {
            createFirstNoteBtn.addEventListener('click', () => this.createNewNote());
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
        const fullScreenEditBtn = document.getElementById('fullScreenEditBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        if (fullScreenEditBtn) {
            fullScreenEditBtn.addEventListener('click', () => this.openFullScreenEditor());
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

        // Add swipe gesture support for mobile
        if (this.isMobile) {
            this.setupSwipeGestures();
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+N for new note
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }

            // Ctrl+S for save (when in full screen editor)
            if (e.ctrlKey && e.key === 's' && this.isEditing) {
                e.preventDefault();
                // Save is handled by the full screen editor
                if (window.markdownEditor && window.markdownEditor.saveNote) {
                    window.markdownEditor.saveNote();
                }
            }

            // Escape to close full screen editor
            if (e.key === 'Escape' && this.isEditing) {
                e.preventDefault();
                if (window.markdownEditor && window.markdownEditor.closeEditor) {
                    window.markdownEditor.closeEditor();
                }
            }

            // Escape to close mobile sidebar
            if (e.key === 'Escape' && this.isMobile) {
                this.closeMobileSidebar();
                this.closeMobileNote();
            }
        });
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
                    <i class="fas fa-folder-open" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
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
                    <i class="fas fa-folder" style="color: ${folder.color}"></i>
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
        const content = this.stripMarkdown(note.content).substring(0, 150);
        const isSelected = this.currentNote && this.currentNote._id === note._id;

        // Add folder badge if note has a folder
        const folderBadge = note.folder ? `
            <span class="note-folder" style="background-color: ${note.folder.color}15; color: ${note.folder.color}; border-color: ${note.folder.color}30;">
                <i class="fas fa-folder"></i>
                ${note.folder.name}
            </span>
        ` : '';

        return `
            <div class="note-card ${isSelected ? 'selected' : ''}" data-note-id="${note._id}">
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
                <div class="note-content">${this.escapeHtml(content)}${content.length >= 150 ? '...' : ''}</div>
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
            // Use marked.js to convert markdown to HTML
            const htmlContent = marked.parse(this.currentNote.content);
            notePreview.innerHTML = htmlContent;

            // Apply syntax highlighting
            notePreview.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
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
        const fullScreenEditBtn = document.getElementById('fullScreenEditBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        // Show full-screen edit button when note exists
        if (this.currentNote) {
            fullScreenEditBtn.style.display = 'inline-flex';
        } else {
            fullScreenEditBtn.style.display = 'none';
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
        this.currentNote = null;
        this.currentNoteFolder = null; // Reset folder state
        this.isEditing = true;

        // Open the full-screen CodeMirror editor for new note
        if (window.markdownEditor) {
            window.markdownEditor.openEditor(null);
        } else {
            // Fallback to old editor
            this.setupLegacyNewNote();
        }
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
        // Open the full-screen CodeMirror editor
        if (window.markdownEditor) {
            window.markdownEditor.openEditor(this.currentNote);
        } else {
            // Fallback to old editor if CodeMirror is not available
            this.setupLegacyEditMode();
        }
    }

    setupLegacyEditMode() {
        const noteTitle = document.getElementById('noteTitle');
        const notePreview = document.getElementById('notePreview');

        // Make title editable
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = 'noteTitleInput';
        titleInput.className = 'note-title-input';
        titleInput.placeholder = 'Enter note title...';
        titleInput.value = noteTitle.textContent;

        noteTitle.innerHTML = '';
        noteTitle.appendChild(titleInput);

        // Create textarea for editing
        const textarea = document.createElement('textarea');
        textarea.id = 'noteContentTextarea';
        textarea.className = 'note-content-textarea';
        textarea.placeholder = 'Write your note in markdown...';
        textarea.value = this.currentNote ? this.currentNote.content : '';

        notePreview.innerHTML = '';
        notePreview.appendChild(textarea);

        // Focus on title input first
        setTimeout(() => {
            titleInput.focus();
            titleInput.select();
        }, 100);
    }

    // toggleEditMode removed - editing is now only done through full screen editor

    async saveNote() {
        const titleInput = document.getElementById('noteTitleInput');
        const title = titleInput ? titleInput.value.trim() : document.getElementById('noteTitle').textContent;
        const textarea = document.getElementById('noteContentTextarea');
        const content = textarea ? textarea.value.trim() : '';
        const selectedFolder = this.currentNoteFolder || null;

        if (!title) {
            console.warn('Note title is required');
            return;
        }

        if (!content) {
            console.warn('Note content is required');
            return;
        }

        let processedContent = content;

        try {
            const noteData = {
                title,
                content: processedContent,
                folder: selectedFolder,
                isFavorite: this.currentNote ? this.currentNote.isFavorite : false
            };

            const url = this.currentNote
                ? `${this.baseURL}/api/v1/notes/${this.currentNote._id}`
                : `${this.baseURL}/api/v1/notes`;

            const method = this.currentNote ? 'PUT' : 'POST';

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
                console.log(this.currentNote ? 'Note updated successfully!' : 'Note created successfully!');

                // Update current note with saved data
                this.currentNote = savedNote;
                this.isEditing = false;

                // Reload notes to update the list
                await this.loadNotes();
                this.loadFolders();
                this.updateCounts();

                // Update display
                this.displayNote();
                this.updateContentActions();
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

    // toggleFavorite method removed - favorites functionality disabled

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

    // showNotification method removed - notifications disabled

    // Tag Management Methods - REMOVED (replaced with new system)
    // addTag(), removeTag(), getCurrentTags(), renderCurrentTags() methods removed



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

            const response = await fetch(`${this.baseURL}/api/v1/notes/${this.currentNote._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                const savedNote = await response.json();
                this.currentNote = savedNote;

                // Reload notes to update the list
                await this.loadNotes();
                this.loadFolders();
                this.updateCounts();

                // Update display
                this.displayNote();
                this.updateContentActions();
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

    onEditorClosed() {
        // Called when the full-screen editor is closed
        this.isEditing = false;
        this.updateContentActions();
        
        // Refresh the current note display if we have one
        if (this.currentNote) {
            this.displayNote();
        } else {
            // Show placeholder if no note is selected
            document.getElementById('contentPlaceholder').style.display = 'flex';
            document.getElementById('noteContent').style.display = 'none';
        }
    }

    openFullScreenEditor() {
        if (window.markdownEditor) {
            window.markdownEditor.openEditor(this.currentNote);
        }
    }

    setupSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        const maxVerticalSwipe = 30; // Maximum vertical movement to consider it a horizontal swipe

        // Only handle horizontal swipes
        if (Math.abs(deltaY) > maxVerticalSwipe) return;

        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');

        // Swipe right to open sidebar (from left edge)
        if (deltaX > minSwipeDistance && startX < 50 && sidebar && !sidebar.classList.contains('open')) {
            this.openMobileSidebar();
        }
        // Swipe left to close sidebar
        else if (deltaX < -minSwipeDistance && sidebar && sidebar.classList.contains('open')) {
            this.closeMobileSidebar();
        }
        // Swipe right to close content area (go back to notes)
        else if (deltaX > minSwipeDistance && contentArea && contentArea.classList.contains('open')) {
            this.closeMobileNote();
        }
    }


}

// Initialize the application
let noteApp;
document.addEventListener('DOMContentLoaded', () => {
    noteApp = new NoteApp();
});
