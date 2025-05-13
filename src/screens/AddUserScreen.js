import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './AddUserScreen.css';

function AddUserScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUsers } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    image: null,
  });
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phone || !formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!/^\+\d{1,4}\s\d{3}\s\d{3}\s\d{4}$/.test(formData.phone)) {
      setError('Please enter a valid phone number (e.g., +92 323 385 3454).');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!formData.image) {
      setError('Please upload an image.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `user_images/${Date.now()}_${formData.image.name}`);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      // Prepare user data
      const userData = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.newPassword, // Note: Storing passwords in Firestore is not recommended in production; use Firebase Authentication instead
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
      };

      // Add user to Firestore
      const docRef = await addDoc(collection(db, 'users'), userData);
      console.log('User added to Firestore:', docRef.id);

      // Update local state (for immediate UI update)
      if (setUsers) {
        setUsers((prevUsers) => [...prevUsers, { id: docRef.id, ...userData }]);
      }

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error adding user:', err.message);
      if (err.code === 'permission-denied') {
        setError('Firestore database not initialized. Please contact the project owner.');
      } else {
        setError('Failed to add user. Please try again later.');
      }
    }
  };

  return (
    <div className="add-user-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="add-user-section">
          <div className="add-user-header">
            <div className="information">Add New User</div>
            <button className="add-users-button" onClick={() => navigate('/dashboard')}>
              Back to Users
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-sections">
            <form onSubmit={handleSubmit}>
              <div className="form-section basic-info">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Michael"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone (Compulsory)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 323 385 3454"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email (Compulsory)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="loremipsum@gmail.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Profile Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    required
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-section create-password">
                <h3>Create Password</h3>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="update-button">
                Add User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUserScreen;