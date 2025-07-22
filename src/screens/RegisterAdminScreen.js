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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Attempting to create user with email:', formData.email);
      }
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      if (process.env.NODE_ENV !== 'production') {
        console.log('User created in Firebase Auth:', { uid: user.uid, email: user.email });
      }

      const adminDocRef = doc(db, 'adminUsers', user.uid);
      try {
        const adminDoc = await getDoc(adminDocRef);
        if (!adminDoc.exists()) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Attempting to create adminUsers document for:', user.uid);
          }
          await setDoc(adminDocRef, {
            email: formData.email,
            name: formData.email.split('@')[0],
            profileCompleted: false,
            isAdmin: true,
            createdAt: serverTimestamp(),
          });
          if (process.env.NODE_ENV !== 'production') {
            console.log('Admin registered successfully in Firestore:', formData.email);
          }
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Admin already exists in adminUsers:', formData.email);
          }
        }
      } catch (firestoreError) {
        console.error('Firestore error details:', {
          message: firestoreError.message,
          code: firestoreError.code,
          details: firestoreError.details,
        });
        // Temporarily skip user deletion for debugging
        /*
        try {
          await user.delete();
          if (process.env.NODE_ENV !== 'production') {
            console.log('User deleted due to Firestore error:', user.uid);
          }
        } catch (deleteError) {
          console.error('User deletion error:', {
            message: deleteError.message,
            code: deleteError.code,
          });
          setError('Failed to clean up registration. Please contact support.');
          setIsLoading(false);
          return;
        }
        */
        setError('Failed to save admin data to Firestore. User may be registered in Authentication. Try logging in.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      navigate('/');
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Registration error:', {
          message: err.message,
          code: err.code,
        });
      }
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or log in.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else {
        setError('Failed to register. Please try again later.');
      }
      setIsLoading(false);
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
        {isLoading && <div className="spinner" aria-label="Loading">Loading...</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email (e.g., admin@restart.com)"
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              required
              aria-required="true"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              required
              aria-required="true"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <p className="login-redirect">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="login-link"
            aria-label="Navigate to login page"
          >
            Login here
          </button>
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