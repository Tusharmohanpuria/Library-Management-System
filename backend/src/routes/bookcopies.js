import express from 'express';
import Book from '../models/Book.js';
import BookCopy from '../models/BookCopy.js';

const router = express.Router();

// Get all book copies
router.get('/allcopies', async (req, res) => {
  try {
    const copies = await BookCopy.find({});
    res.status(200).json(copies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get book copy by copyId
router.get('/getcopy/:copyId', async (req, res) => {
  try {
    const copy = await BookCopy.findOne({ copyId: req.params.copyId });
    if (!copy) {
      return res.status(404).json({ message: 'Copy not found' });
    }
    res.status(200).json(copy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all book copies for a book
router.get('/getcopies/:bookId', async (req, res) => {
    try {
      const requestedBookId = req.params.bookId;
      
      // Check if the book exists
      const book = await Book.findById(requestedBookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Retrieve all book copies for the specified bookId
      const bookCopies = await BookCopy.find({ bookId: requestedBookId });
      
      res.status(200).json(bookCopies);
    } catch (err) {
      console.error('Error fetching book copies:', err);
      res.status(500).json({ error: 'An error occurred while fetching book copies.' });
    }
  });

// Update book copy details
router.put('/updatecopy/:id', async (req, res) => {
  try {
    const updatedCopy = await BookCopy.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    if (!updatedCopy) {
      return res.status(404).json({ message: 'Copy not found' });
    }
    res.status(200).json(updatedCopy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove book copy
router.delete('/removecopy/:id', async (req, res) => {
  try {
    const removedCopy = await BookCopy.findByIdAndDelete(req.params.id);
    if (!removedCopy) {
      return res.status(404).json({ message: 'Copy not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting the copy:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

