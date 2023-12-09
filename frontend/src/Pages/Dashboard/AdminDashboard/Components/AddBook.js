import React, { useContext, useEffect, useState, useRef } from 'react';
import '../AdminDashboard.css';
import axios from 'axios';
import { AuthContext } from '../../../../Context/AuthContext';
import { Dropdown } from 'semantic-ui-react';
import Scanner from './Scanner';
import { isbn10Regex, isbn13Regex ,bookNameRegex, number, alphaRegex, publisherRegex } from '../../../../Regex/regexPatterns'

function AddBook({ onBookAdded, refresh1, refresh3 }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isbn, setISBN] = useState({ isbn10: '', isbn13: '' });
  const [isLoadingISBN, setIsLoadingISBN] = useState(false);

  const [bookName, setBookName] = useState('');
  const [alternateTitle, setAlternateTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [bookCountAvailable, setBookCountAvailable] = useState(0);
  const [noofpages, setNoOfPages] = useState(0);
  const [coverpage, setCoverPage] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [recentAddedBooks, setRecentAddedBooks] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const isSubmitDisabled = isLoading || isLoadingISBN;

  const dropdownRef = useRef();

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

  useEffect(() => {
    const getAllCategories = async () => {
      try {
        const response = await axios.get(API_URL + 'api/categories/allcategories');
        const all_categories = response.data.map((category) => ({
          value: category._id,
          text: category.categoryName,
        }));
        setAllCategories(all_categories);
      } catch (err) {
        console.log(err);
      }
    };

    const getallBooks = async () => {
      try {
        const response = await axios.get(API_URL + 'api/books/allbooks');
        setRecentAddedBooks(response.data.slice(0, 5));
      } catch (err) {
        console.log(err);
      }
    };

    getAllCategories();
    getallBooks();

    if (refresh3) {
      getallBooks();
    }

    if (refresh1) {
      getAllCategories();
    }
  }, [API_URL, refresh1, refresh3]);

  const handleFileChange = async (e) => {
    try {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.type === 'application/pdf') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64Data = btoa(String.fromCharCode(...uint8Array));
          setCoverPage(base64Data);
        } else if (selectedFile.type.startsWith('image/')) {
          const base64Data = await readFileAsDataURL(selectedFile);
          setCoverPage(base64Data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };  

  const fetchBookDetailsByISBN = async () => {
    const cleanedISBN = isbn.isbn10 || isbn.isbn13;
    try {
      setIsLoadingISBN(true);

      const response = await fetch(`${API_URL}api/bookData/proxy?isbn=${cleanedISBN}`);
    
      if (response.ok) {
        const data = await response.json();
        
        const shouldSwap = !(data.ISBN_10.length === 10 && data.ISBN_13.length === 13);

        setISBN({
          isbn10: shouldSwap ? data.ISBN_13 : data.ISBN_10,
          isbn13: shouldSwap ? data.ISBN_10 : data.ISBN_13,
        });
        
        setBookName(data.title);
        setAuthor(data.authors);
        setPublisher(data.publisher);
        setNoOfPages(data.pageCount);
        setDescription(data.description);
        setCoverPage(data.coverImage);
      } else {
        console.error('Error fetching book details:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingISBN(false);
    }
  };

  const handleISBN10Change = (e) => {
    setISBN((prevISBN) => ({
      ...prevISBN,
      isbn10: e.target.value,
    }));
  };

  const handleISBN13Change = (e) => {
    setISBN((prevISBN) => ({
      ...prevISBN,
      isbn13: e.target.value,
    }));
  };

  const handleISBNSubmit = async () => {
    if (isbn.isbn10 || isbn.isbn13) {
      fetchBookDetailsByISBN();
    }
  };

const addBook = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  if (!isbn10Regex.test(isbn.isbn10) && !isbn13Regex.test(isbn.isbn13)) {
    setSuccessMessage('ISBN is invalid');
    setIsLoading(false);
    return;
  }

  if (!bookNameRegex.test(bookName)) {
    setSuccessMessage('Book Name is invalid');
    setIsLoading(false);
    return;
  }

  if (!bookNameRegex.test(alternateTitle) && alternateTitle) {
    setSuccessMessage('Alternate Title is invalid');
    setIsLoading(false);
    return;
  }

  if (!alphaRegex.test(author)) {
    setSuccessMessage('Author Name is invalid');
    setIsLoading(false);
    return;
  }

  if (!publisherRegex.test(publisher) && publisher) {
    setSuccessMessage('Publisher is invalid');
    setIsLoading(false);
    return;
  }

  if (!number.test(bookCountAvailable)) {
    setSuccessMessage('No. of Copies Available is invalid');
    setIsLoading(false);
    return;
  }

  if (!number.test(noofpages) && noofpages) {
    setSuccessMessage('Number of Pages is invalid');
    setIsLoading(false);
    return;
  }

  let finalISBN;
  if (isbn.isbn10 || isbn.isbn13) {
    finalISBN = {
      isbn10: isbn.isbn10 || '',
      isbn13: isbn.isbn13 || '',
    };
  } else {
    finalISBN = {
      isbn10: 'DEFAULT_ISBN',
      isbn13: 'DEFAULT_ISBN',
    };
  }

  const BookData = {
    ISBN: finalISBN,
    bookName,
    alternateTitle,
    author,
    publisher,
    bookCountAvailable,
    noofpages,
    coverpage,
    description,
    categories: selectedCategories,
    isAdmin: user.isAdmin,
  };

  try {
    const response = await axios.post(API_URL + 'api/books/addbook', BookData);
    const updatedRecentAddedBooks = [response.data, ...recentAddedBooks.slice(0, 4)];
    setRecentAddedBooks(updatedRecentAddedBooks);
    setISBN({ isbn10: '', isbn13: '' });
    setBookName('');
    setAlternateTitle('');
    setAuthor('');
    setPublisher('');
    setBookCountAvailable(0);
    setNoOfPages(0);
    setCoverPage('');
    setDescription('');
    setSelectedCategories([]);
    setSuccessMessage('Book Added Successfully');
    onBookAdded();
  } catch (err) {
    console.log(err);
  }
  setIsLoading(false);
};

const handleScanResult = (content) => {
  if (isbn10Regex.test(content)) {
    setISBN((prevISBN) => ({
      ...prevISBN,
      isbn10: content,
    }));
    setSuccessMessage('Successfully scanned ISBN-10');
  } else if (isbn13Regex.test(content)) {
    setISBN((prevISBN) => ({
      ...prevISBN,
      isbn13: content,
    }));
    setSuccessMessage('Successfully scanned ISBN-13');
  } else {
    setSuccessMessage('Scan a valid ISBN');
  }
};

  return (
<div className="Top-Box">
      <p className="dashboard-option-title">Add a Book</p>
      <div className="dashboard-title-line"></div>
      <Scanner onScanResult={handleScanResult} />
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form className="addbook-form" onSubmit={addBook}>
          {isLoadingISBN ? (
          <div className="isbn-input-box-outer">
            <div>
              <div>
              <label className="addbook-form-label" htmlFor="ISBN10">
                  ISBN-10 (International Standard Book Number)
                </label>
                <br />
                <input
                  className="addbook-form-input"
                  type="text"
                  name="ISBN10"
                  value={isbn.isbn10}
                  readOnly
                />
                <br />

                <label className="addbook-form-label" htmlFor="ISBN13">
                  ISBN-13 (International Standard Book Number)
                </label>
                <br />
                <input
                  className="addbook-form-input"
                  type="text"
                  name="ISBN13"
                  value={isbn.isbn13}
                  readOnly
                />`
              </div>
            </div>
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
          </div>
        ) : (
          <div>
            <label className="addbook-form-label" htmlFor="ISBN10">
              ISBN-10 (International Standard Book Number)
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="ISBN10"
              value={isbn.isbn10}
              onChange={handleISBN10Change}
            />
            <br />

            <label className="addbook-form-label" htmlFor="ISBN13">
              ISBN-13 (International Standard Book Number)
            </label>
            <br />
            <input
              className="addbook-form-input"
              type="text"
              name="ISBN13"
              value={isbn.isbn13}
              onChange={handleISBN13Change}
            />
            <br />
            <input
              className="addbook-submit"
              type="button"
              value="Search Book Details"
              onClick={handleISBNSubmit}
            />
          </div>
        )}
        <br />
        <label className="addbook-form-label" htmlFor="bookName">
          Book Name<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="bookName"
          value={bookName}
          onChange={(e) => setBookName(e.target.value)}
          required
        />
        <br />

        <label className="addbook-form-label" htmlFor="alternateTitle">
          Alternate Title
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="alternateTitle"
          value={alternateTitle}
          onChange={(e) => setAlternateTitle(e.target.value)}
        />
        <br />

        <label className="addbook-form-label" htmlFor="author">
          Author Name<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
        <br />

        <label className="addbook-form-label" htmlFor="publisher">
          Publisher
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="text"
          name="publisher"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />
        <br />
        {coverpage && 
        <div>
          <img className='Test-Cover' src={coverpage} alt="Book Cover" />
        </div>}
        <label className="addbook-form-label" htmlFor="coverpage">
          Cover Page (Image or PDF)
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
        <br />

        <label className="addbook-form-label" htmlFor="bookCountAvailable">
          No. of Copies Available<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="number"
          name="bookCountAvailable"
          value={bookCountAvailable}
          onChange={(e) => setBookCountAvailable(e.target.value)}
          required
        />
        <br />

        <label className="addbook-form-label" htmlFor="noofpages">
          Number of Pages
        </label>
        <br />
        <input
          className="addbook-form-input"
          type="number"
          name="noofpages"
          value={noofpages}
          onChange={(e) => setNoOfPages(e.target.value)}
        />
        <br />

        <label className="addbook-form-label" htmlFor="categories">
          Categories<span className="required-field">*</span>
        </label>
        <br />
        <div className="semanticdropdown">
          <Dropdown
            ref={dropdownRef}
            placeholder="Category"
            fluid
            multiple
            search
            selection
            options={allCategories}
            value={selectedCategories}
            onChange={(event, data) => setSelectedCategories(data.value)}
          />
        </div>

        <label className="addbook-form-label" htmlFor="description">
          Description
        </label>
        <br />
        <textarea
          className="addbook-form-input"
          rows="5"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <br />
        <input
            className="addbook-submit"
            type="submit"
            value="SUBMIT"
            disabled={isSubmitDisabled}
        />
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <div>
        <p className="dashboard-option-title">Recently Added Books</p>
        <div className="dashboard-title-line"></div>
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Book Name</th>
              <th>Added Date</th>
            </tr>
          </thead>
          <tbody>
            {recentAddedBooks.map((book, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{book.bookName}</td>
                <td>{book.createdAt.substring(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddBook;

