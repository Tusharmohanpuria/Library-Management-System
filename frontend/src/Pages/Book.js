import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './Allbooks.css';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { TextPattern } from '../Regex/regexPatterns';

function Book() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { bookId } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(0);
  const { user } = useContext(AuthContext);
  const [bookCategories, setBookCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const successMessageTimeoutRef = useRef(null);

  useEffect(() => {
    if (successMessageTimeoutRef.current) {
      clearTimeout(successMessageTimeoutRef.current);
    }

    successMessageTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('');
    }, 2000);

    return () => {
      clearTimeout(successMessageTimeoutRef.current);
    };
  }, [successMessage]);

  const fetchUsername = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_URL}api/users/getusername/${userId}`);
      console.log('API Response:', response);
      return response.data.username;
    } catch (error) {
      console.error('Error fetching username:', error);
      return 'Unknown';
    }
  }, [API_URL]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}api/books/getbook/${bookId}`);
        setBookDetails(response.data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      }
    };

    const fetchBookReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}api/reviews/get-reviews/${bookId}`);
        const reviewsWithUsernames = await Promise.all(
          response.data.map(async (review) => {
            const username = await fetchUsername(review.userId);
            return { ...review, username };
          })
        );
        setReviews(reviewsWithUsernames);
      } catch (error) {
        console.error('Error fetching book reviews:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}api/categories/allcategories`);
        setBookCategories(response.data);
      } catch (error) {
        console.error('Error fetching book categories:', error);
      }
    };

    fetchBookDetails();
    fetchBookReviews();
    fetchCategories();
  }, [API_URL, bookId, fetchUsername]);

  const handleReviewSubmit = async () => {
    if (userReview.trim() === '') {
      setSuccessMessage('Please enter a review text.');
      return;
    }

    if (!TextPattern.test(userReview)) {
      setSuccessMessage('Invalid characters in the review text.');
      return;
    }

    try {
      const username = await fetchUsername(user._id);

      const response = await axios.post(`${API_URL}api/reviews/add-review`, {
        bookId: bookId,
        userId: user._id,
        userName: username,
        rating: userRating,
        reviewText: userReview,
      });

      if (response.status === 201) {
        setSuccessMessage('Review submitted successfully!');

        const newReview = {
          username: username,
          rating: userRating,
          reviewText: userReview,
        };

        setReviews([...reviews, newReview]);
        setUserReview('');
        setUserRating(0);
      } else {
        setSuccessMessage('Failed to submit the review. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response) {
        setSuccessMessage(`Error: ${error.response.data.message}`);
      } else {
        setSuccessMessage('An error occurred while submitting the review. Please try again later.');
      }
    }
  };

  return (
    <div className="books-page single-book-box">
      <div className="container-book">
        <div className="book-details">
          {bookDetails && (
            <div>
              <h2 className="Book-Title">{bookDetails.bookName}</h2>
              <div className="Book-Title-line"></div>

              <div className="Book-Box">
                <div className="Container-Box-left">
                <div className="Img-Box">
                  <img className="Book-Img" src={bookDetails.coverpage ? bookDetails.coverpage : '../assets/images/NotFound.png'} alt={bookDetails.bookName} />
                </div>
                  <div className="Grid Book-Info">
                    <p className="Book-attributes"><span className='Book-attributes-title'>ISBN 10: </span>{bookDetails.ISBN.isbn10}<br /><span className='Book-attributes-title'>ISBN 13: </span>{bookDetails.ISBN.isbn13}</p>
                    <p className="Book-attributes"><span className='Book-attributes-title'>Author: </span>{bookDetails.author}</p>
                    <p className="Book-attributes"><span className='Book-attributes-title'>Publisher: </span>{bookDetails.publisher}</p>
                    <p className="Book-attributes"><span className='Book-attributes-title'>Categories: </span>
                      {bookDetails.categories.map((categoryId, i) => {
                        const category = bookCategories.find((cat) => cat._id === categoryId);
                        return (
                          <span key={i}>
                            {category ? category.categoryName : 'Unknown'}
                            {i !== bookDetails.categories.length - 1 && ', '}
                          </span>
                        );
                      })}
                    </p>
                    <p className="Book-attributes"><span className='Book-attributes-title'>Status: </span>{bookDetails.bookStatus}</p>
                    <p className="Book-attributes"><span className='Book-attributes-title'>No of pages: </span>{bookDetails.noofpages}</p>
                  </div>
                  </div>
                  <div className="Container-Box-right">
                  <div className="Book-Info">
                  <p className="Book-Description"><span className='Book-attributes-title'>Description: </span>{bookDetails.description}</p>
                  </div>
                  </div>
                </div>
            </div>
          )}

          <div className="book-review-box">
            <div className="book-reviews">
              <h3>Reviews</h3>
              <div className='Book-Ratings'>
                {reviews.map((review, i) => (
                  <div key={i} className="book-review">
                    <p>User: {review.username}</p>
                    <p>Rating: {renderStarRating(review.rating)}</p>
                    <p className="review-text">Review: {review.reviewText}</p>
                  </div>
                ))}
              </div>
              {user && (
                <div>
                  <h3>Leave a Review</h3>
                  <label htmlFor="userRating">Rating:</label>
                  {renderStarRating(userRating, setUserRating)}
                  <textarea
                    className='review-textarea'
                    rows="4"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                  /><br />
                  {successMessage && <p className="success-message">{successMessage}</p>}
                  <button type="submit" onClick={handleReviewSubmit} className="submit-review-button">
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderStarRating(rating, onRatingChange) {
  const maxRating = 5;

  const handleStarClick = (star) => {
    if (onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className="star-rating">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={starValue}
            onClick={() => handleStarClick(starValue)}
            style={{ cursor: 'pointer' }}
          >
            {starValue <= rating ? <StarIcon /> : <StarBorderIcon />}
          </span>
        );
      })}
    </div>
  );
}

export default Book;


