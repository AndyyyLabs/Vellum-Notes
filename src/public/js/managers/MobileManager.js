class MobileManager {
    constructor(app) {
        this.app = app;
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.add('open');
        }
        
        if (overlay) {
            overlay.classList.add('open');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        
        if (overlay) {
            overlay.classList.remove('open');
        }
    }

    openMobileNote() {
        const contentArea = document.querySelector('.content-area');
        
        if (contentArea) {
            contentArea.classList.add('open');
        }
    }

    closeMobileNote() {
        const contentArea = document.querySelector('.content-area');
        
        if (contentArea) {
            contentArea.classList.remove('open');
        }
    }

    handleResize() {
        // Close mobile sidebar and note view when switching to desktop
        if (!this.app.isMobile) {
            this.closeMobileSidebar();
            this.closeMobileNote();
        }
    }

    onEditorClosed() {
        // When full-screen editor is closed, refresh the note display
        if (this.app.currentNote) {
            this.app.uiManager.displayNote();
            this.app.uiManager.renderNotes();
            this.app.uiManager.updateCounts();
        }
    }
}
