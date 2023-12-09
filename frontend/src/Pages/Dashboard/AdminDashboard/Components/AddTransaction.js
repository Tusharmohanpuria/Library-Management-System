import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../Context/AuthContext';
import { Dropdown } from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Scanner from './Scanner';
import { Datepattern, TextPattern } from '../../../../Regex/regexPatterns'

function AddTransaction( {onTransactionAdded, refresh2, refresh3, refresh5, refresh6, refresh7} ) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [borrowerId, setBorrowerId] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([
    {
      bookId: "",
      copyId: "",
      transactionType: "",
      fromDate: null,
      toDate: null,
    },
  ]);
  const [allMembers, setAllMembers] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [allcopies, setallcopies] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [moresettings, setmoresettings] = useState(false);

  const [internalRefresh2, setInternalRefresh2] = useState(false);
  const [internalRefresh3, setInternalRefresh3] = useState(false);

  const transactionTypes = [
    { value: 'Reserved', text: 'Reserve' },
    { value: 'Issued', text: 'Issue' }
  ];

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
        bookId: "",
        copyId: "",
        transactionType: "Issued",
        fromDate: currentDate,
        toDate: afterTwoWeeks,
      },
    ]);
  }, []);
  
  const dropdownRef = useRef();
  const dropdownRef2 = useRef();
  const dropdownRef3 = useRef();
  const dropdownRef4 = useRef();
  const datepickerRef = useRef();
  const datepickerRef2 = useRef();

  const handleErrors = (error) => {
    console.error(error);
    setSuccessMessage("An error occurred");
    setIsLoading(false);
  };

  const handleBookSelectionChange = (index, field, value) => {
    setSelectedBooks((prevSelectedBooks) => {
      const updatedSelectedBooks = [...prevSelectedBooks];
      updatedSelectedBooks[index][field] = value;
      return updatedSelectedBooks;
    });
  };

  const handleDateChange = (index, field, date) => {
    const updatedSelectedBooks = [...selectedBooks];
    updatedSelectedBooks[index][field] = date;
    setSelectedBooks(updatedSelectedBooks);
  };

  const addBookRow = () => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
  
    const afterTwoWeeks = new Date();
    afterTwoWeeks.setDate(afterTwoWeeks.getDate() + 14);
    afterTwoWeeks.setHours(0, 0, 0, 0);
  
    setSelectedBooks((prevSelectedBooks) => [
      ...prevSelectedBooks,
      {
        bookId: "",
        transactionType: "Issued",
        fromDate: currentDate,
        toDate: afterTwoWeeks,
      },
    ]);
  };  

  const removeBookRow = (index) => {
    const updatedSelectedBooks = [...selectedBooks];
    updatedSelectedBooks.splice(index, 1);
    setSelectedBooks(updatedSelectedBooks);
  };

  const validateTransaction = () => {
    return selectedBooks.every(book => (
      book.bookId !== "" &&
      Datepattern.test(book.fromDate) !== null &&
      Datepattern.test(book.toDate) !== null
    ));
  };

  const addSingleTransaction = async (book) => {
    try {
      if (book.fromDate > book.toDate) {
        setSuccessMessage("From date cannot be greater than to date");
        setIsLoading(false);
        return;
      }

      if (!TextPattern.test(book.bookName)) {
        setSuccessMessage("Invalid characters in the copy ID.");
        setIsLoading(false);
        return;
      }

      const userResponse = await axios.get(API_URL + `api/users/getuser/${borrowerId}`);
      const userData = userResponse.data;
      const totalTransactionsCount = userData.activeTransactions.length + 1;

      const isBookAlreadyIssued = userData.activeTransactions.some((transaction) =>
      transaction.bookId === book.bookId && transaction.transactionStatus === "Active"
      );

      if (isBookAlreadyIssued) {
        setSuccessMessage("This book is already issued to the selected borrower.");
        setIsLoading(false);
        return;
      }

      if (totalTransactionsCount > 6) {
        setSuccessMessage("You have exceeded the maximum limit for issued books");
        setIsLoading(false);
        return;
      }

      const { bookId, copyId, transactionType, fromDate, toDate } = book;
      const response = await axios.put(API_URL + `api/bookcopies/updatecopy/${copyId}`, { isAvailable: false });
      console.log(response);
      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to update copy');
      }      

      const borrowerDetails = await axios.get(API_URL + `api/users/getuser/${borrowerId}`);
      const bookDetails = await axios.get(API_URL + `api/books/getbook/${bookId}`);

      if (bookDetails.data.bookCountAvailable > 1 && (transactionType === "Issued" || transactionType === "Reserved")) {
        const newTransaction = {
          bookId,
          borrowerId,
          copyId,
          borrowerName: borrowerDetails.data.userFullName,
          bookName: bookDetails.data.bookName,
          transactionType,
          fromDate: moment(fromDate).format("MM/DD/YYYY"),
          toDate: moment(toDate).format("MM/DD/YYYY"),
          isAdmin: user.isAdmin
        };

        const newBookCountAvailable = bookDetails.data.bookCountAvailable - 1;
        const bookStatus = newBookCountAvailable === 0 ? "Unavailable" : bookDetails.data.bookStatus;

        const transactionResponse = await axios.post(API_URL + `api/transactions/add-transaction`, newTransaction);

        await axios.put(API_URL + `api/users/${transactionResponse.data._id}/move-to-activetransactions`, {
          userId: borrowerId,
          isAdmin: user.isAdmin
        });

        if (newBookCountAvailable >= 0) {
          await axios.put(API_URL + `api/books/updatebook/${bookId}`, {
            isAdmin: user.isAdmin,
            bookCountAvailable: newBookCountAvailable,
            bookStatus: bookStatus
          });
        } else {
          setSuccessMessage("The selected book is not available for the chosen transaction type");
          setIsLoading(false);
          return;
        }
      } else {
        setSuccessMessage("The selected book is not available for the chosen transaction type");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Transaction was successful");

      setInternalRefresh2(true);
      setInternalRefresh3(true);

      if (onTransactionAdded) {
        onTransactionAdded();
    }

    } catch (err) {
      handleErrors(err);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (borrowerId !== "" && validateTransaction()) {
      selectedBooks.forEach(async (book) => {
        await addSingleTransaction(book);
      });

      setBorrowerId("");
      
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
    
      const afterTwoWeeks = new Date(currentDate);
      afterTwoWeeks.setDate(afterTwoWeeks.getDate() + 14);
      afterTwoWeeks.setHours(0, 0, 0, 0);
    
      setSelectedBooks([
        {
          bookId: "",
          copyId: "",
          transactionType: "Issued",
          fromDate: currentDate,
          toDate: afterTwoWeeks,
        },
      ]);
      
      setIsLoading(false);
    } else {
      setSuccessMessage("Fields must not be empty");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getTransactions = async () => {
      try {
        const response = await axios.get(API_URL + "api/transactions/all-transactions");
        setRecentTransactions(response.data.slice(0, 5));
      } catch (err) {
        handleErrors(err);
      }
    };
    getTransactions();
  }, [API_URL]);

  useEffect(() => {
    const getMembers = async () => {
      try {
        const response = await axios.get(API_URL + "api/users/allmembers");
        const allMembers = response.data.map((member) => ({
          value: member._id,
          text: member.userType === "Student"
            ? `${member.userFullName}[${member.admissionId}]`
            : `${member.userFullName}[${member.employeeId}]`
        }));
        setAllMembers(allMembers);
      } catch (err) {
        handleErrors(err);
      }
    };

    if(refresh5 || refresh6){
      getMembers();
    }

    getMembers();
  }, [API_URL,refresh5,refresh6]);

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

    if(refresh2 || refresh3 || refresh7){
      getallBooks();
    }

    if (internalRefresh2) {
      getallBooks();
      setInternalRefresh2(false);
    }

    getallBooks();
  }, [API_URL,refresh2,refresh3,refresh7,internalRefresh2]);

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
        setallcopies(allcopies);
      } catch (err) {
        handleErrors(err);
      }
    };

    if(refresh2 || refresh3 || refresh7){
      getallcopies();
    }

    if (internalRefresh3) {
      getallcopies();
      setInternalRefresh3(false);
    }

    getallcopies();
  }, [API_URL,refresh2,refresh3,refresh7,internalRefresh3]);

  const handleScanResult = async (content) => {
    try {
      const scannedData = JSON.parse(content);
  
      if (scannedData) {
        if (scannedData.user_Id) {
          const scannedBorrowerId = scannedData.Id;
  
          const response = await axios.get(`${API_URL}api/users/getuser/${scannedBorrowerId}`);
  
          if (response.data) {
            setBorrowerId(scannedBorrowerId);
            setSuccessMessage(`Recognized User.`);
          } else {
            setSuccessMessage(`No user found with ID ${scannedBorrowerId}`);
          }
        } else if (scannedData.bookId) {
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
                    if (prevSelectedBooks.length === 1 && prevSelectedBooks[0].bookId === "") {
                      return [
                        {
                          bookId: scannedBookId,
                          copyId: copyResponse.data._id,
                          transactionType: "Issued",
                          fromDate: new Date(),
                          toDate: moment().add(14, 'days').toDate(),
                        },
                      ];
                    } else {
                      return [
                        ...prevSelectedBooks,
                        {
                          bookId: scannedBookId,
                          copyId: copyResponse.data._id,
                          transactionType: "Issued",
                          fromDate: new Date(),
                          toDate: moment().add(14, 'days').toDate(),
                        },
                      ];
                    }
                  } else {
                    setSuccessMessage("This book is already added.");
                    return prevSelectedBooks;
                  }
                });

                setSuccessMessage(`Recognized Book.`);
              } else {
                setSuccessMessage("This book copy is not available.");
              }
            } else {
              setSuccessMessage(`No book found with ID ${scannedBookId}`);
            }
          } else {
            setSuccessMessage("No copy ID found in the scanned data.");
          }
        } else {
          setSuccessMessage("Scan a valid QR code of Book or ID.");
        }
      }
    } catch (error) {
      setSuccessMessage(error.message);
    }
  };

  const handleMoreSettings = () => {
    setmoresettings(!moresettings);
  }

  return (
    <div className="Top-Box">
      <p className="dashboard-option-title">Add a Transaction</p>
      <div className="dashboard-title-line"></div>
      <Scanner onScanResult={handleScanResult} />
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form className='transaction-form' onSubmit={addTransaction}>
        <label className="transaction-form-label" htmlFor="borrowerId">Borrower<span className="required-field">*</span></label>
        <div className='semanticdropdown'>
          <Dropdown
            ref={dropdownRef}
            placeholder='Select Member'
            fluid
            search
            selection
            value={borrowerId}
            options={allMembers}
            onChange={(event, data) => setBorrowerId(data.value)}
            required
          />
        </div>
        <div className="more-settings">
          <input type="button" className="row-button-edit" value="Manually Enter Book Data" onClick={handleMoreSettings} />
        </div>
        <br />
  
        <div className="table-container">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>
                <label className="transaction-form-label-table" htmlFor="bookName">Book Name<span className="required-field">*</span></label>
              </th>
                <th>
                  <label className="transaction-form-label-table" htmlFor="copyId">Copy ID<span className="required-field">*</span></label>
                </th>
              <th>
                <label className="transaction-form-label-table" htmlFor="transactionType">Transaction Type<span className="required-field">*</span></label>
              </th>
              <th>
                <label className="transaction-form-label-table" htmlFor="from-date">From Date<span className="required-field">*</span></label>
              </th>
              <th>
                <label className="transaction-form-label-table" htmlFor="to-date">To Date<span className="required-field">*</span></label>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {selectedBooks.map((book, index) => (
              <tr key={index}>
                {moresettings ? (
                  <>
                    <td>
                      <div className='semanticdropdown-td'>
                        <Dropdown
                          ref={dropdownRef2}
                          placeholder='Select a Book'
                          fluid
                          search
                          selection
                          options={allBooks}
                          value={book.bookId}
                          onChange={(event, data) => handleBookSelectionChange(index, "bookId", data.value)}
                          required
                        />
                      </div>
                    </td>
                    {book.bookId ? (
                      <td>
                        <div className="semanticdropdown-td">
                          <Dropdown
                            ref={dropdownRef3}
                            placeholder="Select Copy ID"
                            fluid
                            search
                            selection
                            options={
                              allcopies && selectedBooks[index]
                                ? allcopies.filter((copy) => copy.bookId === selectedBooks[index].bookId && copy.isAvailable)
                                : []
                            }
                            value={book.copyId || ""}
                            onChange={(event, data) => handleBookSelectionChange(index, "copyId", data.value)}
                            required
                          />
                        </div>
                      </td>
                    ) : (
                      <td>
                        Select Book
                      </td>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
                <td>
                  <div className='semanticdropdown-td'>
                    <Dropdown
                      ref={dropdownRef4}
                      placeholder='Select Transaction'
                      fluid
                      selection
                      value={book.transactionType}
                      options={transactionTypes}
                      onChange={(event, data) => handleBookSelectionChange(index, "transactionType", data.value)}
                      required
                    />
                  </div>
                </td>
                <td>
                {moresettings ? (
                  <DatePicker
                    ref={datepickerRef}
                    className="date-picker"
                    placeholderText="MM/DD/YYYY"
                    selected={book.fromDate}
                    onChange={(date) => handleDateChange(index, "fromDate", date)}
                    minDate={new Date()}
                    dateFormat="MM/dd/yyyy"
                    required
                  />
                ) : (
                  <span>{book.fromDate ? book.fromDate.toLocaleDateString() : 'Select Date'}</span>
                )}
                </td>
                <td>
                  <DatePicker
                    ref={datepickerRef2}
                    className="date-picker"
                    placeholderText="MM/DD/YYYY"
                    selected={book.toDate}
                    onChange={(date) => handleDateChange(index, "toDate", date)}
                    minDate={new Date()}
                    dateFormat="MM/dd/yyyy"
                    required
                  />
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
        <input type="button" className="row-button" value="Add Book" onClick={addBookRow} />
        <input className="transaction-form-submit" type="submit" value="SUBMIT" disabled={isLoading} />
        </div>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <p className="dashboard-option-title">Recent Transactions</p>
      <div className="dashboard-title-line"></div>
      <table className="admindashboard-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Book Name</th>
            <th>Borrower Name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {recentTransactions.map((transaction, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{transaction.bookName}</td>
              <td>{transaction.borrowerName}</td>
              <td>{transaction.updatedAt.slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );  
}

export default AddTransaction;


