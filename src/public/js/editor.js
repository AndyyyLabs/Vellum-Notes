class MarkdownEditor {
    constructor() {
        this.editor = null;
        this.isPreviewMode = false;
        this.currentNote = null;
        this.baseURL = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initCodeMirror();
    }

    setupEventListeners() {
        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.executeToolbarAction(action);
            });
        });

        // Preview toggle
        const previewToggleBtn = document.getElementById('previewToggleBtn');
        if (previewToggleBtn) {
            previewToggleBtn.addEventListener('click', () => this.togglePreview());
        }

        // Save button
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => this.saveNote());
        }

        // Close button
        const closeEditorBtn = document.getElementById('closeEditorBtn');
        if (closeEditorBtn) {
            closeEditorBtn.addEventListener('click', () => this.closeEditor());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.editor) return;

            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveNote();
            }

            // Ctrl+B for bold
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.executeToolbarAction('bold');
            }

            // Ctrl+I for italic
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.executeToolbarAction('italic');
            }

            // Escape to close editor
            if (e.key === 'Escape') {
                this.closeEditor();
            }
        });
    }

    initCodeMirror() {
        const textarea = document.getElementById('codeMirrorTextarea');
        if (!textarea) return;

        this.editor = CodeMirror.fromTextArea(textarea, {
            mode: 'markdown',
            theme: this.getCurrentTheme(),
            lineNumbers: true,
            lineWrapping: true,
            autofocus: true,
            placeholder: 'Start writing your note...\n\nUse # for headings\nUse **bold** for bold text\nUse *italic* for italic text\nUse `code` for inline code\nUse ``` for code blocks',
            extraKeys: {
                'Ctrl-B': () => this.executeToolbarAction('bold'),
                'Ctrl-I': () => this.executeToolbarAction('italic'),
                'Ctrl-K': () => this.executeToolbarAction('link'),
                'Ctrl-Enter': () => this.saveNote()
            }
        });

        // Update preview when content changes
        this.editor.on('change', () => {
            if (this.isPreviewMode) {
                this.updatePreview();
            }
        });

        // Auto-resize
        this.editor.setSize('100%', '100%');
    }

    getCurrentTheme() {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'dark' ? 'material' : 'default';
    }

    openEditor(note = null) {
        this.currentNote = note;
        const modal = document.getElementById('fullScreenEditorModal');
        const titleInput = document.getElementById('editorTitleInput');

        // Set title
        if (note) {
            titleInput.value = note.title;
        } else {
            titleInput.value = '';
        }

        // Set content
        if (this.editor) {
            this.editor.setValue(note ? note.content : '');
        }

        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus on editor
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus();
            }
        }, 100);

        // Reset preview mode
        this.isPreviewMode = false;
        this.updatePreviewToggle();
        this.showEditor();
    }

    closeEditor() {
        const modal = document.getElementById('fullScreenEditorModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset state
        this.currentNote = null;
        this.isPreviewMode = false;
        
        // Notify main app
        if (window.noteApp) {
            window.noteApp.onEditorClosed();
        }
    }

    togglePreview() {
        this.isPreviewMode = !this.isPreviewMode;
        
        if (this.isPreviewMode) {
            this.showPreview();
            this.updatePreview();
        } else {
            this.showEditor();
        }
        
        this.updatePreviewToggle();
    }

    showEditor() {
        const editorContainer = document.getElementById('editorContainer');
        const previewContainer = document.getElementById('previewContainer');
        
        editorContainer.style.display = 'block';
        previewContainer.style.display = 'none';
        
        // Refresh CodeMirror
        if (this.editor) {
            setTimeout(() => this.editor.refresh(), 100);
        }
    }

    showPreview() {
        const editorContainer = document.getElementById('editorContainer');
        const previewContainer = document.getElementById('previewContainer');
        
        editorContainer.style.display = 'none';
        previewContainer.style.display = 'block';
    }

    updatePreviewToggle() {
        const previewToggleBtn = document.getElementById('previewToggleBtn');
        if (previewToggleBtn) {
            if (this.isPreviewMode) {
                previewToggleBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            } else {
                previewToggleBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
            }
        }
    }

    updatePreview() {
        const previewContainer = document.getElementById('markdownPreview');
        if (!previewContainer || !this.editor) return;

        const content = this.editor.getValue();
        const htmlContent = marked.parse(content);
        previewContainer.innerHTML = htmlContent;

        // Apply syntax highlighting
        previewContainer.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }

    executeToolbarAction(action) {
        if (!this.editor) return;

        const selection = this.editor.getSelection();
        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        const lineStart = { line: cursor.line, ch: 0 };
        const lineEnd = { line: cursor.line, ch: line.length };

        switch (action) {
            case 'bold':
                this.wrapSelection('**', '**');
                break;
            case 'italic':
                this.wrapSelection('*', '*');
                break;
            case 'strikethrough':
                this.wrapSelection('~~', '~~');
                break;
            case 'heading1':
                this.addHeading('# ');
                break;
            case 'heading2':
                this.addHeading('## ');
                break;
            case 'heading3':
                this.addHeading('### ');
                break;
            case 'link':
                this.wrapSelection('[', '](url)');
                break;
            case 'image':
                this.wrapSelection('![alt text](', ')');
                break;
            case 'code':
                this.wrapSelection('`', '`');
                break;
            case 'codeblock':
                this.wrapSelection('```\n', '\n```');
                break;
            case 'list':
                this.addListMarker('- ');
                break;
            case 'orderedlist':
                this.addListMarker('1. ');
                break;
            case 'quote':
                this.addListMarker('> ');
                break;
            case 'table':
                this.insertTable();
                break;
            case 'hr':
                this.insertHorizontalRule();
                break;
        }
    }

    wrapSelection(prefix, suffix) {
        if (!this.editor) return;

        const selection = this.editor.getSelection();
        if (selection) {
            // If text is selected, wrap it
            this.editor.replaceSelection(prefix + selection + suffix);
        } else {
            // If no text is selected, insert the markers and place cursor between them
            this.editor.replaceSelection(prefix + suffix);
            const cursor = this.editor.getCursor();
            this.editor.setCursor({ line: cursor.line, ch: cursor.ch - suffix.length });
        }
    }

    addHeading(prefix) {
        if (!this.editor) return;

        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        
        // Check if line already starts with #
        if (line.startsWith('#')) {
            // Replace existing heading
            const newLine = prefix + line.replace(/^#+\s*/, '');
            this.editor.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            // Add heading prefix
            this.editor.replaceRange(prefix, { line: cursor.line, ch: 0 });
        }
    }

    addListMarker(prefix) {
        if (!this.editor) return;

        const cursor = this.editor.getCursor();
        const line = this.editor.getLine(cursor.line);
        
        // Check if line already starts with list marker
        if (line.match(/^[\s]*[-*+]\s/) || line.match(/^[\s]*\d+\.\s/)) {
            // Replace existing list marker
            const newLine = prefix + line.replace(/^[\s]*[-*+]\s|^[\s]*\d+\.\s/, '');
            this.editor.replaceRange(newLine, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            // Add list marker
            this.editor.replaceRange(prefix, { line: cursor.line, ch: 0 });
        }
    }

    insertTable() {
        if (!this.editor) return;

        const tableTemplate = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';
        this.editor.replaceSelection(tableTemplate);
    }

    insertHorizontalRule() {
        if (!this.editor) return;

        const hr = '\n---\n';
        this.editor.replaceSelection(hr);
    }

    async saveNote() {
        if (!this.editor) return;

        const titleInput = document.getElementById('editorTitleInput');
        const title = titleInput ? titleInput.value.trim() : '';
        const content = this.editor.getValue().trim();

        if (!title) {
            alert('Please enter a title for your note.');
            titleInput.focus();
            return;
        }

        if (!content) {
            alert('Please enter some content for your note.');
            this.editor.focus();
            return;
        }

        try {
            const noteData = {
                title,
                content,
                folder: this.currentNote ? this.currentNote.folder : null,
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
                
                // Close editor
                this.closeEditor();
                
                // Refresh main app
                if (window.noteApp) {
                    await window.noteApp.loadNotes();
                    window.noteApp.loadFolders();
                    window.noteApp.updateCounts();
                }
            } else {
                throw new Error('Failed to save note');
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        }
    }

    getContent() {
        return this.editor ? this.editor.getValue() : '';
    }

    setContent(content) {
        if (this.editor) {
            this.editor.setValue(content || '');
        }
    }
}

// Initialize the editor
let markdownEditor;
document.addEventListener('DOMContentLoaded', () => {
    markdownEditor = new MarkdownEditor();
    window.markdownEditor = markdownEditor;
});
