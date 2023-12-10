import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../Context/AuthContext';
import moment from 'moment';
import Scanner from '../AdminDashboard/Components/Scanner';
import { TextPattern, Datepattern } from '../../../Regex/regexPatterns';

function SelfCheckout() {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([
    {
      bookId: '',
      copyId: '',
      transactionType: '',
      fromDate: null,
      toDate: null,
    },
  ]);
  const [allBooks, setAllBooks] = useState([]);
  const [allcopies, setAllCopies] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const [internalRefresh2, setInternalRefresh2] = useState(false);
  const [internalRefresh3, setInternalRefresh3] = useState(false);

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
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const afterTwoWeeks = new Date(currentDate);
    afterTwoWeeks.setDate(afterTwoWeeks.getDate() + 14);
    afterTwoWeeks.setHours(0, 0, 0, 0);

    setSelectedBooks([
      {
        bookId: '',
        copyId: '',
        transactionType: 'Issued',
        fromDate: currentDate,
        toDate: afterTwoWeeks,
      },
    ]);
  }, []);

  const handleErrors = (error) => {
    console.error(error);
    setSuccessMessage('An error occurred');
    setIsLoading(false);
  };

  const removeBookRow = (index) => {
    const updatedSelectedBooks = [...selectedBooks];
    updatedSelectedBooks.splice(index, 1);
    setSelectedBooks(updatedSelectedBooks);
  };

  const validateTransaction = () => {
    return selectedBooks.every((book) => book.bookId !== '' && Datepattern.test(book.fromDate) !== null && Datepattern.test(book.toDate) !== null);
  };

  const addSingleTransaction = async (book) => {
    try {
      if (!TextPattern.test(book.bookName)) {
        setSuccessMessage('Invalid characters in the copy ID.');
        setIsLoading(false);
        return;
      }

      const userResponse = await axios.get(`${API_URL}api/users/getuser/${user._id}`);
      const userData = userResponse.data;
      const totalTransactionsCount = userData.activeTransactions.length + 1;

      const isBookAlreadyIssued = userData.activeTransactions.some(
        (transaction) => transaction.bookId === book.bookId && transaction.transactionStatus === 'Active'
      );

      if (isBookAlreadyIssued) {
        setSuccessMessage('This book is already issued to the selected borrower.');
        setIsLoading(false);
        return;
      }

      if (totalTransactionsCount > 6) {
        setSuccessMessage('You have exceeded the maximum limit for issued books');
        setIsLoading(false);
        return;
      }

      const { bookId, copyId, fromDate, toDate } = book;
      const response = await axios.put(`${API_URL}api/bookcopies/updatecopy/${copyId}`, { isAvailable: false });

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to update copy');
      }

      const borrowerDetails = await axios.get(`${API_URL}api/users/getuser/${user._id}`);
      const bookDetails = await axios.get(`${API_URL}api/books/getbook/${bookId}`);

      if (bookDetails.data.bookCountAvailable >= 1) {
        const newTransaction = {
          bookId,
          borrowerId: user._id,
          copyId,
          borrowerName: borrowerDetails.data.userFullName,
          bookName: bookDetails.data.bookName,
          transactionType: 'Issued',
          fromDate: moment(fromDate).format('MM/DD/YYYY'),
          toDate: moment(toDate).format('MM/DD/YYYY'),
          isAdmin: true,
        };

        const newBookCountAvailable = bookDetails.data.bookCountAvailable - 1;
        const bookStatus = newBookCountAvailable === 0 ? 'Unavailable' : bookDetails.data.bookStatus;

        const transactionResponse = await axios.post(`${API_URL}api/transactions/add-transaction`, newTransaction);

        await axios.put(`${API_URL}api/users/${transactionResponse.data._id}/move-to-activetransactions`, {
          userId: user._id,
          isAdmin: true,
        });

        if (newBookCountAvailable >= 0) {
          await axios.put(`${API_URL}api/books/updatebook/${bookId}`, {
            isAdmin: true,
            bookCountAvailable: newBookCountAvailable,
            bookStatus: bookStatus,
          });
        } else {
          setSuccessMessage('The selected book is not available (Single Copy Left)');
          setIsLoading(false);
          return;
        }
      } else {
        setSuccessMessage('The selected book is not available (Single Copy Left)');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Transaction was successful');
      setInternalRefresh2(true);
      setInternalRefresh3(true);
    } catch (err) {
      handleErrors(err);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (user._id !== '' && validateTransaction()) {
      selectedBooks.forEach(async (book) => {
        await addSingleTransaction(book);
      });

      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const afterTwoWeeks = new Date(currentDate);
      afterTwoWeeks.setDate(afterTwoWeeks.getDate() + 14);
      afterTwoWeeks.setHours(0, 0, 0, 0);

      setSelectedBooks([
        {
          bookId: '',
          copyId: '',
          transactionType: 'Issued',
          fromDate: currentDate,
          toDate: afterTwoWeeks,
        },
      ]);
      setIsLoading(false);
    } else {
      setSuccessMessage('Fields must not be empty');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getallBooks = async () => {
      try {
        const response = await axios.get(API_URL + "api/books/allbooks");
        const allbooks = response.data.map((book) => ({
          value: book._id,
          text: book.bookName
        }));
        setAllBooks(allbooks);
      } catch (err) {
        handleErrors(err);
      }
    };

    if (internalRefresh2) {
      getallBooks();
      setInternalRefresh2(false);
    }

    getallBooks();
  }, [API_URL,internalRefresh2]);

  useEffect(() => {
    const getallcopies = async () => {
      try {
        const response = await axios.get(API_URL + "api/bookcopies/allcopies");
        const allcopies = response.data.map((copy) => ({
          value: copy._id,
          text: copy.copyId,
          bookId: copy.bookId,
          isAvailable: copy.isAvailable,
        }));
        setAllCopies(allcopies);
      } catch (err) {
        handleErrors(err);
      }
    };

    if (internalRefresh3) {
      getallcopies();
      setInternalRefresh3(false);
    }

    getallcopies();
  }, [API_URL,internalRefresh3]);

  const handleScanResult = async (content) => {
    try {
      const scannedData = JSON.parse(content);

      if (scannedData) {
        if (scannedData.bookId) {
          const scannedBookId = scannedData.bookId;
          const scannedCopyId = scannedData.copyId;

          if (scannedCopyId) {
            const response = await axios.get(`${API_URL}api/books/getbook/${scannedBookId}`);
            const copyResponse = await axios.get(`${API_URL}api/bookcopies/getcopy/${scannedCopyId}`);

            if (response.data) {
              if (copyResponse.data.isAvailable) {
                setSelectedBooks((prevSelectedBooks) => {
                  const isBookAlreadyAdded = prevSelectedBooks.some((book) => book.bookId === scannedBookId);

                  if (!isBookAlreadyAdded) {
                    if (prevSelectedBooks.length === 1 && prevSelectedBooks[0].bookId === '') {
                      setSuccessMessage(`Recognized Book.`);
                      return [
                        {
                          bookId: scannedBookId,
                          copyId: copyResponse.data._id,
                          transactionType: 'Issued',
                          fromDate: new Date(),
                          toDate: moment().add(14, 'days').toDate(),
                        },
                      ];
                    } else {
                      setSuccessMessage(`Recognized Book.`);
                      return [
                        ...prevSelectedBooks,
                        {
                          bookId: scannedBookId,
                          copyId: copyResponse.data._id,
                          transactionType: 'Issued',
                          fromDate: new Date(),
                          toDate: moment().add(14, 'days').toDate(),
                        },
                      ];
                    }
                  } else {
                    setSuccessMessage('This book is already added.');
                    return prevSelectedBooks;
                  }
                });
              } else {
                setSuccessMessage('This book copy is not available.');
              }
            } else {
              setSuccessMessage(`No book found with ID ${scannedBookId}`);
            }
          } else {
            setSuccessMessage('No copy ID found in the scanned data.');
          }
        } else {
          setSuccessMessage('Scan a valid QR code of Book or ID.');
        }
      }
    } catch (error) {
      setSuccessMessage(error.message);
    }
  };

  return (
    <>
      <p className="dashboard-option-title">Issue Book</p>
      <div className="dashboard-title-line"></div>
      <Scanner onScanResult={handleScanResult} />
      <form className="transaction-form" onSubmit={addTransaction}>
        <div className="table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>
                  <label className="transaction-form-label-table" htmlFor="bookName">
                    Book Name<span className="required-field">*</span>
                  </label>
                </th>
                <th>
                  <label className="transaction-form-label-table" htmlFor="copyId">
                    Copy ID<span className="required-field">*</span>
                  </label>
                </th>
                <th>
                  <label className="transaction-form-label-table" htmlFor="from-date">
                    From Date<span className="required-field">*</span>
                  </label>
                </th>
                <th>
                  <label className="transaction-form-label-table" htmlFor="to-date">
                    To Date<span className="required-field">*</span>
                  </label>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selectedBooks.map((book, index) => (
                <tr key={index}>
                  <td>
                    <div className="semanticdropdown-td">
                      {book.bookId ? (
                          allBooks
                            .filter((book) => book.value === selectedBooks[index].bookId)
                            .map((filteredBook) => filteredBook.text)
                        ) : (
                          'Scan Book QR Code'
                        )}
                    </div>
                  </td>
                  <td>
                    <div className="semanticdropdown-td">
                      {book.copyId ? (
                          allcopies
                            .filter((copy) => copy.value === selectedBooks[index].copyId)
                            .map((filteredCopy) => filteredCopy.text)
                        ) : (
                          'Select Book'
                        )}
                    </div>
                  </td>
                  <td>
                    <span>{book.fromDate ? book.fromDate.toLocaleDateString() : 'Current Date'}</span>
                  </td>
                  <td>
                    <span>{book.toDate ? book.toDate.toLocaleDateString() : 'SelfCheckOut (14 Days)'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="Button-Box">
          {selectedBooks.length > 0 && (
            <input type="button" className="row-button" value="Remove" onClick={() => removeBookRow(selectedBooks.length - 1)} />
          )}
          <input className="transaction-form-submit" type="submit" value="SUBMIT" disabled={isLoading} />
        </div>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </>
  );
}

export default SelfCheckout;
