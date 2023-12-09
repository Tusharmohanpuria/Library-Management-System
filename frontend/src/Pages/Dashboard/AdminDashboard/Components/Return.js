import React, { useContext, useEffect, useState, useRef } from 'react';
import "../AdminDashboard.css";
import axios from "axios";
import { Dropdown } from 'semantic-ui-react';
import '../../MemberDashboard/MemberDashboard.css';
import moment from "moment";
import { AuthContext } from '../../../../Context/AuthContext';
import Scanner from './Scanner';
import QRCode from 'qrious';

function Return({ onReturn, refresh4 }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [allTransactions, setAllTransactions] = useState([]);
  const [ExecutionStatus, setExecutionStatus] = useState(null);
  const [allMembersOptions, setAllMembersOptions] = useState(null);
  const [borrowerId, setBorrowerId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setqrCode] = useState("");
  const [finerecived, setfinerecieved] = useState(false);

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
    const getMembers = async () => {
      try {
        const response = await axios.get(API_URL + "api/users/allmembers");
        setAllMembersOptions(response.data.map((member) => (
          { value: `${member?._id}`, text: `${member?.userType === "Student" ? `${member?.userFullName}[${member?.admissionId}]` : `${member?.userFullName}[${member?.employeeId}]`}` }
        )));
      }
      catch (err) {
        console.log(err);
      }
    };
    getMembers();
  }, [API_URL]);

  useEffect(() => {
    const getAllTransactions = async () => {
      try {
        const response = await axios.get(API_URL + "api/transactions/all-transactions");
        const copyResponse = await axios.get(API_URL + "api/bookcopies/allcopies");
        
        const transactionsWithCopyId = response.data
          .sort((a, b) => Date.parse(a.toDate) - Date.parse(b.toDate))
          .filter((data) => data.transactionStatus === "Active")
          .map((transaction) => {
            const matchingCopy = copyResponse.data.find((copy) => copy._id === transaction.copyId);
        
            if (matchingCopy) {
              return {
                ...transaction,
                copynumber: matchingCopy.copyId,
              };
            }

            console.warn(`Matching copy not found for transaction with copyId: ${transaction.copyId}`);
            return transaction;
          });
        
        setAllTransactions(transactionsWithCopyId);        

        setExecutionStatus(null);
      }
      catch (err) {
        console.log(err);
      }
    };
    getAllTransactions();

    if (refresh4) {
      getAllTransactions();
    }

  }, [API_URL, ExecutionStatus, refresh4]);

  const payfine = async (due) => {
    const amount = due * 10;
    const link = `upi://pay?pa=tusharmohanpuria2003@okaxis&pn=Tushar Mohanpuria&tn=Testing&am=${amount}&cu=INR&tr=01234`;

    try {
      const qr = new QRCode({
        value: link,
        size: 200,
      });

      const qrCodeData = qr.toDataURL();

      setqrCode(qrCodeData);
      setShowQRCode(true);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleCloseQRCode = () => {
    setShowQRCode(false);
    const confirmReturn = window.confirm("Is the fine paid?");
    if (confirmReturn) {
      setfinerecieved(true);
    }
  };

  const returnBook = async (transactionId, borrowerId, bookId, copyId, due) => {
    try {
      if (due > 0) {
        await payfine(due);

        const timeout = 60000;
        const startTime = Date.now();
    
        while (!finerecived) {

          if(finerecived)
          {
            break;
          }
          if (Date.now() - startTime > timeout) {
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));

          setSuccessMessage("Please pay the fine to return the book");
        }
      }

      const response = await axios.put(API_URL + `api/bookcopies/updatecopy/${copyId}`, { isAvailable: true });

      if (response.status !== 200) {
        const errorData = response.data;
        throw new Error(errorData.message || 'Failed to update copy');
      }

      await axios.put(API_URL + "api/transactions/update-transaction/" + transactionId, {
        isAdmin: user.isAdmin,
        transactionStatus: "Completed",
        returnDate: moment(new Date()).format("MM/DD/YYYY")
      });

      const borrowerdata = await axios.get(API_URL + "api/users/getuser/" + borrowerId);
      const points = borrowerdata.data.points;

      if (due > 0) {
        await axios.put(API_URL + "api/users/updateuser/" + borrowerId, {
          points: points - 10,
          isAdmin: user.isAdmin
        });

      } else if (due <= 0) {
        await axios.put(API_URL + "api/users/updateuser/" + borrowerId, {
          points: points + 10,
          isAdmin: user.isAdmin
        });
      }

      const book_details = await axios.get(API_URL + "api/books/getbook/" + bookId);
      await axios.put(API_URL + "api/books/updatebook/" + bookId, {
        isAdmin: user.isAdmin,
        bookCountAvailable: book_details.data.bookCountAvailable + 1
      });

      await axios.put(API_URL + `api/users/${transactionId}/move-to-prevtransactions`, {
        userId: borrowerId,
        isAdmin: user.isAdmin
      });

      setExecutionStatus("Completed");
      setSuccessMessage("Book returned to the library successfully");

      onReturn();

    } catch (err) {
      console.log(err);
    }
  };

  const convertToIssue = async (transactionId) => {
    try {
      await axios.put(API_URL + "api/transactions/update-transaction/" + transactionId, {
        transactionType: "Issued",
        isAdmin: user.isAdmin
      });
      setExecutionStatus("Completed");
      setSuccessMessage("Book issued successfully");
    }
    catch (err) {
      console.log(err);
    }
  };

  const handleScanResult = async (content) => {
    try {
      const ScannedData = JSON.parse(content);
      
      if (ScannedData && ScannedData.Id) {
        const scannedBorrowerId = ScannedData.Id;
  
        const response = await axios.get(`${API_URL}api/users/getuser/${scannedBorrowerId}`);
  
        if (response.data) {
          setBorrowerId(scannedBorrowerId);
          setSuccessMessage(`Recognized User.`);
        } else {
          setSuccessMessage(`No user found with ID ${ScannedData.user_Id} with name ${ScannedData.name}`);
        }
      } else {
        setSuccessMessage("Scan a valid ID.");
      }
    } catch (error) {
      setSuccessMessage("Error processing scan data. Please try again.");
    }
  };

  return (
    <div className="Top-Box">
      <p className="dashboard-option-title">Returns Desk</p>
      <div className="dashboard-title-line"></div>
      <Scanner onScanResult={handleScanResult} />
      <div className='semanticdropdown returnbook-dropdown'>
        <Dropdown
          ref={dropdownRef}
          placeholder='Select Member'
          fluid
          search
          selection
          value={borrowerId}
          options={allMembersOptions}
          onChange={(event, data) => setBorrowerId(data.value)}
        />
      </div>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <p className="dashboard-option-title">Issued</p>
      <div className="admindashboard-table-container">
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Copy Number</th>
              <th>Borrower Name</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Fine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allTransactions
              ?.filter((data) => {
                if (borrowerId === null) {
                  return data.transactionType === "Issued";
                } else {
                  return data.borrowerId === borrowerId && data.transactionType === "Issued";
                }
              })
              .map((data, index) => {
                return (
                  <tr key={index}>
                    <td>{data.bookName}</td>
                    <td>{data.copynumber}</td>
                    <td>{data.borrowerName}</td>
                    <td>{data.fromDate}</td>
                    <td>{data.toDate}</td>
                    <td>
                      {(Math.floor((Date.parse(moment(new Date()).format("MM/DD/YYYY")) - Date.parse(data.toDate)) / 86400000)) <= 0
                        ? 0
                        : (Math.floor((Date.parse(moment(new Date()).format("MM/DD/YYYY")) - Date.parse(data.toDate)) / 86400000)) * 10}
                    </td>
                    <td>
                      <input
                        type="button"
                        className="row-button-edit"
                        value="Return"
                        onClick={() =>
                          returnBook(data._id, data.borrowerId, data.bookId, data.copyId, (Math.floor((Date.parse(moment(new Date()).format("MM/DD/YYYY")) - Date.parse(data.toDate)) / 86400000)))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="dashboard-option-title">Reserved</p>
      <div className="admindashboard-table-container">
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>Book Name</th>
              <th>Copy Number</th>
              <th>Borrower Name</th>
              <th>From Date</th>
              <th>To Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allTransactions
              ?.filter((data) => {
                if (borrowerId === null) {
                  return data.transactionType === "Reserved";
                } else {
                  return data.borrowerId === borrowerId && data.transactionType === "Reserved";
                }
              })
              .map((data, index) => {
                return (
                  <tr key={index}>
                    <td>{data.bookName}</td>
                    <td>{data.copynumber}</td>
                    <td>{data.borrowerName}</td>
                    <td>{data.fromDate}</td>
                    <td>{data.toDate}</td>
                    <td>
                      <input
                        type="button"
                        className="row-button-edit"
                        value="Convert"
                        onClick={() => convertToIssue(data._id)}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      {showQRCode && (
        <div className="qrcode-popup">
          <img src={`${qrCode}`} alt="QR Code" />
          <button onClick={handleCloseQRCode}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Return;



