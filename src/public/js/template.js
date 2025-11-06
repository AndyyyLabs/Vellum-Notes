/**
 * Note Template Module
 * Contains the template content and functions for creating template notes
 */

class NoteTemplate {
    static getTemplateContent() {
        return `# Welcome to Vellum! 📜

## Getting Started

Welcome to **Vellum**, your personal digital notebook! This template will help you get started with all the amazing features available.

### ✨ What You Can Do

* **📝 Rich Text Notes** - Write beautiful notes with Markdown formatting
* **📁 Smart Organization** - Create custom folders to organize your thoughts
* **🔍 Powerful Search** - Find any note instantly with lightning-fast search
* **🌙 Beautiful Themes** - Switch between light and dark modes
* **📱 Mobile Ready** - Works perfectly on all your devices
* **⚡ Real-time Sync** - Your notes are always up to date

---

## 📁 Organizing Your Notes

### Creating Folders
1. Click the **"Add New Folder"** button in the sidebar
2. Give your folder a name and description
3. Choose a color that represents the folder's purpose
4. Click **"Save Folder"** to create it

### Suggested Folder Structure
- **💼 Work** - Professional notes, meetings, projects
- **🏠 Personal** - Daily thoughts, goals, memories
- **📚 Learning** - Study notes, tutorials, courses
- **💡 Ideas** - Brainstorming, concepts, inspiration
- **📋 Tasks** - To-do lists, reminders, planning
- **🎯 Goals** - Personal and professional objectives

---

## 🎨 Markdown Guide

### Text Formatting

**Bold text** - Use \`**text**\` or \`__text__\`
*Italic text* - Use \`*text*\` or \`_text_\`
***Bold and italic*** - Use \`***text***\`
\`Inline code\` - Use backticks for code snippets

### Headers
\`# Main Title\` - Largest header
\`## Section Title\` - Medium header
\`### Subsection\` - Smaller header
\`#### Details\` - Even smaller

### Lists

**Bullet Points:**
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2

**Numbered Lists:**
1. First step
2. Second step
3. Third step

### Code Blocks

**Single line code:**
\`console.log("Hello, World!");\`

**Multi-line code:**
\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Vellum"));
\`\`\`

### Links and Images

**Links:**
[Visit Vellum](https://vellum.app)

**Images:**
![Description](image-url.jpg)

### Blockquotes

> This is a blockquote
> Perfect for highlighting important information
> Or sharing inspiring quotes

### Tables

| Feature | Description | Status |
|---------|-------------|--------|
| Markdown | Rich text formatting | ✅ |
| Folders | Organization system | ✅ |
| Search | Find notes quickly | ✅ |
| Themes | Light/dark modes | ✅ |

---

## 💡 Pro Tips

### 1. **Use Descriptive Titles**
Instead of "Meeting Notes", try "Q4 Planning Meeting - Dec 15, 2024"

### 2. **Organize with Folders**
Group related notes together for easier navigation

### 3. **Use Tags in Titles**
Add prefixes like [WORK], [PERSONAL], [IDEA] to your titles

### 4. **Regular Backups**
Your notes are automatically saved, but consider exporting important ones

### 5. **Keyboard Shortcuts**
- \`Ctrl + N\` - Create new note
- \`Ctrl + S\` - Save note (when editing)
- \`Escape\` - Cancel editing

---

## 🚀 Quick Start Ideas

### Daily Journal Template
\`\`\`
# Daily Journal - [Date]

## Today's Goals
- [ ] Goal 1
- [ ] Goal 2

## What I Learned
- Learning point 1
- Learning point 2

## Tomorrow's Plan
- Plan item 1
- Plan item 2
\`\`\`

### Meeting Notes Template
\`\`\`
# Meeting: [Topic] - [Date]

## Attendees
- Person 1
- Person 2

## Agenda
1. Item 1
2. Item 2

## Action Items
- [ ] Action 1 - Assigned to: [Name]
- [ ] Action 2 - Assigned to: [Name]

## Next Meeting
- Date: [Date]
- Time: [Time]
\`\`\`

### Project Planning Template
\`\`\`
# Project: [Project Name]

## Overview
Brief description of the project

## Goals
- Goal 1
- Goal 2

## Timeline
- [ ] Phase 1 - [Date]
- [ ] Phase 2 - [Date]
- [ ] Phase 3 - [Date]

## Resources
- Resource 1
- Resource 2
\`\`\`

---

## 🎯 Getting the Most Out of Vellum

1. **Start Simple** - Don't over-organize initially
2. **Be Consistent** - Use similar formatting across notes
3. **Review Regularly** - Go through old notes periodically
4. **Experiment** - Try different organization methods
5. **Share Ideas** - Use Vellum to capture inspiration anywhere

---

*Happy note-taking! 🚀*

*Created on ${new Date().toLocaleDateString()}*
`;
    }

    static async createTemplateNote(baseURL, token, options = {}) {
        const defaultOptions = {
            title: 'Welcome to Vellum - Getting Started Guide',
            isFavorite: false,
            ...options
        };

        try {
            const response = await fetch(`${baseURL}/api/v1/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: defaultOptions.title,
                    content: this.getTemplateContent(),
                    isFavorite: defaultOptions.isFavorite
                })
            });

            if (!response.ok) {
                console.error('Failed to create template note');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error creating template note:', error);
            return false;
        }
    }
}
