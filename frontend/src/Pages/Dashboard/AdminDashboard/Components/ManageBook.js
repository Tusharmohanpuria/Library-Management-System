import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import BookQRCodes from './BookQRCodes'; 
import { AuthContext } from '../../../../Context/AuthContext';
import '../AdminDashboard.css';
import '../../../Allbooks.css';
import { Dropdown } from 'semantic-ui-react';
import { alphaRegex, bookNameRegex } from '../../../../Regex/regexPatterns';

function ManageBooks({ onBookEdited, refresh1, refresh2 }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [books, setBooks] = useState([]);
  const { user } = useContext(AuthContext);
  const [editingBook, setEditingBook] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const initialBookData = {
    bookName: '',
    alternateTitle: '',
    author: '',
    publisher: '',
    bookCountAvailable: 0,
    noofpages: 0,
    coverpage: '',
    description: '',
    categories: [],
  };
  const [bookData, setBookData] = useState({ ...initialBookData });
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isQRCodesModalOpen, setQRCodesModalOpen] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const getAllCategories = async () => {
      try {
        const response = await axios.get(API_URL + 'api/categories/allcategories');
        const all_categories = response.data.map((category) => ({
          value: category._id,
          text: category.categoryName,
        }));
        setCategoryOptions(all_categories);
      } catch (err) {
        console.log(err);
      }
    };
    getAllCategories();

    if(refresh1){
      getAllCategories();
    }
  }, [API_URL,refresh1]);
  
  const handleFileChange = async (e) => {
    try {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        if (selectedFile.type === 'application/pdf') {
          // Handle PDF file
          const arrayBuffer = await selectedFile.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const base64Data = btoa(String.fromCharCode(...uint8Array));
          setBookData({ ...bookData, coverpage: base64Data });
        } else if (selectedFile.type.startsWith('image/')) {
          // Handle image file
          const base64Data = await readFileAsDataURL(selectedFile);
          setBookData({ ...bookData, coverpage: base64Data });
        }
      }
    } catch (error) {
      // Handle error
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

  const handleCategoryChange = (e, { value }) => {
    setBookData({ ...bookData, categories: value });
  };

  const fetchBooks = useCallback(async () => {
    try {
      const [categoriesResponse, booksResponse] = await Promise.all([
        axios.get(`${API_URL}api/categories/allcategories`),
        axios.get(`${API_URL}api/books/allbooks`),
      ]);

      const allCategories = categoriesResponse.data;      
      const allBooks = booksResponse.data;

      const booksWithCategories = allBooks.map((book) => {
        const categoryNames = book.categories.map((categoryId) => {
          const category = allCategories.find((cat) => cat._id === categoryId);
          return category ? category.categoryName : 'Unknown';
        });
        return { ...book, categoryNames };
      });

      if(refresh2){
        fetchBooks();
      }

      setBooks(booksWithCategories);
    } catch (error) {
      console.error('Error fetching categories and books:', error);
    }
  }, [API_URL,refresh2]);

  useEffect(() => {
    setSearchResults(books);
  }, [books]);

  useEffect(() => {
    fetchBooks();
  }, [API_URL, fetchBooks]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleSearchFieldChange = (value) => {
    setSearchField(value);
  };

  const performSearch = useCallback(() => {
    const lowerCaseSearch = search.toLowerCase();
    const filteredBooks = books.filter((book) => {
      switch (searchField) {
        case 'name':
          return book.bookName.toLowerCase().includes(lowerCaseSearch);
        case 'author':
          return book.author.toLowerCase().includes(lowerCaseSearch);
        case 'publisher':
          return book.publisher.toLowerCase().includes(lowerCaseSearch);
        case 'category':
          return book.categoryNames?.some((cat) => cat.toLowerCase().includes(lowerCaseSearch));
        case 'ISBN':
          return book.ISBN.isbn10.includes(search) || book.ISBN.isbn13.includes(search);
        case 'all':
        default:
          return (
            book.bookName.toLowerCase().includes(lowerCaseSearch) ||
            book.author.toLowerCase().includes(lowerCaseSearch) ||
            book.publisher.toLowerCase().includes(lowerCaseSearch) ||
            book.ISBN.isbn10.includes(search) || book.ISBN.isbn13.includes(search) ||
            book.categoryNames?.some((cat) => cat.toLowerCase().includes(lowerCaseSearch))
          );
      }
    });

    setSearchResults(filteredBooks);
  }, [search, searchField, books]);

  const handleEditClick = (book) => {
    setEditingBook(book);
    setBookData({ ...book });
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...bookData };
    updatedData[field] = value;
    setBookData(updatedData);
  };

  const handleSaveClick = async () => {
    try {
      if (
        !bookNameRegex.test(bookData.bookName) ||
        !alphaRegex.test(bookData.author) ||
        !bookData.bookCountAvailable ||
        bookData.categories.length === 0
      ) {
        setSuccessMessage('Please fill in required fields with valid data.');
        return;
      }

      const bookDataToUpdate = {
        isAdmin: user.isAdmin,
        bookName: bookData.bookName,
        alternateTitle: bookData.alternateTitle,
        author: bookData.author,
        publisher: bookData.publisher,
        bookCountAvailable: bookData.bookCountAvailable,
        noofpages: bookData.noofpages,
        coverpage: bookData.coverpage,
        description: bookData.description,
        categories: bookData.categories,
      };

      const response = await axios.put(
        `${API_URL}api/books/updatebook/${editingBook._id}`,
        bookDataToUpdate
      );

      if (response.status === 200) {
        setSuccessMessage('Book updated successfully');
        setBookData({ ...initialBookData });
        setEditingBook(null);

        fetchBooks();
        performSearch();
        onBookEdited();
      } else {
        setSuccessMessage('Book update failed.');
      }
    } catch (error) {
      console.error('Edit request failed:', error);
      setSuccessMessage('Book update failed.');
    }
  };

  const handleDeleteClick = async (bookId) => {
    try {
      const response = await axios.delete(`${API_URL}api/books/removebook/${bookId}`, {
        data: { isAdmin: user.isAdmin },
      });

      if (response.status === 204) {
        setBooks((prevBooks) => prevBooks.filter((book) => book._id !== bookId));
        setSuccessMessage('Book deleted successfully');

        fetchBooks();
        performSearch();
        onBookEdited();
      } else {
        if (response.status === 403) {
          setSuccessMessage('Permission denied. You are not allowed to delete this book.');
        } else {
          setSuccessMessage('Book delete failed');
        }
      }
    } catch (error) {
      console.error('Delete request failed:', error);
      setSuccessMessage('Book delete failed');
    }
  };

  const handleShowQRCodes = (bookId) => {
    setSelectedBookId(bookId);
    setQRCodesModalOpen(true);
  };

  const handleCloseQRCodesModal = () => {
    setQRCodesModalOpen(false);
    setSelectedBookId(null);
  };

  return (
    <div className="Top-Box">
      <p className="dashboard-option-title">{!isQRCodesModalOpen ? (<span>Manage Books</span>) : (<span>Book QR Codes</span>)} </p>
      <div className="dashboard-title-line"></div>
      {!isQRCodesModalOpen && (
      <>
      <div className="Search-Box">
        <div className="search-inputs">
          <div className="search-field-popup">
            <select
              className="search-select"
              onChange={(e) => handleSearchFieldChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="name">Name</option>
              <option value="author">Author</option>
              <option value="publisher">Publisher</option>
              <option value="category">Category</option>
            </select>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search by Name, Author, Publisher, or Category"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <input type="submit" value="Search" id="search-button" onClick={performSearch} />
        </div>
      </div>
      <div>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className='table-box-managebook'>
        <div className="table-container">
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Author</th>
              <th>Publisher</th>
              <th>Number of Pages</th>
              <th>Cover Page</th>
              <th>Description</th>
              <th>Categories</th>
              <th>QR Codes</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((book) => (
              <tr key={book._id}>
                <td>
                  {book === editingBook ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={bookData.bookName}
                      onChange={(e) => handleFieldChange('bookName', e.target.value)}
                    />
                  ) : (
                    book.bookName
                  )}
                </td>
                <td>
                  {book === editingBook ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={bookData.author}
                      onChange={(e) => handleFieldChange('author', e.target.value)}
                    />
                  ) : (
                    book.author
                  )}
                </td>
                <td>
                  {book === editingBook ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={bookData.publisher}
                      onChange={(e) => handleFieldChange('publisher', e.target.value)}
                    />
                  ) : (
                    book.publisher
                  )}
                </td>
                <td>
                  {book === editingBook ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={bookData.noofpages}
                      onChange={(e) => handleFieldChange('noofpages', e.target.value)}
                    />
                  ) : (
                    book.noofpages
                  )}
                </td>
                <td>
                  {book === editingBook ? (
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="addbook-form-input"
                      onChange={handleFileChange}
                    />
                  ) : (
                    <img
                      className="table-img"
                      src={book.coverpage}
                      alt={book.bookName}
                    />
                  )}
                </td>
                <td>
                  {book === editingBook ? (
                    <textarea
                      className="addbook-form-input"
                      rows="3"
                      value={bookData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                  ) : (
                    <div className="description-content">{book.description}</div>
                  )}
                </td>
                <td>
                {book === editingBook ? (
                <Dropdown
                  ref={dropdownRef}
                  placeholder="Select Categories"
                  fluid
                  multiple
                  search
                  selection
                  options={categoryOptions}
                  value={bookData.categories}
                  onChange={handleCategoryChange}
                />
                ) : (
                  book.categoryNames.map((category, i) => (
                    <p key={i}>{category}</p>
                  ))
                )}
                </td>
                <td>
                  <input
                    type="button"
                    className="row-button-edit"
                    value="Show QRs"
                    onClick={() => handleShowQRCodes(book._id)}
                  />
                </td>
                <td>
                  {book === editingBook ? (
                    <input
                      type="button"
                      value="Save"
                      className="row-button-edit"
                      onClick={handleSaveClick}
                    />
                  ) : (
                    <input
                      type="button"
                      value="Edit"
                      className="row-button-edit"
                      onClick={() => handleEditClick(book)}
                    />
                  )}
                </td>
                <td>
                  <input
                    type="button"
                    value="Delete"
                    className="row-button-edit"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${book.bookName}?`
                        )
                      ) {
                        handleDeleteClick(book._id)
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </div>
      </div>
      </>
      )}
      {isQRCodesModalOpen && (
        <BookQRCodes
          bookId={selectedBookId}
          onClose={handleCloseQRCodesModal}
        />
      )}
    </div>
  );
}

export default ManageBooks;


