class NoteTemplate {
    static getTemplateContent() {
        return `<h1>Welcome to Vellum! 📜</h1>

<p>Your personal digital notebook for capturing thoughts, organizing ideas, and staying productive. This guide will help you get the most out of Vellum's features.</p>

<h2>🚀 Quick Start</h2>

<h3>Essential Features</h3>
<ul>
<li><strong>📝 Rich Text Editor</strong> - Format your notes with headers, lists, and styling</li>
<li><strong>📁 Smart Folders</strong> - Organize notes with custom colored folders</li>
<li><strong>🔍 Instant Search</strong> - Find any note quickly with the search bar</li>
<li><strong>🌙 Dark/Light Mode</strong> - Toggle themes in the settings</li>
<li><strong>📱 Mobile Friendly</strong> - Works seamlessly on all devices</li>
</ul>

<h2>📁 Getting Organized</h2>

<h3>Creating Your First Folder</h3>
<ol>
<li>Click the <strong>"+"</strong> button next to "Folders" in the sidebar</li>
<li>Enter a folder name and optional description</li>
<li>Choose a color that represents the folder's purpose</li>
<li>Click <strong>"Save Folder"</strong></li>
</ol>

<h3>Suggested Folder Ideas</h3>
<ul>
<li><strong>💼 Work</strong> - Meetings, projects, professional notes</li>
<li><strong>📚 Learning</strong> - Study notes, tutorials, courses</li>
<li><strong>💡 Ideas</strong> - Brainstorming, concepts, inspiration</li>
<li><strong>📋 Tasks</strong> - To-do lists, planning, reminders</li>
<li><strong>🏠 Personal</strong> - Daily thoughts, goals, memories</li>
</ul>

<h2>✏️ Writing Your First Note</h2>

<h3>Rich Text Formatting</h3>
<p>Use the toolbar when editing to format your text:</p>
<ul>
<li><strong>Bold</strong> - <code>Ctrl+B</code> or click the bold button</li>
<li><em>Italic</em> - <code>Ctrl+I</code> or click the italic button</li>
<li><u>Underline</u> - <code>Ctrl+U</code> or click the underline button</li>
<li>Headers - Use H1, H2, H3 buttons for different heading sizes</li>
<li>Lists - Create bullet points or numbered lists</li>
<li>Quotes - Use blockquotes for important information</li>
</ul>

<h3>Example Formatting</h3>
<blockquote>
<strong>Pro Tip:</strong> Use descriptive titles for your notes. Instead of "Meeting Notes", try "Q4 Planning Meeting - Dec 15, 2024"
</blockquote>

<h2>🎯 Ready-to-Use Templates</h2>

<h3>Daily Journal</h3>
<pre><code>Daily Journal - ${new Date().toLocaleDateString()}

Today's Focus:
• [ ] Priority task 1
• [ ] Priority task 2

Key Learnings:
• Learning point 1
• Learning point 2

Tomorrow's Plan:
• Plan item 1
• Plan item 2</code></pre>

<h3>Meeting Notes</h3>
<pre><code>Meeting: [Topic] - ${new Date().toLocaleDateString()}

Attendees:
• Person 1
• Person 2

Key Discussion Points:
1. Topic 1
2. Topic 2

Action Items:
• [ ] Action 1 - Owner: [Name] - Due: [Date]
• [ ] Action 2 - Owner: [Name] - Due: [Date]

Next Steps:
• Follow-up item 1
• Follow-up item 2</code></pre>

<h3>Project Planning</h3>
<pre><code>Project: [Project Name]

Overview:
Brief description of what this project aims to achieve.

Objectives:
• Objective 1
• Objective 2

Timeline:
• [ ] Phase 1 - [Start Date] to [End Date]
• [ ] Phase 2 - [Start Date] to [End Date]
• [ ] Phase 3 - [Start Date] to [End Date]

Resources Needed:
• Resource 1
• Resource 2</code></pre>

<h2>💡 Productivity Tips</h2>

<h3>Organization Best Practices</h3>
<ul>
<li><strong>Start Simple</strong> - Don't over-organize initially, let your system evolve</li>
<li><strong>Use Consistent Naming</strong> - Develop a naming convention for your notes</li>
<li><strong>Regular Cleanup</strong> - Review and archive old notes periodically</li>
<li><strong>Folder Colors</strong> - Use colors to quickly identify different types of content</li>
</ul>

<h3>Keyboard Shortcuts</h3>
<ul>
<li><code>Ctrl + S</code> - Save note (when editing)</li>
<li><code>Ctrl + B</code> - Bold text</li>
<li><code>Ctrl + I</code> - Italic text</li>
<li><code>Ctrl + U</code> - Underline text</li>
<li><code>Escape</code> - Cancel editing</li>
</ul>

<h2>🔧 Advanced Features</h2>

<h3>Note Management</h3>
<ul>
<li><strong>Move Notes to Folders</strong> - Click the folder icon when viewing a note</li>
<li><strong>Delete Notes</strong> - Use the trash icon to remove notes permanently</li>
<li><strong>Search Everything</strong> - Use the search bar to find notes by title or content</li>
</ul>

<h3>Mobile Usage</h3>
<ul>
<li>Tap the menu button (☰) to access the sidebar on mobile</li>
<li>Use the back arrow (←) to return to the notes list</li>
<li>All features work seamlessly on touch devices</li>
</ul>

<hr>

<h2>🎉 You're All Set!</h2>

<p>Start by creating your first note or setting up a folder structure that works for you. Remember, the best note-taking system is the one you'll actually use consistently.</p>

<p><strong>Happy note-taking! 🚀</strong></p>

<p><em>Template created on ${new Date().toLocaleDateString()}</em></p>
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
