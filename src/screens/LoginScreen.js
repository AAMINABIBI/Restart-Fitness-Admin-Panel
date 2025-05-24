import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import loginImage from '../assets/Login-image.png';
import logo from '../assets/logo.png';
import './LoginScreen.css';

function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Check if the user is an admin
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().isAdmin) {
        console.log('Login successful:', formData.email);
        navigate('/dashboard');
      } else {
        await auth.signOut(); // Sign out if not an admin
        setError('Access denied. Only admins can log in here.');
      }
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to login: ${err.message}`);
      }
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register-admin');
  };

  return (
    <div className="login-screen-container">
      <div className="login-form-section">
        <div>
          <img src={logo} className="sidebar-logo" alt="Logo" />
        </div>
        <h4>Managing made delightful. Login now to experience it.</h4>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="jhon324@gmail.com"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              id="remember-me"
            />
            <label htmlFor="remember-me">Remember me</label>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p className="register-redirect">
          Don't have an account?{' '}
          <span onClick={handleRegisterRedirect} className="register-link">
            Register here
          </span>
        </p>
        <div className="copyright">
          © 2023 Andrews | ALL RIGHT RESERVED
        </div>
      </div>
      <div className="login-image-section">
        <div className="quote">
          <span className="quote-icon">“</span>
          Discover the power of change and adopt a fresh approach to life.
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;