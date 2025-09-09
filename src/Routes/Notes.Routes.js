const express = require('express');
const Notes = require('../Models/Notes.Model');
const authMiddleware = require('../Middleware/Auth.Middleware');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all notes belonging to the user
router.get('/', async (req, res) => {
  try {
    const { search, folder, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    let query = { user: req.user._id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by folder
    if (folder) {
      if (folder === 'none') {
        query.folder = { $exists: false };
      } else {
        query.folder = folder;
      }
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const notes = await Notes.find(query).populate('folder', 'name color').sort(sortOptions);
    
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// GET single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, user: req.user._id }).populate('folder', 'name color');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note', error: error.message });
  }
});

// POST create new note
router.post('/', async (req, res) => {
  try {
    const { title, content, folder } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const note = new Notes({
      title,
      content,
      folder: folder || null,
      user: req.user._id
    });
    
    await note.save();
    
    // Populate the note with folder details
    const populatedNote = await Notes.findById(note._id).populate('folder', 'name color');
    
    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
});

// PUT update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, folder } = req.body;
    
    const note = await Notes.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (title) note.title = title;
    if (content) note.content = content;
    if (folder !== undefined) note.folder = folder;
    
    await note.save();
    
    // Populate the note with folder details
    const updatedNote = await Notes.findById(note._id).populate('folder', 'name color');
    
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// DELETE note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Notes.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});



module.exports = router;