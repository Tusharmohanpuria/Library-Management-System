import React, { useEffect, useState } from 'react';
import './PopularBooks.css';
import axios from 'axios';

function PopularBooks() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [popularBooks, setPopularBooks] = useState([]);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const booksResponse = await axios.get(API_URL + 'api/books/allbooks');
        const allBooks = booksResponse.data;

        const transactionsResponse = await axios.get(API_URL + 'api/transactions/all-transactions');
        const allTransactions = transactionsResponse.data;

        // Create a map to count the transactions for each book
        const bookTransactionCounts = new Map();

        allTransactions.forEach((transaction) => {
          const bookId = transaction.bookId;
          if (bookTransactionCounts.has(bookId)) {
            bookTransactionCounts.set(bookId, bookTransactionCounts.get(bookId) + 1);
          } else {
            bookTransactionCounts.set(bookId, 1);
          }
        });

        // Sort the books by transaction count in descending order
        const sortedBooks = allBooks.sort((a, b) => {
          const countA = bookTransactionCounts.get(a._id) || 0;
          const countB = bookTransactionCounts.get(b._id) || 0;
          return countB - countA;
        });

        // Get the top 10 books
        const popularBooks = sortedBooks.slice(0, 10);

        setPopularBooks(popularBooks);
      } catch (error) {
        console.error('Error fetching popular books:', error);
      }
    };

    fetchPopularBooks();
  }, [API_URL]);

  return (
    <div className="popularbooks-container">
      <h1 className="popularbooks-title">Popular Books</h1>
      <div className="popularbooks">
        <div className="popularbook-images">
          {popularBooks.map((book) => (
            <img
              key={book._id}
              className="popular-book"
              src={book.coverpage} // Assuming 'coverpage' contains base64 image data
              alt={book.bookName}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PopularBooks;
