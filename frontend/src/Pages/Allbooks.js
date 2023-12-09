import React, { useEffect, useState, useCallback } from 'react';
import './Allbooks.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TextPattern } from '../Regex/regexPatterns';

function Allbooks() {
  const API_URL = process.env.REACT_APP_API_URL;
  const [Allbooks, setAllbooks] = useState([]);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 20;

  const performSearch = useCallback(() => {
    const lowerCaseSearch = search.toLowerCase();

    if (!TextPattern.test(lowerCaseSearch)) {
      console.log('Invalid characters in the search input.');
      return;
    }

    const filteredBooks = Allbooks.filter(({ bookName, author, publisher, categoryNames, ISBN }) => {
      const isbn10 = String(ISBN.isbn10);
      const isbn13 = String(ISBN.isbn13);
  
      switch (searchField) {
        case 'name':
          return bookName.toLowerCase().includes(lowerCaseSearch);
        case 'author':
          return author.toLowerCase().includes(lowerCaseSearch);
        case 'publisher':
          return publisher.toLowerCase().includes(lowerCaseSearch);
        case 'category':
          return categoryNames.some((cat) => cat.toLowerCase().includes(lowerCaseSearch));
        case 'ISBN':
          return isbn10.includes(search) || isbn13.includes(search);
        case 'all':
        default:
          return (
            bookName.toLowerCase().includes(lowerCaseSearch) ||
            author.toLowerCase().includes(lowerCaseSearch) ||
            publisher.toLowerCase().includes(lowerCaseSearch) ||
            isbn10.includes(search) || isbn13.includes(search) ||
            categoryNames.some((cat) => cat.toLowerCase().includes(lowerCaseSearch))
          );
      }
    });
  
    setSearchResults(filteredBooks);
    setCurrentPage(1);
  }, [search, searchField, Allbooks]);  

  useEffect(() => {
    const fetchCategoriesAndBooks = async () => {
      try {
        const [categoriesResponse, booksResponse] = await Promise.all([
          axios.get(API_URL + 'api/categories/allcategories'),
          axios.get(API_URL + 'api/books/allbooks'),
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

        setAllbooks(booksWithCategories);
        setSearchResults(booksWithCategories);
      } catch (error) {
        console.error('Error fetching categories and books:', error);
      }
    };

    fetchCategoriesAndBooks();
  }, [API_URL]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const handleSearchFieldChange = (field) => {
    setSearchField(field);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(searchResults.length / booksPerPage);

  const visiblePageButtons = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(currentPage + 2, totalPages); i++) {
    visiblePageButtons.push(i);
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedResults = searchResults.slice(startIndex, endIndex);

  return (
    <div className="books-page">
      <div className="Search-Box">
        <div className="search-inputs">
          <div className="search-field-popup">
            <select className="search-select" onChange={(e) => handleSearchFieldChange(e.target.value)}>
              <option value="all">All</option>
              <option value="name">Name</option>
              <option value="author">Author</option>
              <option value="publisher">Publisher</option>
              <option value="category">Category</option>
              <option value="ISBN">ISBN</option>
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
      <div className="search-results">
        <div className="books-container">
          <div className="books-mobile">
            <div className="books">
              {paginatedResults.map((book, index) => (
                <div key={book._id} className="book-card">
                  <Link className="Link-Book" to={`/book/${book._id}`}>
                    <img className="bookImg" src={book.coverpage ? book.coverpage : './assets/images/NotFound.png'} alt={book.bookName} />
                    <p className="bookcard-title">{book.bookName}</p>
                    <p className="bookcard-author">By {book.author}</p>
                    <div className="bookcard-category">
                      {book.categoryNames.map((category, i) => (
                        <p key={i}>{category}</p>
                      ))}
                    </div>
                  </Link>
                  <div className="bookcard-emptybox"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="pagination-container">
        <div className="PagingBox">
          <button className="Page-Button" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous Page
          </button>
          {visiblePageButtons.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={page === currentPage ? "active-page" : ""}
            >
              {page}
            </button>
          ))}
          <button className="Page-Button" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default Allbooks;
