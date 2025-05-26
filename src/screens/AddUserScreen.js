import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AddUserScreen.css';

function AddUserScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileCompleted: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const collectionRef = isAdmin ? collection(db, 'adminUsers') : collection(db, 'users');
      const newUserRef = await addDoc(collectionRef, {
        ...formData,
        createdAt: serverTimestamp(),
        collection: collectionRef.id,
      });
      console.log('User added to:', collectionRef.id, 'with ID:', newUserRef.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="add-user-screen">
      <h2>Add User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter name"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            required
          />
        </div>
        <div className="form-group">
          <label>Profile Completed</label>
          <input
            type="checkbox"
            name="profileCompleted"
            checked={formData.profileCompleted}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Is Admin</label>
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
        </div>
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default AddUserScreen;