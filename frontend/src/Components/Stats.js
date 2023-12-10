import React, { useState, useEffect, useCallback } from 'react';
import './Stats.css';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import BookIcon from '@mui/icons-material/Book';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

function Stats() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [BookCount, setBookCount] = useState(0);
    const [MemberCount, setMemberCount] = useState(0);
    const [ReservationCount, setReservationCount] = useState(0);

    const location = useLocation();

    // Define the fetchCounts function using useCallback
    const fetchCounts = useCallback(async () => {
        try {
            // Fetch the book count
            const bookResponse = await axios.get(API_URL + "api/books/allbooks");
            const allBooks = bookResponse.data;
            setBookCount(allBooks.length);

            // Fetch member count
            const memberResponse = await axios.get(API_URL + "api/users/allmembers");
            const members = memberResponse.data;
            setMemberCount(members.length);

            // Fetch and count active transactions
            const transactionResponse = await axios.get(API_URL + "api/transactions/all-transactions");
            const activeTransactions = transactionResponse.data.filter(
                (transaction) => transaction.transactionStatus === "Active"
            );
            setReservationCount(activeTransactions.length);
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    }, [API_URL]);

    useEffect(() => {
        // Call the fetchCounts function when the component mounts
        fetchCounts();
    }, [fetchCounts, API_URL]);

    useEffect(() => {
        // Refresh counts when returning to the Stats page
        fetchCounts();
    }, [fetchCounts, location]);

    return (
        <div className='stats'>
            <div className='stats-block'>
                <LibraryBooksIcon className='stats-icon' style={{ fontSize: 80 }} />
                <p className='stats-title'>Total Books</p>
                <p className='stats-count'>{BookCount}</p>
            </div>
            <div className='stats-block'>
                <LocalLibraryIcon className='stats-icon' style={{ fontSize: 80 }} />
                <p className='stats-title'>Total Members</p>
                <p className='stats-count'>{MemberCount}</p>
            </div>
            <div className='stats-block'>
                <BookIcon className='stats-icon' style={{ fontSize: 80 }} />
                <p className='stats-title'>Reservations</p>
                <p className='stats-count'>{ReservationCount}</p>
            </div>
        </div>
    );
}

export default Stats;
