import express from 'express';
import Review from '../models/Review.js';
import Book from '../models/Book.js';

const router = express.Router();

router.post('/add-review', async (req, res) => {
    try {
      if (!req.body.userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
      
      if (!req.body.userName) {
        return res.status(400).json({ message: 'username is required' });
      }
  
      const book = await Book.findById(req.body.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      const newReview = new Review({
        bookId: req.body.bookId,
        userId: req.body.userId,
        userName: req.body.userName,
        rating: req.body.rating,
        reviewText: req.body.reviewText,
      });
  
      const review = await newReview.save();
      res.status(201).json(review);
    } catch (err) {
      console.error('Error submitting review:', err);
      res.status(500).json({ error: 'An error occurred while submitting the review.' });
    }
  });

router.get('/get-reviews/:bookId', async (req, res) => {
  try {
    const requestedBookId = req.params.bookId;
    const reviews = await Review.find({ bookId: requestedBookId });
    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'An error occurred while fetching reviews.' });
  }
});

export default router;


