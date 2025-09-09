# Vellum Notes

A full-stack note-taking application that allows you to create, organize, and manage your notes with folders. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- 🔐 **User Authentication** - Secure registration and login with JWT tokens
- 📝 **Note Management** - Create, edit, delete, and organize your notes
- 📁 **Folder Organization** - Organize notes into custom folders
- 🎨 **Modern UI** - Clean and responsive interface
- 🔒 **Secure** - Password hashing with bcrypt and JWT authentication
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 24.5.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Vellum-Notes.git
   cd Vellum-Notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vellum-notes
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vellum-notes

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES=24h

   # Server Configuration
   PORT=3000
   URL=http://localhost:
   ```

   **Important:** Replace `your-super-secret-jwt-key-here` with a strong, random secret key for JWT token signing.

4. **Database Setup**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - The application will automatically create the database and collections

   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI` in your `.env` file

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. **Registration**
   - Navigate to `http://localhost:3000/login`
   - Click "Register" to create a new account
   - Fill in your name, email, and password

2. **Login**
   - Use your registered credentials to log in
   - You'll be redirected to the main notes interface

3. **Creating Notes**
   - Click the "New Note" button
   - Start typing your note content
   - Notes are automatically saved as you type

4. **Organizing with Folders**
   - Create folders to organize your notes
   - Move notes between folders
   - Use the sidebar to navigate between different views

5. **Managing Notes**
   - Edit notes by clicking on them
   - Delete notes using the delete button
   - Search through your notes using the search functionality

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Notes
- `GET /api/v1/notes` - Get all notes for authenticated user
- `POST /api/v1/notes` - Create a new note
- `PUT /api/v1/notes/:id` - Update a note
- `DELETE /api/v1/notes/:id` - Delete a note

### Folders
- `GET /api/v1/folders` - Get all folders for authenticated user
- `POST /api/v1/folders` - Create a new folder
- `PUT /api/v1/folders/:id` - Update a folder
- `DELETE /api/v1/folders/:id` - Delete a folder

## Project Structure

```
Vellum-Notes/
├── src/
│   ├── Config/
│   │   ├── database.js      # MongoDB connection
│   │   └── jwt.js          # JWT configuration
│   ├── Middleware/
│   │   └── Auth.Middleware.js  # Authentication middleware
│   ├── Models/
│   │   ├── User.Model.js   # User schema
│   │   ├── Notes.Model.js  # Notes schema
│   │   └── Folder.Model.js # Folder schema
│   ├── Routes/
│   │   ├── Auth.Routes.js  # Authentication routes
│   │   ├── Notes.Routes.js # Notes API routes
│   │   └── Folders.Routes.js # Folders API routes
│   ├── public/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # Frontend JavaScript
│   │   ├── img/           # Images
│   │   ├── index.html     # Main application page
│   │   └── login.html     # Login page
│   └── server.js          # Main server file
├── package.json
└── README.md
```

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing

- **Frontend:**
  - Vanilla JavaScript
  - HTML5
  - CSS3
  - Font Awesome icons

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies for token storage
- Input validation and sanitization
- Protected API routes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Andrew Morgan**

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the author.

---

**Happy Note-Taking! 📝**
