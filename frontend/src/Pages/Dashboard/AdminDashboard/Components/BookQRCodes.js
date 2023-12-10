import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactToPrint from 'react-to-print';

function BookQRCodes({ bookId, onClose }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [bookcopy, setBookCopy] = useState({});
  const [bookCopies, setBookCopies] = useState([]);

  useEffect(() => {
    const fetchBookCopies = async () => {
      try {
        const response = await axios.get(`${API_URL}api/bookcopies/getcopies/${bookId}`);
        setBookCopies(response.data);
        console.log('Book copies:', response.data);
      } catch (error) {
        console.error('Error fetching book copies:', error);
      }
    };

    fetchBookCopies();
  }, [API_URL, bookId]);

  const handlePrintSingle = () => {
    return (
      <div>
        <p>Print QR Code</p>
        <div style={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img style={{ width: '85%', height: 'auto' }} src={`data:image/png;base64,${bookcopy.qrCode}`} alt={`QR Code for ${bookcopy.copyId}`} />
        </div>
      </div>
    );
  };  

  const handlePrintAll = () => {
    const content = bookCopies.map((copy, index) => (
      <div key={copy._id} style={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img style={{ width: '85%', height: 'auto' }} src={`data:image/png;base64,${copy.qrCode}`} alt={`QR Code for ${copy.copyId}`} />
      </div>
    ));
  
    return (
      <>
      <p>Print QR Codes</p>
      <div style={{ margin: '25px 0', display: 'grid', alignContent: 'center', justifyContent: 'center', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '5px' }}>
        {content}
      </div>
      </>
    );
  };  

  const componentRef = React.useRef();
  const componentRefSingle = React.useRef();

  return (
    <>
      <table className="admindashboard-table">
        <thead>
          <tr>
            <th>Copy ID</th>
            <th>QR Code</th>
            <th>Print</th>
          </tr>
        </thead>
        <tbody>
          {bookCopies.map((copy) => (
            <tr key={copy._id}>
              <td>{copy.copyId}</td>
              <td>
                <img src={`data:image/png;base64,${copy.qrCode}`} alt={`QR Code for ${copy.copyId}`} />
              </td>
              <td>
              <ReactToPrint
                trigger={() => <button className="row-button-edit" onClick={setBookCopy(copy)}>Print</button>}
                content={() => componentRefSingle.current}
              />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ReactToPrint
        trigger={() => <button className="addbook-submit">Print All</button>}
        content={() => componentRef.current}
      />
      <input type="button" className="addbook-submit" value="Return" onClick={onClose} />

      <div style={{ display: 'none' }}>
        <div ref={componentRef}>
          {handlePrintAll()}
        </div>
      </div>

      <div style={{ display: 'none' }}>
        <div ref={componentRefSingle}>
              {handlePrintSingle()}
        </div>
      </div>
    </>
  );
}

export default BookQRCodes;


