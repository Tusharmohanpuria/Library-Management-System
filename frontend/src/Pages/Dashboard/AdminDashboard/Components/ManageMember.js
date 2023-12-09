import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../Context/AuthContext';
import '../AdminDashboard.css';
import '../../../Allbooks.css';
import moment from 'moment';
import { admissionIdRegex, emailRegex, employeeIdRegex, mobileNumberRegex } from '../../../../Regex/regexPatterns';

function ManageMember({ onMemberEdited, refresh5 }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [members, setMembers] = useState([]);
  const { user } = useContext(AuthContext);
  const [editingMember, setEditingMember] = useState(null);
  const [searchField, setSearchField] = useState('all');
  const [search, setSearch] = useState('');
  const initialMemberData = {
    userType: '',
    userFullName: '',
    admissionId: '',
    employeeId: '',
    age: 0,
    gender: '',
    dob: null,
    mobileNumber: '',
    photo: '',
    email: '',
    password: '',
  };
  const [MemberData, setMemberData] = useState(initialMemberData);
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

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(API_URL + 'api/users/allmembers');
      setMembers(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refresh5) {
      fetchData();
    }
    fetchData();
  }, [API_URL, fetchData, refresh5]);

  const handleSearchFieldChange = (field) => {
    setSearchField(field);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const performSearch = () => {
    const filteredMembers = members.filter((member) => {
      if (member) {
        const combinedId = (member.admissionId || member.employeeId || '').toLowerCase();
        if (searchField === 'all') {
          return (
            member.userFullName.toLowerCase().includes(search.toLowerCase()) ||
            member.email.toLowerCase().includes(search.toLowerCase()) ||
            combinedId.includes(search.toLowerCase())
          );
        } else if (searchField === 'employeeId' || searchField === 'admissionId') {
          return combinedId.includes(search.toLowerCase());
        } else {
          return member[searchField].toLowerCase().includes(search.toLowerCase());
        }
      }
      return false;
    });
    setMembers(filteredMembers);
  };  

  const handleEditClick = (member) => {
    if (member.isAdmin) {
      setSuccessMessage('Permission denied. Member is an admin.');
    } else {
      setEditingMember(member);
      setMemberData(member);
    }
  };

  const handleSaveClick = async () => {
    try {
        if (
          !MemberData.userFullName ||
          !MemberData.email ||
          !MemberData.userType ||
          !(MemberData.admissionId || MemberData.employeeId) ||
          !emailRegex.test(MemberData.email) ||
          !mobileNumberRegex.test(MemberData.mobileNumber) ||
          !(admissionIdRegex.test(MemberData.admissionId) || employeeIdRegex.test(MemberData.employeeId))
        ) {
          setSuccessMessage('Please fill in all required fields with valid data.');
          return;
        }

      const memberDataToUpdate = {
        isAdmin: user.isAdmin,
        userType: MemberData.userType,
        userFullName: MemberData.userFullName,
        admissionId: MemberData.admissionId,
        employeeId: MemberData.employeeId,
        age: MemberData.age,
        gender: MemberData.gender,
        dob: MemberData.dob,
        mobileNumber: MemberData.mobileNumber,
        photo: MemberData.photo,
        email: MemberData.email,
      };

      const response = await axios.put(
        `${API_URL}api/users/updateuser/${editingMember._id}`,
        memberDataToUpdate
      );

      if (response.status === 200) {
        setSuccessMessage('Member updated successfully');
        
        const id_card = await axios.post(API_URL + "api/auth/generateidcard", { email: MemberData.email });

        if (id_card.status === 200){
            setSuccessMessage("Member updated & New E-ID is Sent to your email");
        } else {
            const errorData = id_card.data;
            throw new Error(errorData.message || 'Failed to Generate E-ID');
        }

        setMemberData(initialMemberData);
        setEditingMember(null);

        fetchData();
        performSearch();
        onMemberEdited();
      } else {
        setSuccessMessage('Member update failed.');
      }
    } catch (error) {
      console.error('Edit request failed:', error);
      setSuccessMessage('Member update failed.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberData({ ...MemberData, photo: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteClick = (member) => {
    if (member.isAdmin) {
      setSuccessMessage('Permission denied. Member is an admin.');
    } else {
      deleteMember(member._id);
    }
  };  

  const deleteMember = async (memberId) => {
    try {
      const response = await axios.delete(`${API_URL}api/users/deleteuser/${memberId}`, {
        data: { userId: user._id, isAdmin: user.isAdmin },
      });

      if (response.status === 200) {
        setMembers(members.filter((member) => member._id !== memberId));
        setSuccessMessage('Member deleted successfully');
        onMemberEdited();
      } else if (response.status === 403) {
        setSuccessMessage('Permission denied. You are not allowed to delete this member.');
      } else {
        setSuccessMessage('Member delete failed');
      }
    } catch (error) {
      console.error('Delete request failed:', error);
      setSuccessMessage('Member delete failed');
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...MemberData };
    updatedData[field] = value;
    setMemberData(updatedData);
  };

  return (
    <div className="Top-Box">
      <p className="dashboard-option-title">Manage Members</p>
      <div className="dashboard-title-line"></div>
      <div className="Search-Box">
        <div className="search-inputs">
          <div className="search-field-popup">
            <select
              className="search-select"
              onChange={(e) => handleSearchFieldChange(e.target.value)}
              value={searchField}
            >
              <option value="all">All</option>
              <option value="userFullName">User Full Name</option>
              <option value="admissionId">Admission ID</option>
              <option value="employeeId">Employee ID</option>
              <option value="email">Email</option>
            </select>
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search by Name, Admission ID, or Email"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <input
            type="submit"
            value="Search"
            id="search-button"
            onClick={performSearch}
          />
        </div>
      </div>
      <div>
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="table-container">
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>User Full Name</th>
              <th>Student ID</th>
              <th>Employee ID</th>
              <th>Date of Birth</th>
              <th>Mobile Number</th>
              <th>Email</th>
              <th>Photo</th>
              <th>IsAdmin</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member._id}>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={MemberData.userFullName}
                      onChange={(e) =>
                        handleFieldChange('userFullName', e.target.value)
                      }
                    />
                  ) : (
                    member.userFullName
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={MemberData.admissionId}
                      onChange={(e) =>
                        handleFieldChange('admissionId', e.target.value)
                      }
                    />
                  ) : (
                    member.admissionId || ''
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={MemberData.employeeId}
                      onChange={(e) =>
                        handleFieldChange('employeeId', e.target.value)
                      }
                    />
                  ) : (
                    member.employeeId || ''
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="date"
                      value={moment(MemberData.dob).format('YYYY-MM-DD')}
                      onChange={(e) =>
                        handleFieldChange('dob', e.target.value)
                      }
                    />
                  ) : (
                    moment(member.dob).format('DD/MM/YYYY')
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={MemberData.mobileNumber}
                      onChange={(e) =>
                        handleFieldChange('mobileNumber', e.target.value)
                      }
                    />
                  ) : (
                    member.mobileNumber
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={MemberData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                    />
                  ) : (
                    member.email
                  )}
                </td>
                <td>
                  {member === editingMember ? (
                    <input
                      className="addbook-form-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  ) : (
                    <img
                      className="table-img"
                      src={member.photo}
                      alt={member.userFullName}
                    />
                  )}
                </td>
                <td>
                  {member.isAdmin ? "Yes" : "No"}
                </td>
                <td>
                {member === editingMember ? (
                  <input
                    className="row-button-edit"
                    type="button"
                    value="Save"
                    onClick={handleSaveClick}
                  />
                ) : (
                  <input
                    className="row-button-edit"
                    type="button"
                    value="Edit"
                    onClick={() => handleEditClick(member)}
                  />
                )}
              </td>
              <td>
                <input
                  className="row-button-edit"
                  type="button"
                  value="Delete"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${member.userFullName}?`
                      )
                    ) {
                      handleDeleteClick(member);
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
  );
}

export default ManageMember;



