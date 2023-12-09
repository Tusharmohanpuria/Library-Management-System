import React, { useEffect, useState } from 'react';
import './RecentAddedBooks.css'
import axios from 'axios';

function RecentBooksList() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [recentBooks, setRecentBooks] = useState([]);

    useEffect(() => {
        const fetchRecentBooks = async () => {
            try {
                const response = await axios.get(API_URL + "api/books/allbooks"); // Correct the API endpoint
                const allBooks = response.data;
                const recentBooks = allBooks.slice(0, 10); // Get the most recent 10 books
    
                setRecentBooks(recentBooks);
            } catch (error) {
                console.error('Error fetching recent books:', error);
            }
        };
    
        fetchRecentBooks();
    }, [API_URL]);
    

    return (
        <div className='recentaddedbooks-container'>
            <h2 className='recentbooks-title'>Recent Uploads</h2>
            <div className='recentbooks'>
                <div className='images'>
                {recentBooks.map((book) => (
                        <img
                            key={book._id}
                            className='recent-book'
                            src={book.coverpage} // Assuming 'coverpage' contains base64 image data
                            alt={book.bookName}
                        />
                ))}
                </div>
            </div>
        </div>
    );
}

export default RecentBooksList;

