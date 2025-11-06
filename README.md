# Vellum - Modern Note-Taking Application

A beautiful, modern note-taking web application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features markdown support, real-time search, folder organization, and a clean, intuitive interface.

## Features

### ✨ Modern UI/UX
- Clean, responsive design with beautiful gradients and animations
- Three-column layout with sidebar, folder navigation, and note editor
- Dark/light theme toggle
- Mobile-responsive design
- Smooth transitions and hover effects

### 📝 Rich Note Editing
- **Markdown Support**: Write notes using markdown syntax with CodeMirror editor
- **Live Preview**: Switch between write and preview modes
- **Syntax Highlighting**: Code blocks with syntax highlighting using Highlight.js
- **Auto-save**: Automatic preview updates as you type

### 📁 Folder Organization
- **Folder System**: Organize notes into custom folders
- **Color-Coded Folders**: Customize folder colors for visual organization
- **Folder Descriptions**: Add descriptions to folders
- **Note Count**: See how many notes are in each folder
- **Unorganized Notes**: View notes that aren't in any folder

### 🔍 Advanced Search & Filtering
- **Real-time Search**: Search through note titles and content
- **Folder Filtering**: Filter notes by folder
- **Sort Options**: Sort by last modified, created date, or title
- **Sort Order**: Ascending or descending order

### 🔐 Authentication
- Secure user registration and login
- JWT token-based authentication with HTTP-only cookies
- Protected routes and user-specific notes
- User profile display

## Technology Stack

- **Backend**: Node.js (>=24.5.0), Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Markdown**: Marked.js for parsing
- **Editor**: CodeMirror for markdown editing
- **Syntax Highlighting**: Highlight.js
- **Icons**: Font Awesome 6.0

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vellum-Notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/vellum
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3000
   URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - If using a remote MongoDB instance, update the `MONGODB_URI` in your `.env` file

6. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Register a new account or login with existing credentials

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
  - Body: `{ name, email, password }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
- `GET /auth/logout` - Logout user (protected)
- `GET /auth/me` - Get current user info (protected)

### Notes API (All protected)
- `GET /api/v1/notes` - Get all notes (with filters)
- `GET /api/v1/notes/:id` - Get single note
- `POST /api/v1/notes` - Create new note
  - Body: `{ title, content, folder? }`
- `PUT /api/v1/notes/:id` - Update note
  - Body: `{ title?, content?, folder? }`
- `DELETE /api/v1/notes/:id` - Delete note

### Folders API (All protected)
- `GET /api/v1/folders` - Get all folders
- `GET /api/v1/folders/:id` - Get single folder with note count
- `POST /api/v1/folders` - Create new folder
  - Body: `{ name, description?, color? }`
- `PUT /api/v1/folders/:id` - Update folder
  - Body: `{ name?, description?, color? }`
- `DELETE /api/v1/folders/:id` - Delete folder (moves notes to unorganized)
- `GET /api/v1/folders/:id/notes` - Get all notes in a folder

### Query Parameters (Notes)
- `search` - Search in title and content
- `folder` - Filter by folder ID (use `none` for unorganized notes)
- `sortBy` - Sort field (updatedAt, createdAt, title)
- `sortOrder` - Sort order (asc, desc)

## Usage

### Creating Notes
1. Click the "New Note" button
2. Enter a title and content using markdown
3. Optionally assign the note to a folder
4. The note will auto-save as you type

### Creating Folders
1. Click the "New Folder" button in the sidebar
2. Enter a folder name (required)
3. Optionally add a description and choose a color
4. Folders help organize your notes into categories

### Markdown Features
- **Headers**: `# H1`, `## H2`, `### H3`
- **Bold**: `**bold text**`
- **Italic**: `*italic text*`
- **Lists**: `- item` or `1. item`
- **Code**: `` `code` `` or ``` ``` ```
- **Links**: `[text](url)`
- **Blockquotes**: `> quote`

### Organizing Notes
- **Folders**: Create folders to categorize your notes
- **Search**: Use the search bar to find notes quickly
- **Filter by Folder**: Click on a folder in the sidebar to view its notes
- **Unorganized Notes**: View notes that aren't in any folder
- **Sort**: Choose how to sort your notes (by date or title)
- **Theme Toggle**: Switch between light and dark themes

## Project Structure

```
src/
├── server.js                    # Main application server
├── Config/
│   ├── database.js              # MongoDB connection
│   └── jwt.js                   # JWT configuration
├── Middleware/
│   └── Auth.Middleware.js       # Authentication middleware
├── Models/
│   ├── Notes.Model.js           # Note model
│   ├── Folder.Model.js          # Folder model
│   └── User.Model.js            # User model
├── Routes/
│   ├── Notes.Routes.js          # Notes API routes
│   ├── Folders.Routes.js        # Folders API routes
│   └── Auth.Routes.js           # Authentication routes
└── public/                      # Frontend files
    ├── index.html               # Main application page
    ├── login.html               # Login/Register page
    ├── css/
    │   ├── styles.css           # Main application styles
    │   └── login.css            # Login page styles
    ├── js/
    │   ├── app.js               # Main application entry point
    │   ├── auth.js              # Authentication logic
    │   ├── editor.js            # Note editor functionality
    │   ├── template.js          # Template utilities
    │   ├── core/
    │   │   └── App.js           # Core application class
    │   └── managers/
    │       ├── DataManager.js   # Data management
    │       ├── EventManager.js  # Event handling
    │       ├── MobileManager.js # Mobile-specific features
    │       └── UIManager.js     # UI management
    └── img/
        └── Logo.png             # Application logo
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Requirements

- Node.js >= 24.5.0
- MongoDB (local or remote instance)
- npm or yarn package manager

## Acknowledgments

- [Marked.js](https://marked.js.org/) for markdown parsing
- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [CodeMirror](https://codemirror.net/) for the markdown editor
- [Font Awesome](https://fontawesome.com/) for icons
- [Express.js](https://expressjs.com/) for the web framework
- [MongoDB](https://www.mongodb.com/) for the database
