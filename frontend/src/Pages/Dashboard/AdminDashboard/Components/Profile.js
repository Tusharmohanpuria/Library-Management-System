import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../../../../Context/AuthContext';
import '../AdminDashboard.css';
import '../../MemberDashboard/MemberDashboard.css';
import { alphaRegex, emailRegex, number } from '../../../../Regex/regexPatterns'

function Profile({ onProfileEdited }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
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

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const response = await axios.get(API_URL + 'api/users/getuser/' + user._id);
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };

    getProfileData();
  }, [API_URL, user]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedProfile(profileData);
  };

  const validateGender = (gender) => {
    const allowedGenders = ['Male', 'Female'];
    return allowedGenders.includes(gender);
  };

  const validateProfileFields = () => {
    if (
      !alphaRegex.test(editedProfile.userFullName) ||
      !editedProfile.email ||
      !emailRegex.test(editedProfile.email) ||
      !number.test(editedProfile.mobileNumber) ||
      !validateGender(editedProfile.gender)
    ) {
      setSuccessMessage('Please fill in all required fields with valid data.');
      return false;
    }
    return true;
  };

  const handleSaveClick = async () => {
    if (!validateProfileFields()) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}api/users/updateuser/${user._id}`,
        editedProfile
      );

      if (response.status === 200) {
        setIsEditing(false);
        
        setProfileData(editedProfile);
        setSuccessMessage('Profile updated successfully');
        onProfileEdited();
      } else {
        setSuccessMessage('Profile update failed.');
      }
    } catch (error) {
      console.error('Edit request failed:', error);
      setSuccessMessage('Profile update failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        const response = await axios.delete(`${API_URL}api/users/deleteuser/${user._id}`);

        if (response.status === 200) {
          setSuccessMessage('Account deleted successfully');
          localStorage.removeItem('user');
          window.location.reload();
        } else if (response.status === 403) {
          setSuccessMessage('Permission denied. You are not allowed to delete your account.');
        } else {
          setSuccessMessage('Account delete failed.');
        }
      } catch (error) {
        console.error('Delete request failed:', error);
        setSuccessMessage('Account delete failed.');
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  return (
    <div className="Top-Box">
      <div className="member-profile-content" id="profile@member">
        <div className="user-details-topbar">
          <img
            className="user-profileimage"
            src={(editedProfile?.photo ? editedProfile.photo : profileData?.photo) || './assets/images/Profile.png'}
            alt=""
          />
          <div className="user-info">
            <p className="user-name">
              {isEditing ? (
                <input
                  className="addbook-form-input"
                  type="text"
                  value={editedProfile.userFullName}
                  onChange={(e) => handleFieldChange('userFullName', e.target.value)}
                />
              ) : (
                profileData?.userFullName
              )}
            </p>
            <p className="user-id">
                {profileData?.userType === 'Student' ? profileData?.admissionId : profileData?.employeeId}
              </p>
            <p className="user-email">
              {isEditing ? (
                <input
                  className="addbook-form-input"
                  type="text"
                  value={editedProfile.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
              ) : (
                profileData?.email
              )}
            </p>
            <p className="user-phone">
              {isEditing ? (
                <input
                  className="addbook-form-input"
                  type="text"
                  value={editedProfile.mobileNumber}
                  onChange={(e) => handleFieldChange('mobileNumber', e.target.value)}
                />
              ) : (
                profileData?.mobileNumber
              )}
            </p>
          </div>
        </div>
        <div className="user-details-specific">
          <div className="specific-left">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p style={{ flex: '0.5', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px' }}>
                  <b>Age: </b>
                </span>
                <span style={{ fontSize: '16px' }}>
                  {profileData?.age}
                </span>
              </p>
              <p style={{ flex: '0.5', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px' }}>
                  <b>Gender: </b>
                </span>
                <span style={{ fontSize: '16px' }}>
                  {isEditing ? (
                    <input
                      className="addbook-form-input"
                      type="text"
                      value={editedProfile.gender}
                      onChange={(e) => handleFieldChange('gender', e.target.value)}
                    />
                  ) : (
                    profileData?.gender
                  )}
                </span>
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
              <p style={{ flex: '1', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px' }}>
                  <b>DOB: </b>
                </span>
                <span style={{ fontSize: '16px' }}>
                  {isEditing ? (
                    <input
                      className="addbook-form-input"
                      type="date"
                      value={moment(editedProfile.dob).format('YYYY-MM-DD')}
                      onChange={(e) => handleFieldChange('dob', e.target.value)}
                    />
                  ) : (
                    profileData?.dob ? moment(profileData.dob).format('YYYY-MM-DD') : ''
                  )}
                </span>
              </p>
            </div>
          </div>
          <div className="specific-right">
            <div className="dashboard-title-line"></div>
            <div style={{ flex: '0.5' }}>
              <p style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <b>Points</b>
              </p>
              <p style={{ fontSize: '25px', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                {profileData?.points}
              </p>
            </div>
            <div className="dashboard-title-line"></div>
          </div>
        </div>
        <div className="profile-buttons">
          {isEditing ? (
            <input type="button" className="row-button-edit" value="Save" onClick={handleSaveClick} />
          ) : (
            <input type="button" className="row-button-edit" value="Edit" onClick={handleEditClick} />
          )}
          <input type="button" className="row-button-edit" value="Delete Account" onClick={handleDeleteAccount} />
        </div>
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
}

export default Profile;


