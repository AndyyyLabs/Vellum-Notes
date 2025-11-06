class EventManager {
    constructor(app) {
        this.app = app;
    }

    setupEventListeners() {
        this.setupSearchEvents();
        this.setupNavigationEvents();
        this.setupNoteEvents();
        this.setupFolderEvents();
        this.setupModalEvents();
        this.setupMobileEvents();
        this.setupKeyboardEvents();
        this.setupThemeEvents();
    }

    setupSearchEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.app.filters.search = e.target.value;
                this.app.debounce(() => this.app.dataManager.loadNotes(), 300);
            });
        }
    }

    setupNavigationEvents() {
        // Quick links navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.getAttribute('data-filter');
                this.handleQuickLinkFilter(filter);
            });
        });
    }

    setupNoteEvents() {
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
            createTemplateBtn.addEventListener('click', () => this.app.createTemplateNote());
        }

        // Content area actions
        const editNoteBtn = document.getElementById('editNoteBtn');
        const fullScreenEditBtn = document.getElementById('fullScreenEditBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        if (editNoteBtn) {
            editNoteBtn.addEventListener('click', () => this.toggleEditMode());
        }
        if (fullScreenEditBtn) {
            fullScreenEditBtn.addEventListener('click', () => this.openFullScreenEditor());
        }
        if (folderBtn) {
            folderBtn.addEventListener('click', () => this.app.uiManager.openNoteFolderModal());
        }
        if (deleteNoteBtn) {
            deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        }
    }

    setupFolderEvents() {
        // Folder events
        const newFolderBtn = document.getElementById('newFolderBtn');
        if (newFolderBtn) {
            newFolderBtn.addEventListener('click', () => this.app.dataManager.createFolder());
        }
    }

    setupModalEvents() {
        // Folder modal events
        const folderModal = document.getElementById('folderModal');
        const closeFolderModal = document.getElementById('closeFolderModal');
        const cancelFolderBtn = document.getElementById('cancelFolderBtn');
        const folderForm = document.getElementById('folderForm');

        if (closeFolderModal) {
            closeFolderModal.addEventListener('click', () => this.app.uiManager.closeFolderModal());
        }

        if (cancelFolderBtn) {
            cancelFolderBtn.addEventListener('click', () => this.app.uiManager.closeFolderModal());
        }

        if (folderForm) {
            folderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.app.dataManager.saveFolder();
            });
        }

        // Close modal when clicking outside
        if (folderModal) {
            folderModal.addEventListener('click', (e) => {
                if (e.target === folderModal) {
                    this.app.uiManager.closeFolderModal();
                }
            });
        }

        // Note folder modal events
        const noteFolderModal = document.getElementById('noteFolderModal');
        const closeNoteFolderModal = document.getElementById('closeNoteFolderModal');
        const closeNoteFolderModalBtn = document.getElementById('closeNoteFolderModalBtn');
        const saveNoteFolderBtn = document.getElementById('saveNoteFolderBtn');

        if (closeNoteFolderModal) {
            closeNoteFolderModal.addEventListener('click', () => this.app.uiManager.closeNoteFolderModal());
        }

        if (closeNoteFolderModalBtn) {
            closeNoteFolderModalBtn.addEventListener('click', () => this.app.uiManager.closeNoteFolderModal());
        }

        if (saveNoteFolderBtn) {
            saveNoteFolderBtn.addEventListener('click', () => this.app.dataManager.saveNoteFolder());
        }

        if (noteFolderModal) {
            noteFolderModal.addEventListener('click', (e) => {
                if (e.target === noteFolderModal) {
                    this.app.uiManager.closeNoteFolderModal();
                }
            });
        }
    }

    setupMobileEvents() {
        // Mobile navigation
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.app.mobileManager.openMobileSidebar());
        }

        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', () => this.app.mobileManager.closeMobileNote());
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => this.app.mobileManager.closeMobileSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.app.isMobile = window.innerWidth <= 768;
            this.app.mobileManager.handleResize();
        });
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+N for new note
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }

            // Ctrl+S for save (when editing)
            if (e.ctrlKey && e.key === 's' && this.app.isEditing) {
                e.preventDefault();
                this.toggleEditMode(); // This will save the note
            }

            // Escape to cancel edit
            if (e.key === 'Escape' && this.app.isEditing) {
                e.preventDefault();
                this.cancelEdit();
            }

            // Escape to close mobile sidebar
            if (e.key === 'Escape' && this.app.isMobile) {
                this.app.mobileManager.closeMobileSidebar();
                this.app.mobileManager.closeMobileNote();
            }
        });
    }

    setupThemeEvents() {
        // Theme toggle
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.app.toggleTheme());
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => Auth.logout());
        }
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
        this.app.currentFolder = null;
        this.app.filters.folder = null;

        // Apply filter - only 'all' filter remains
        this.app.filters.favorite = false;
        this.app.filters.sortBy = 'updatedAt';
        this.app.filters.sortOrder = 'desc';

        this.app.dataManager.loadNotes();
    }

    createNewNote() {
        // Create a new note object
        const newNote = {
            _id: 'temp-' + Date.now(),
            title: 'Untitled Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            folder: null,
            isTemplate: false
        };

        // Add to notes array
        this.app.notes.unshift(newNote);
        this.app.currentNote = newNote;
        this.app.currentNoteFolder = null;
        this.app.isEditing = true;

        // Update UI
        this.app.uiManager.renderNotes();
        this.app.uiManager.selectNote(newNote._id);
        this.setupEditMode();

        // Focus on title input
        setTimeout(() => {
            const titleInput = document.getElementById('noteTitleInput');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
    }

    setupEditMode() {
        const contentPlaceholder = document.getElementById('contentPlaceholder');
        const noteContent = document.getElementById('noteContent');
        const titleElement = document.getElementById('noteTitle');
        const contentElement = document.getElementById('noteContentBody');

        contentPlaceholder.style.display = 'none';
        noteContent.style.display = 'block';

        // Create edit form
        const editForm = document.createElement('div');
        editForm.className = 'note-edit-form';
        editForm.innerHTML = `
            <input type="text" id="noteTitleInput" class="note-title-input" value="${this.app.escapeHtml(this.app.currentNote.title)}" placeholder="Note title">
            <textarea id="noteContentTextarea" class="note-content-textarea" placeholder="Start writing your note...">${this.app.escapeHtml(this.app.currentNote.content)}</textarea>
        `;

        noteContent.innerHTML = '';
        noteContent.appendChild(editForm);

        // Update edit button
        const editNoteBtn = document.getElementById('editNoteBtn');
        editNoteBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        editNoteBtn.classList.remove('btn-secondary');
        editNoteBtn.classList.add('btn-primary');
    }

    toggleEditMode() {
        if (this.app.isEditing) {
            // Save the note
            this.app.dataManager.saveNote();
        } else {
            // Enter edit mode
            if (!this.app.currentNote) return;
            
            this.app.isEditing = true;
            this.setupEditMode();
        }
    }

    cancelEdit() {
        if (this.app.currentNote) {
            // If editing existing note, revert to view mode
            this.app.isEditing = false;
            this.app.uiManager.displayNote();
        } else {
            // If creating new note, go back to placeholder
            this.app.isEditing = false;
            document.getElementById('contentPlaceholder').style.display = 'flex';
            document.getElementById('noteContent').style.display = 'none';
        }

        // Reset current note folder
        this.app.currentNoteFolder = null;

        // Update edit button
        const editNoteBtn = document.getElementById('editNoteBtn');
        editNoteBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editNoteBtn.classList.remove('btn-primary');
        editNoteBtn.classList.add('btn-secondary');

        console.log('Edit cancelled');
    }

    deleteCurrentNote() {
        if (this.app.currentNote) {
            this.app.dataManager.deleteNote(this.app.currentNote._id);
        }
    }

    openFullScreenEditor() {
        if (!this.app.currentNote) return;
        
        // Save current note data first
        const titleInput = document.getElementById('noteTitleInput');
        const contentTextarea = document.getElementById('noteContentTextarea');
        
        if (titleInput && contentTextarea) {
            this.app.currentNote.title = titleInput.value.trim();
            this.app.currentNote.content = contentTextarea.value;
        }
        
        // Open the full-screen editor
        const editor = new MarkdownEditor();
        editor.openEditor(this.app.currentNote);
    }
}
