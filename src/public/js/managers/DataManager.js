class DataManager {
    constructor(app) {
        this.app = app;
    }

    async loadNotes() {
        try {
            const params = new URLSearchParams();
            
            if (this.app.filters.search) {
                params.append('search', this.app.filters.search);
            }
            
            if (this.app.filters.folder) {
                params.append('folder', this.app.filters.folder);
            }
            
            if (this.app.filters.favorite) {
                params.append('favorite', 'true');
            }
            
            params.append('sortBy', this.app.filters.sortBy);
            params.append('sortOrder', this.app.filters.sortOrder);

            const response = await fetch(`${this.app.baseURL}/notes?${params}`, {
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                this.app.notes = await response.json();
                this.app.uiManager.renderNotes();
            } else {
                console.error('Failed to load notes');
            }
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    }

    async loadFolders() {
        try {
            const response = await fetch(`${this.app.baseURL}/folders`, {
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                this.app.folders = await response.json();
                this.app.uiManager.renderFolders();
                this.app.uiManager.updateFolderCounts();
            } else {
                console.error('Failed to load folders');
            }
        } catch (error) {
            console.error('Error loading folders:', error);
        }
    }

    async createFolder() {
        this.app.uiManager.openFolderModal();
    }

    async editFolder(folderId) {
        const folder = this.app.folders.find(f => f._id === folderId);
        this.app.uiManager.openFolderModal(folder);
    }

    async saveFolder() {
        const form = document.getElementById('folderForm');
        const formData = new FormData(form);
        const folderData = {
            name: formData.get('name'),
            color: formData.get('color') || '#5a7c5e'
        };

        const folderId = form.getAttribute('data-folder-id');
        const url = folderId ? 
            `${this.app.baseURL}/folders/${folderId}` : 
            `${this.app.baseURL}/folders`;
        
        const method = folderId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(folderData)
            });

            if (response.ok) {
                this.app.uiManager.closeFolderModal();
                this.loadFolders();
                this.loadNotes();
                this.app.uiManager.updateCounts();
            } else {
                console.error('Failed to save folder');
            }
        } catch (error) {
            console.error('Error saving folder:', error);
        }
    }

    async deleteFolder(folderId) {
        if (!confirm('Are you sure you want to delete this folder? All notes in this folder will be moved to "All Notes".')) {
            return;
        }

        try {
            const response = await fetch(`${this.app.baseURL}/folders/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                this.loadFolders();
                this.loadNotes();
                this.app.uiManager.updateCounts();
                
                // If the deleted folder was selected, clear selection
                if (this.app.currentFolder === folderId) {
                    this.app.currentFolder = null;
                    this.app.filters.folder = null;
                    this.app.uiManager.renderFolders();
                }
            } else {
                console.error('Failed to delete folder');
            }
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    }

    async saveNote() {
        if (!this.app.currentNote) return;

        const titleInput = document.getElementById('noteTitleInput');
        const contentTextarea = document.getElementById('noteContentTextarea');
        
        if (!titleInput || !contentTextarea) return;

        const title = titleInput.value.trim();
        const content = contentTextarea.value;

        if (!title) {
            alert('Please enter a title for your note');
            return;
        }

        const noteData = {
            title: title,
            content: content,
            folder: this.app.currentNoteFolder
        };

        try {
            const response = await fetch(`${this.app.baseURL}/notes/${this.app.currentNote._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                const updatedNote = await response.json();
                
                // Update the note in the array
                const index = this.app.notes.findIndex(n => n._id === this.app.currentNote._id);
                if (index !== -1) {
                    this.app.notes[index] = updatedNote;
                }
                
                this.app.currentNote = updatedNote;
                this.app.isEditing = false;
                
                this.app.uiManager.displayNote();
                this.app.uiManager.renderNotes();
                this.app.uiManager.updateCounts();
                
                console.log('Note saved successfully');
            } else {
                console.error('Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    }

    async deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.app.baseURL}/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            if (response.ok) {
                // Remove note from array
                this.app.notes = this.app.notes.filter(n => n._id !== noteId);
                
                // If this was the current note, clear it
                if (this.app.currentNote && this.app.currentNote._id === noteId) {
                    this.app.currentNote = null;
                    this.app.currentNoteFolder = null;
                    this.app.uiManager.displayNote(); // This will show placeholder
                }
                
                this.app.uiManager.renderNotes();
                this.app.uiManager.updateCounts();
                
                console.log('Note deleted successfully');
            } else {
                console.error('Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }

    async saveNoteFolder() {
        const folderSelect = document.getElementById('noteFolderSelect');
        const selectedFolderId = folderSelect.value;
        
        if (!this.app.currentNote) return;

        try {
            const response = await fetch(`${this.app.baseURL}/notes/${this.app.currentNote._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({
                    folder: selectedFolderId || null
                })
            });

            if (response.ok) {
                const updatedNote = await response.json();
                
                // Update the note in the array
                const index = this.app.notes.findIndex(n => n._id === this.app.currentNote._id);
                if (index !== -1) {
                    this.app.notes[index] = updatedNote;
                }
                
                this.app.currentNote = updatedNote;
                this.app.currentNoteFolder = selectedFolderId;
                
                this.app.uiManager.closeNoteFolderModal();
                this.app.uiManager.displayNote();
                this.app.uiManager.renderNotes();
                this.app.uiManager.updateCounts();
                
                console.log('Note folder updated successfully');
            } else {
                console.error('Failed to update note folder');
            }
        } catch (error) {
            console.error('Error updating note folder:', error);
        }
    }

    async saveNoteWithCurrentData() {
        if (!this.app.currentNote) return;

        const titleInput = document.getElementById('noteTitleInput');
        const contentTextarea = document.getElementById('noteContentTextarea');
        
        if (!titleInput || !contentTextarea) return;

        const title = titleInput.value.trim();
        const content = contentTextarea.value;

        if (!title) {
            alert('Please enter a title for your note');
            return;
        }

        const noteData = {
            title: title,
            content: content,
            folder: this.app.currentNoteFolder
        };

        try {
            const response = await fetch(`${this.app.baseURL}/notes/${this.app.currentNote._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                const updatedNote = await response.json();
                
                // Update the note in the array
                const index = this.app.notes.findIndex(n => n._id === this.app.currentNote._id);
                if (index !== -1) {
                    this.app.notes[index] = updatedNote;
                }
                
                this.app.currentNote = updatedNote;
                
                return updatedNote;
            } else {
                console.error('Failed to save note');
                return null;
            }
        } catch (error) {
            console.error('Error saving note:', error);
            return null;
        }
    }
}
