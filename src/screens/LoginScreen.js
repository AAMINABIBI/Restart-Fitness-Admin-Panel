import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import './LoginScreen.css';

function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log('Logged in user UID:', user.uid);

      const adminDocRef = doc(db, 'adminUsers', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      console.log('Admin document exists:', adminDoc.exists());

      if (adminDoc.exists()) {
        console.log('Login successful:', formData.email);
        navigate('/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. Only admins can log in here.');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Failed to log in. Please try again later.');
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
        <h4>Admin Login</h4>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p className="register-redirect">
          Don’t have an account?{' '}
          <span onClick={handleRegisterRedirect} className="register-link">
            Register here
          </span>
        </p>
        <div className="copyright">
          © 2025 Andrews | ALL RIGHT RESERVED
        </div>
      </div>
      <div className="login-image-section">
        <div className="quote">
          <span className="quote-icon">“</span>
          Welcome back! Let’s manage your fitness empire.
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;