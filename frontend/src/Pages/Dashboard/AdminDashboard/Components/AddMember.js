import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from "axios";
import { Dropdown } from 'semantic-ui-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import DownIcon from '@material-ui/icons/MoreHoriz';
import UpIcon from '@material-ui/icons/ArrowDropUp';
import { admissionIdRegex, mobileNumberRegex, alphaRegex, emailRegex, employeeIdRegex, passwordRegex } from '../../../../Regex/regexPatterns';

function AddMember({ onMemberAdded, refresh6 }) {
    const API_URL = process.env.REACT_APP_API_URL;
    const [isLoading, setIsLoading] = useState(false);
    const [showAdminPrivileges, setShowAdminPrivileges] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [isCSVFormVisible, setIsCSVFormVisible] = useState(false);

    const [userFullName, setUserFullName] = useState(null);
    const [admissionId, setAdmissionId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [mobileNumber, setMobileNumber] = useState(null);
    const [recentAddedMembers, setRecentAddedMembers] = useState([]);
    const [userType, setUserType] = useState("Student");
    const [gender, setGender] = useState(null);
    const [dob, setDob] = useState(null);
    const [dobString, setDobString] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [isAdmin, setisAdmin] = useState(false);

    const dropdownRef = useRef();
    const dropdownRef2 = useRef();
    const dropdownRef3 = useRef();
    const datepickerRef = useRef();

    const successMessageTimeoutRef = useRef(null);

    const genderTypes = [
        { value: "Male", text: "Male" },
        { value: "Female", text: "Female" }
    ];

    const userTypes = [
        { value: 'Staff', text: 'Staff' },
        { value: 'Student', text: 'Student' }
    ];

    const isAdminOptions = [
        { key: 'true', text: 'True', value: true },
        { key: 'false', text: 'False', value: false },
    ];

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

    const toggleAdminPrivileges = () => {
        setShowAdminPrivileges(!showAdminPrivileges);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };
    
      const addMember = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (
            alphaRegex.test(userFullName) &&
            ((userType === "Student" ? admissionIdRegex.test(admissionId) : employeeIdRegex.test(employeeId)) &&
            mobileNumberRegex.test(mobileNumber) &&
            emailRegex.test(email) &&
            passwordRegex.test(password))
          ) {

        if (
            userFullName !== null &&
            userType !== null &&
            dobString !== null &&
            gender !== null &&
            mobileNumber !== null &&
            email !== null &&
            password !== null
        ) {
            const userData = {
                userType: userType,
                userFullName: userFullName,
                admissionId: admissionId,
                employeeId: employeeId,
                dob: dobString,
                gender: gender,
                mobileNumber: mobileNumber,
                email: email,
                password: password,
                photo: photo,
                isAdmin: isAdmin,
            };
            try {
                const response = await axios.post(API_URL + "api/auth/register", userData);
                if (recentAddedMembers.length >= 5) {
                    recentAddedMembers.splice(-1);
                }
                setRecentAddedMembers([response.data, ...recentAddedMembers]);

                setSuccessMessage("Member Added");

                const id_card = await axios.post(API_URL + "api/auth/generateidcard", { email: email });

                if (id_card.status === 200){
                    setSuccessMessage("Member Added & Generated E-ID is Sent to your email");
                } else {
                    const errorData = id_card.data;
                    throw new Error(errorData.message || 'Failed to Generate E-ID');
                }     

                setUserFullName(null);
                setAdmissionId(null);
                setEmployeeId(null);
                setMobileNumber(null);
                setEmail(null);
                setPassword(null);
                setGender(null);
                setDob(null);
                setDobString(null);
                setPhoto(null);
                setisAdmin(false);

                getMembers();
                onMemberAdded();
            } catch (err) {
                console.log(err);
            }
        } else {
            setSuccessMessage("All the fields must be filled");
        }
        } else {
        setSuccessMessage("Please fill in valid data for all fields.");
      }
        setIsLoading(false);
    }

    const getMembers = useCallback(async () => {
        try {
            const response = await axios.get(API_URL + "api/users/allmembers");
            const recentMembers = await response.data.slice(0, 5);
            setRecentAddedMembers(recentMembers);
        } catch (err) {
            console.log(err);
        }
    }, [API_URL]);
    
    useEffect(() => {

        if(refresh6) {
            getMembers();
        }

        getMembers();
    }, [getMembers, API_URL, refresh6]);

    const handleCSVFileUpload = async (file) => {
        try {
            const text = await file.text();

            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: async (result) => {
                    for (const record of result.data) {
                        try {
                            const userData = {
                                userType: userType,
                                userFullName: record.userFullName,
                                admissionId: record.admissionId,
                                employeeId: record.employeeId,
                                dob: moment(record.dob).format("MM/DD/YYYY"),
                                gender: record.gender,
                                mobileNumber: record.mobileNumber,
                                email: record.email,
                                password: record.password,
                                photo: record.photo,
                                isAdmin: false,
                            };

                            const response = await axios.post(API_URL + "api/auth/register", userData);

                            if (recentAddedMembers.length >= 5) {
                                recentAddedMembers.splice(-1);
                            }

                            setRecentAddedMembers([response.data, ...recentAddedMembers]);
                            setSuccessMessage("Members from CSV uploaded successfully");

                            // After adding members, fetch the updated list of members
                            getMembers();
                            onMemberAdded();
                        } catch (error) {
                            console.error(error);
                            setSuccessMessage("Error adding members from CSV");
                        }
                    }
                },
            });
        } catch (error) {
            console.error(error);
            setSuccessMessage("Error reading CSV file");
        }
    }

    const handleXLSXFileUpload = (file) => {
        const reader = new FileReader();
      
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
      
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
          for (const record of jsonData) {
            try {
              const userData = {
                userType: userType,
                userFullName: record[0],
                admissionId: record[1],
                employeeId: record[2],
                dob: moment(record[3]).format("MM/DD/YYYY"),
                gender: record[4],
                mobileNumber: record[5],
                email: record[6],
                password: record[7],
                photo: record[8],
                isAdmin: false,
              };
      
              const response = await axios.post(API_URL + "api/auth/register", userData);
      
              if (recentAddedMembers.length >= 5) {
                recentAddedMembers.splice(-1);
              }
      
              setRecentAddedMembers([response.data, ...recentAddedMembers]);
              setSuccessMessage("Members from XLSX uploaded successfully");
      
              getMembers();
            } catch (error) {
              console.error(error);
              setSuccessMessage("Error adding members from XLSX");
            }
          }
        };
      
        reader.readAsArrayBuffer(file);
      };      

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileExtension = file.name.split('.').pop().toLowerCase();
          if (fileExtension === "csv") {
            handleCSVFileUpload(file);
          } else if (fileExtension === "xlsx") {
            handleXLSXFileUpload(file);
          } else {
            setSuccessMessage("Unsupported file format. Please select a CSV or XLSX file.");
          }
        } else {
          setSuccessMessage("Please select a file to upload.");
        }
      };
      

    const toggleCSVForm = () => {
        setIsCSVFormVisible(true);
      }
    
      const toggleManualForm = () => {
        setIsCSVFormVisible(false);
      }

    return (
        <div className="Top-Box">
            <p className="dashboard-option-title">Add a Member</p>
            <div className="dashboard-title-line"></div>

            <div className="toggle-form">
            <input
                type="button"
                className="toggle-submit"
                value="Fill Manually"
                onClick={toggleManualForm}
            />
            <input
                type="button"
                className="toggle-submit"
                value="Upload CSV"
                onClick={toggleCSVForm}
            />
            </div>

            {isCSVFormVisible ? (
                <form className="addbook-form">
                    <label className="addbook-form-label" htmlFor="csvFile">
                        Upload CSV File
                    </label>
                    <br />
                    <input
                        className="addbook-form-input"
                        type="file"
                        accept=".csv"
                        id="csvFile"
                        onChange={handleFileInputChange}
                    />
                    <br />
                    <input
                        className="addbook-form-input"
                        type="submit"
                        value="Upload CSV"
                    />
                </form>
            ) : (
                <form className="addmember-form" onSubmit={addMember}>
                    <div className='semanticdropdown'>
                        <Dropdown
                            ref={dropdownRef}
                            placeholder='User Type'
                            fluid
                            selection
                            options={userTypes}
                            onChange={(event, data) => setUserType(data.value)}
                        />
                    </div>
                    <label className="addmember-form-label" htmlFor="userFullName">Full Name<span className="required-field">*</span></label><br />
                    <input className="addmember-form-input" type="text" name="userFullName" value={userFullName || ''} required onChange={(e) => setUserFullName(e.target.value)}></input><br />

                    <label className="addmember-form-label" htmlFor={userType === "Student" ? "admissionId" : "employeeId"}>{userType === "Student" ? "Student Id" : "Employee Id"}<span className="required-field">*</span></label><br />
                    <input className="addmember-form-input" type="text" value={userType === "Student" ? admissionId || '' : employeeId || ''} required onChange={(e) => { userType === "Student" ? setAdmissionId(e.target.value) : setEmployeeId(e.target.value) }}></input><br />

                    <label className="addmember-form-label" htmlFor="mobileNumber">Mobile Number<span className="required-field">*</span></label><br />
                    <input className="addmember-form-input" type="text" value={mobileNumber || ''} required onChange={(e) => setMobileNumber(e.target.value)}></input><br />

                    <label className="addmember-form-label" htmlFor="gender">Gender<span className="required-field">*</span></label><br />
                    <div className='semanticdropdown'>
                        <Dropdown
                            ref={dropdownRef2}
                            placeholder='User Type'
                            fluid
                            selection
                            value={gender || ''}
                            options={genderTypes}
                            onChange={(event, data) => setGender(data.value)}
                        />
                    </div>

                    <label className="addmember-form-label" htmlFor="dob">Date of Birth<span className="required-field">*</span></label><br />
                    <DatePicker
                        ref={datepickerRef}
                        className="date-picker"
                        placeholderText="MM/DD/YYYY"
                        selected={dob || ''}
                        onChange={(date) => { setDob(date); setDobString(moment(date).format("MM/DD/YYYY")) }}
                        dateFormat="MM/dd/yyyy"
                    /><br />

                    {/* Photo Upload */}
                    <label className="addmember-form-label" htmlFor="photo">Upload Photo</label><br />
                    <input
                        className="addmember-form-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    ></input><br />

                    <label className="addmember-form-label" htmlFor="email">Email<span className="required-field">*</span></label><br />
                    <input className="addmember-form-input" type="email" value={email || ''} required onChange={(e) => setEmail(e.target.value)}></input><br />

                    <label className="addmember-form-label" htmlFor="password">Password<span className="required-field">*</span></label><br />
                    <input className="addmember-form-input" type="password" value={password || ''} onChange={(e) => setPassword(e.target.value)}></input><br />

                    <div className="admin-row">
                        <div className="Admin-toggler" onClick={toggleAdminPrivileges}>
                            {showAdminPrivileges ? (
                            <UpIcon style={{ fontSize: 30, color: "grey" }} />
                            ) : (
                            <DownIcon style={{ fontSize: 30, color: "grey" }} />
                            )}
                        </div>
                    </div>

                    {/* Display the "isAdmin" field if showAdminPrivileges is true */}
                    {showAdminPrivileges && (
                        <div className="admin-subsection">
                            <label className="addmember-form-label smaller-label">
                            Is Admin 
                            </label>
                            <br />
                            <div className="semanticdropdown">
                            <Dropdown
                                ref={dropdownRef3}
                                fluid
                                selection
                                options={isAdminOptions}
                                value={isAdmin || false}
                                onChange={(event, data) => setisAdmin(data.value)}
                            />
                            </div>
                        </div>
                    )}

                    <input className="addmember-submit" type="submit" value="SUBMIT" disabled={isLoading}></input>
                </form>
            )}

            {successMessage && <p className="success-message">{successMessage}</p>}
            <p className="dashboard-option-title">Added Members</p>
            <div className="dashboard-title-line"></div>
            <table className='admindashboard-table'>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Member Type</th>
                        <th>Member ID</th>
                        <th>Member Name</th>
                    </tr>
                </thead>
                <tbody>
                    {recentAddedMembers.map((member, index) => {
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{member.userType}</td>
                                <td>{userType === "Student" ? member.admissionId : member.employeeId}</td>
                                <td>{member.userFullName}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default AddMember;



