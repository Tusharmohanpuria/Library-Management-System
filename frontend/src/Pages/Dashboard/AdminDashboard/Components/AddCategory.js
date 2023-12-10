import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../Context/AuthContext';
import { categoryNameRegex } from '../../../../Regex/regexPatterns';

function AddCategory({ onCategoryAdded }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState("");

  const [categoryName, setCategoryName] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [isRefreshNeeded, setIsRefreshNeeded] = useState(false);

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

    if (isRefreshNeeded) {
      getAllCategories();
      setIsRefreshNeeded(false);
    } else {
      getAllCategories();
    }
  }, [API_URL, isRefreshNeeded]);

  const addCategory = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!categoryNameRegex.test(categoryName)) {
      setSuccessMessage('Category Name is invalid');
      setIsLoading(false);
      return;
    }  

    const categoryData = {
      categoryName,
      isAdmin: user.isAdmin,
    };

    try {
      await axios.post(API_URL + 'api/categories/addcategory', categoryData);
      setCategoryName('');
      setSuccessMessage('Category Added Successfully');

      setIsRefreshNeeded(true);

      if (onCategoryAdded) {
        onCategoryAdded();
      }
    } catch (err) {
      console.log(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="Top-Box">
      <p className="dashboard-option-title">Add a Category</p>
      <div className="dashboard-title-line"></div>
      <form className="addcategory-form" onSubmit={addCategory}>
        <label className="addcategory-form-label" htmlFor="categoryName">
          Category Name<span className="required-field">*</span>
        </label>
        <br />
        <input
          className="addcategory-form-input"
          type="text"
          name="categoryName"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <br />

        <input className="addcategory-submit" type="submit" value="SUBMIT" disabled={isLoading} />
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <div>
        <p className="dashboard-option-title">All Categories</p>
        <div className="dashboard-title-line"></div>
        <table className="admindashboard-table">
          <thead>
            <tr>
              <th>Category Name</th>
            </tr>
          </thead>
          <tbody>
            {allCategories.map((category) => (
              <tr key={category.value}>
                <td>{category.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AddCategory;


