import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './AddUserScreen.css';

function AddUserScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    profileCompleted: false,
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.name) {
      setError('Email and name are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
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
      // Add user to 'users' collection
      const userRef = await addDoc(collection(db, 'users'), {
        email: formData.email,
        name: formData.name,
        profileCompleted: formData.profileCompleted,
        createdAt: new Date().toISOString(),
      });
      console.log('User added to Firestore:', userRef.id);

      // Initialize userProgress document for the new user
      const userProgressRef = doc(db, 'userProgress', userRef.id);
      await setDoc(userProgressRef, {
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
        assignedWorkouts: [],
        assignedDietPlans: [],
      });
      console.log('User progress initialized:', userRef.id);

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
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Usama Yousaf"
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
                    placeholder="usama.yousaf0334@gmail.com"
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