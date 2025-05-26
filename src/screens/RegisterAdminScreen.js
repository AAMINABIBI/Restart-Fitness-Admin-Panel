import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import './RegisterAdminScreen.css';

function RegisterAdminScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
const [isLoading,setisLoading]=useState(false)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
setisLoading(true)
    if (!validateForm()) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if the user already exists in adminUsers (in case of partial registration)
      const adminDocRef = doc(db, 'adminUsers', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        // Save admin data in adminUsers collection
        await setDoc(adminDocRef, {
          email: formData.email,
          name: formData.email.split('@')[0],
          profileCompleted: false,
          isAdmin: true,
          createdAt: serverTimestamp(),
        });
        console.log('Admin registered successfully:', formData.email);
      } else {
        console.log('Admin already exists in adminUsers, proceeding to login.');
      }
setisLoading(false)
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered with Firebase Authentication. Please use a different email or log in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. It must be at least 6 characters long.');
      } else {
        setError('Failed to register. Please try again later.');
      }
      setisLoading(false)
    }
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  return (
    <div className="register-admin-screen-container">
      <div className="register-form-section">
        <div>
          <img src={logo} className="sidebar-logo" alt="Logo" />
        </div>
        <h4>Create a new admin account</h4>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          {
            isLoading &&<div className='spinner'>Loading...</div>
          }
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email (e.g., admin@restart.com)"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              required
            />
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <p className="login-redirect">
          Already have an account?{' '}
          <span onClick={handleLoginRedirect} className="login-link">
            Login here
          </span>
        </p>
        <div className="copyright">
          © 2025 Andrews | ALL RIGHT RESERVED
        </div>
      </div>
      <div className="register-image-section">
        <div className="quote">
          <span className="quote-icon">“</span>
          Discover the power of change and adopt a fresh approach to life.
        </div>
      </div>
    </div>
  );
}

export default RegisterAdminScreen;