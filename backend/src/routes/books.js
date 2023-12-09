import express from 'express';
import Book from '../models/Book.js';
import BookCategory from '../models/BookCategory.js';
import BookCopy from '../models/BookCopy.js';
import CopyIdTracker from '../models/CopyIdTracker.js';
import qrImage from 'qr-image';

const router = express.Router();

// Get all books in the db
router.get('/allbooks', async (req, res) => {
  try {
    const books = await Book.find({}).populate('transactions').sort({ _id: -1 });
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Book by book Id
router.get('/getbook/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('transactions');
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get books by category name
router.get('/bycategory', async (req, res) => {
  const category = req.query.category;
  try {
    const books = await Book.find({ categories: category }).populate('categories');
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Adding book
router.post('/addbook', async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const newBook = new Book({
        bookName: req.body.bookName,
        alternateTitle: req.body.alternateTitle,
        author: req.body.author,
        publisher: req.body.publisher,
        bookCountAvailable: req.body.bookCountAvailable,
        bookStatus: req.body.bookStatus || 'Available',
        noofpages: req.body.noofpages,
        coverpage: req.body.coverpage,
        description: req.body.description,
        ISBN: {
          isbn10: req.body.ISBN.isbn10,
          isbn13: req.body.ISBN.isbn13,
        },
        categories: req.body.categories,
        transactions: req.body.transactions,
        reviews: req.body.reviews,
        copies: [],
      });

      const book = await newBook.save();

      const bookCopies = [];
      for (let i = 0; i < book.bookCountAvailable; i++) {
        const copyId = await getNextCopyId();
        const qrCode = generateQRCode(book, copyId);
        const bookCopy = new BookCopy({
          bookId: book._id,
          copyId,
          qrCode,
        });
        bookCopies.push(bookCopy);
      }      

      await BookCopy.insertMany(bookCopies);

      await Book.updateOne({ _id: book._id }, { $push: { copies: bookCopies } });
      
      await BookCategory.updateMany({ _id: { $in: book.categories } }, { $push: { books: book._id } });
      res.status(201).json(book);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json('You don\'t have permission to add a book!');
  }
});

const getNextCopyId = async (bookId) => {
    try {
      let tracker = await CopyIdTracker.findOne({ bookId });
  
      if (!tracker) {
        tracker = new CopyIdTracker();
      }
  
      const newCopyId = tracker.lastCopyId + 1;
      tracker.lastCopyId = newCopyId;
      await tracker.save();
  
      return newCopyId;
    } catch (error) {
      throw new Error('Error generating copy ID: ' + error.message);
    }
  }; 

const generateQRCode = (data, copyId) => {
  const copyIdStr = copyId.toString();
  const qrData = {
    bookName: data.bookName,
    author: data.author,
    publisher: data.publisher,
    ISBN: data.ISBN,
    description: data.description,
    noofpages: data.noofpages,
    bookId: data._id,
    copyId: copyIdStr,
  };
  const qrCodeData = JSON.stringify(qrData);
  const qrCode = qrImage.imageSync(qrCodeData, { type: 'png' });
  return qrCode.toString('base64');
};


// Update book details
router.put('/updatebook/:id', async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json(updatedBook);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json('You don\'t have permission to update a book!');
  }
});

// Remove book
router.delete('/removebook/:bookId', async (req, res) => {
  if (req.body.isAdmin) {
    try {
      const book = await Book.findByIdAndDelete(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      await BookCategory.updateMany(
        { _id: { $in: book.categories } },
        { $pull: { books: book._id } }
      );

      if (book.copies && book.copies.length > 0) {
        const copyIds = book.copies.map((copy) => copy._id);
        await BookCopy.deleteMany({ _id: { $in: copyIds } });
      }

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting the book:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(403).json("You don't have permission to delete a book!");
  }
});

export default router;


