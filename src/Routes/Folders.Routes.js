const express = require('express');
const Folder = require('../Models/Folder.Model');
const Notes = require('../Models/Notes.Model');
const authMiddleware = require('../Middleware/Auth.Middleware');
const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all folders belonging to the user
router.get('/', async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ name: 1 });
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({ message: 'Error fetching folders', error: error.message });
  }
});

// GET single folder by ID with note count
router.get('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Get note count for this folder
    const noteCount = await Notes.countDocuments({ folder: req.params.id, user: req.user._id });
    
    res.json({ ...folder.toObject(), noteCount });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.status(500).json({ message: 'Error fetching folder', error: error.message });
  }
});

// POST create new folder
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Folder name is required' });
    }
    
    const folder = new Folder({
      name: name.trim(),
      description: description || '',
      color: color || '#6366f1',
      user: req.user._id
    });
    
    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A folder with this name already exists' });
    }
    console.error('Error creating folder:', error);
    res.status(500).json({ message: 'Error creating folder', error: error.message });
  }
});

// PUT update folder
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    if (name && name.trim() !== '') {
      folder.name = name.trim();
    }
    if (description !== undefined) {
      folder.description = description;
    }
    if (color) {
      folder.color = color;
    }
    
    await folder.save();
    res.json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A folder with this name already exists' });
    }
    console.error('Error updating folder:', error);
    res.status(500).json({ message: 'Error updating folder', error: error.message });
  }
});

// DELETE folder
router.delete('/:id', async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    
    // Move all notes from this folder to no folder (set folder to null)
    await Notes.updateMany(
      { folder: req.params.id, user: req.user._id },
      { $unset: { folder: 1 } }
    );
    
    await folder.deleteOne();
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ message: 'Error deleting folder', error: error.message });
  }
});

// GET notes by folder
router.get('/:id/notes', async (req, res) => {
  try {
    const { search, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    let query = { folder: req.params.id, user: req.user._id };
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
       
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const notes = await Notes.find(query).sort(sortOptions);
    
      
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes by folder:', error);
    res.status(500).json({ message: 'Error fetching notes by folder', error: error.message });
  }
});

module.exports = router;
