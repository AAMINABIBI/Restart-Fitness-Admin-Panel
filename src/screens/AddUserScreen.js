import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.name) {
      toast.error('Email and name are required.', { autoClose: 3000 });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.', { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // Show success toast
      toast.success('User added successfully!', { autoClose: 3000 });

      // Navigate back to dashboard after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error adding user:', err.message);
      if (err.code === 'permission-denied') {
        toast.error('Firestore database not initialized. Please contact the project owner.', { autoClose: 3000 });
      } else {
        toast.error('Failed to add user. Please try again later.', { autoClose: 3000 });
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
                    placeholder="XYZ"
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
                    placeholder="xyz@gmail.com"
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default AddUserScreen;