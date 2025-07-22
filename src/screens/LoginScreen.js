import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import './LoginScreen.css';

function LoginScreen() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      if (process.env.NODE_ENV !== 'production') {
        console.log('Logged in user UID:', user.uid);
      }

      const adminDocRef = doc(db, 'adminUsers', user.uid);
      try {
        const adminDoc = await getDoc(adminDocRef);
        if (process.env.NODE_ENV !== 'production') {
          console.log('Admin document exists:', adminDoc.exists());
        }

        if (adminDoc.exists()) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Login successful:', formData.email);
          }
          setIsLoading(false);
          navigate('/dashboard');
        } else {
          await auth.signOut();
          setError('Access denied. Only admins can log in here.');
          setIsLoading(false);
        }
      } catch (firestoreError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Firestore error:', firestoreError.message);
        }
        setError('Failed to verify admin status. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Login error:', err.message);
      }
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
      setIsLoading(false);
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <p className="register-redirect">
          Don’t have an account?{' '}
          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="register-link"
            aria-label="Navigate to register page"
          >
            Register here
          </button>
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