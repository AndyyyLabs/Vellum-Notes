class UIManager {
    constructor(app) {
        this.app = app;
    }

    renderFolders() {
        const foldersList = document.getElementById('foldersList');
        if (!foldersList) return;

        foldersList.innerHTML = '';

        this.app.folders.forEach(folder => {
            const folderItem = this.createFolderItem(folder);
            foldersList.appendChild(folderItem);
        });

        this.setupFolderEvents();
    }

    createFolderItem(folder) {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.setAttribute('data-folder-id', folder._id);
        
        if (this.app.currentFolder === folder._id) {
            folderItem.classList.add('active');
        }

        folderItem.innerHTML = `
            <div class="folder-label">
                <i class="fas fa-folder" style="color: ${folder.color}"></i>
                <span>${this.app.escapeHtml(folder.name)}</span>
            </div>
            <div class="folder-count">${folder.noteCount || 0}</div>
            <div class="folder-item-actions">
                <button class="folder-action-btn edit" title="Edit folder">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="folder-action-btn delete" title="Delete folder">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return folderItem;
    }

    setupFolderEvents() {
        document.querySelectorAll('.folder-item').forEach(item => {
            const folderId = item.getAttribute('data-folder-id');
            
            // Folder selection
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.folder-action-btn')) {
                    this.selectFolder(folderId);
                }
            });

            // Edit button
            const editBtn = item.querySelector('.folder-action-btn.edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.app.dataManager.editFolder(folderId);
                });
            }

            // Delete button
            const deleteBtn = item.querySelector('.folder-action-btn.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.app.dataManager.deleteFolder(folderId);
                });
            }
        });
    }

    selectFolder(folderId) {
        // Update active states
        document.querySelectorAll('.folder-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const selectedFolderItem = document.querySelector(`[data-folder-id="${folderId}"]`);
        if (selectedFolderItem) {
            selectedFolderItem.classList.add('active');
        }

        this.app.currentFolder = folderId;
        this.app.filters.folder = folderId;
        this.app.dataManager.loadNotes();
    }

    openFolderModal(folder = null) {
        const modal = document.getElementById('folderModal');
        const form = document.getElementById('folderForm');
        const nameInput = document.getElementById('folderName');
        const colorInput = document.getElementById('folderColor');
        const modalTitle = document.querySelector('#folderModal .modal-header h3');

        if (folder) {
            // Edit mode
            modalTitle.textContent = 'Edit Folder';
            nameInput.value = folder.name;
            colorInput.value = folder.color;
            form.setAttribute('data-folder-id', folder._id);
        } else {
            // Create mode
            modalTitle.textContent = 'Create New Folder';
            nameInput.value = '';
            colorInput.value = '#5a7c5e';
            form.removeAttribute('data-folder-id');
        }

        modal.classList.add('show');
        nameInput.focus();
    }

    closeFolderModal() {
        const modal = document.getElementById('folderModal');
        modal.classList.remove('show');
    }

    renderNotes() {
        const notesContainer = document.getElementById('notesContainer');
        if (!notesContainer) return;

        if (this.app.notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-content">
                        <div class="empty-icon">
                            <i class="fas fa-sticky-note"></i>
                        </div>
                        <h3>No notes found</h3>
                        <p>${this.app.filters.search ? 'Try adjusting your search terms.' : 'Create your first note to get started.'}</p>
                        <div class="empty-state-actions">
                            <button class="btn btn-primary" id="createFirstNoteBtn">
                                <i class="fas fa-plus"></i> Create Note
                            </button>
                            ${!this.app.filters.search ? `
                                <button class="btn btn-secondary" id="createTemplateBtn">
                                    <i class="fas fa-magic"></i> Create Template
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const notesGrid = document.createElement('div');
        notesGrid.className = 'notes-grid';

        this.app.notes.forEach(note => {
            const noteCard = this.createNoteCard(note);
            notesGrid.appendChild(noteCard);
        });

        notesContainer.innerHTML = '';
        notesContainer.appendChild(notesGrid);
        this.setupNoteActionEvents();
    }

    createNoteCard(note) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.setAttribute('data-note-id', note._id);
        
        if (this.app.currentNote && this.app.currentNote._id === note._id) {
            noteCard.classList.add('selected');
        }

        const preview = this.app.stripMarkdown(note.content).substring(0, 150);
        const date = new Date(note.updatedAt).toLocaleDateString();
        
        let folderBadge = '';
        if (note.folder) {
            folderBadge = `
                <div class="note-folder">
                    <i class="fas fa-folder"></i>
                    ${this.app.escapeHtml(note.folder.name)}
                </div>
            `;
        }

        noteCard.innerHTML = `
            <div class="note-card-header">
                <div class="note-title">
                    ${this.app.escapeHtml(note.title)}
                    ${note.isTemplate ? '<i class="fas fa-magic template-badge" title="Template"></i>' : ''}
                </div>
                <div class="note-actions-right">
                    <button class="action-btn" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="note-content">${this.app.escapeHtml(preview)}</div>
            <div class="note-meta">
                <div class="note-date">
                    <i class="fas fa-clock"></i>
                    ${date}
                </div>
                ${folderBadge}
            </div>
        `;

        return noteCard;
    }

    setupNoteActionEvents() {
        document.querySelectorAll('.note-card').forEach(card => {
            const noteId = card.getAttribute('data-note-id');
            
            // Card selection
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.action-btn')) {
                    this.selectNote(noteId);
                }
            });

            // Edit button
            const editBtn = card.querySelector('.action-btn:first-child');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectNote(noteId);
                    this.app.eventManager.toggleEditMode();
                });
            }

            // Delete button
            const deleteBtn = card.querySelector('.action-btn:last-child');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.app.dataManager.deleteNote(noteId);
                });
            }
        });
    }

    selectNote(noteId) {
        // Update active states
        document.querySelectorAll('.note-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-note-id="${noteId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        this.app.currentNote = this.app.notes.find(n => n._id === noteId);
        this.app.currentNoteFolder = this.app.currentNote?.folder?._id || null;
        
        this.displayNote();
        this.updateContentActions();
    }

    displayNote() {
        const contentPlaceholder = document.getElementById('contentPlaceholder');
        const noteContent = document.getElementById('noteContent');
        
        if (!this.app.currentNote) {
            contentPlaceholder.style.display = 'flex';
            noteContent.style.display = 'none';
            return;
        }

        contentPlaceholder.style.display = 'none';
        noteContent.style.display = 'block';

        const titleElement = document.getElementById('noteTitle');
        const contentElement = document.getElementById('noteContentBody');
        const breadcrumbElement = document.getElementById('contentBreadcrumb');

        titleElement.textContent = this.app.currentNote.title;
        contentElement.innerHTML = this.app.currentNote.content;
        breadcrumbElement.textContent = this.app.currentNote.title;

        this.displayNoteFolder();
    }

    displayNoteFolder() {
        const folderContainer = document.getElementById('noteFolderContainer');
        if (!folderContainer) return;

        if (this.app.currentNote && this.app.currentNote.folder) {
            folderContainer.innerHTML = `
                <div class="note-folder">
                    <i class="fas fa-folder"></i>
                    ${this.app.escapeHtml(this.app.currentNote.folder.name)}
                </div>
            `;
            folderContainer.style.display = 'block';
        } else {
            folderContainer.style.display = 'none';
        }
    }

    updateContentActions() {
        const editNoteBtn = document.getElementById('editNoteBtn');
        const fullScreenEditBtn = document.getElementById('fullScreenEditBtn');
        const folderBtn = document.getElementById('folderBtn');
        const deleteNoteBtn = document.getElementById('deleteNoteBtn');

        if (this.app.currentNote) {
            editNoteBtn.style.display = 'inline-flex';
            fullScreenEditBtn.style.display = 'inline-flex';
            folderBtn.style.display = 'inline-flex';
            deleteNoteBtn.style.display = 'inline-flex';
        } else {
            editNoteBtn.style.display = 'none';
            fullScreenEditBtn.style.display = 'none';
            folderBtn.style.display = 'none';
            deleteNoteBtn.style.display = 'none';
        }
    }

    updateCounts() {
        const allNotesCount = document.getElementById('allNotesCount');
        const favoritesCount = document.getElementById('favoritesCount');
        
        if (allNotesCount) {
            allNotesCount.textContent = this.app.notes.length;
        }
        
        if (favoritesCount) {
            const favorites = this.app.notes.filter(note => note.isFavorite);
            favoritesCount.textContent = favorites.length;
        }
    }

    updateFolderCounts() {
        this.app.folders.forEach(folder => {
            const folderItem = document.querySelector(`[data-folder-id="${folder._id}"]`);
            if (folderItem) {
                const countElement = folderItem.querySelector('.folder-count');
                if (countElement) {
                    countElement.textContent = folder.noteCount || 0;
                }
            }
        });
    }

    openNoteFolderModal() {
        const modal = document.getElementById('noteFolderModal');
        const folderSelect = document.getElementById('noteFolderSelect');

        this.populateFolderSelector();

        if (this.app.currentNote && this.app.currentNote.folder) {
            folderSelect.value = this.app.currentNote.folder._id;
            this.app.currentNoteFolder = this.app.currentNote.folder._id;
        } else if (this.app.currentNoteFolder) {
            folderSelect.value = this.app.currentNoteFolder;
        } else {
            folderSelect.value = '';
            this.app.currentNoteFolder = null;
        }

        modal.classList.add('show');
    }

    closeNoteFolderModal() {
        const modal = document.getElementById('noteFolderModal');
        modal.classList.remove('show');
    }

    populateFolderSelector() {
        const folderSelect = document.getElementById('noteFolderSelect');
        if (!folderSelect) return;

        folderSelect.innerHTML = '<option value="">No folder</option>';
        
        this.app.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder._id;
            option.textContent = folder.name;
            folderSelect.appendChild(option);
        });
    }
}
