import React, { useEffect, useState } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import './topBAr.css';
import defaultUserImage from '../assets/user.jpg';

function TopBar() {
  const [userEmail, setUserEmail] = useState('');
  const [userImage, setUserImage] = useState(defaultUserImage);
  const [imageFile, setImageFile] = useState(null);

  // Fetch user data from Firestore & Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);

        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().DisplayImageURL) {
            setUserImage(userDoc.data().DisplayImageURL);
          } else {
            await setDoc(userDocRef, {
              email: user.email,
              DisplayImageURL: defaultUserImage,
            }, { merge: true });
          }
        } catch (error) {
          console.error('Error fetching or creating user data:', error);
          toast.error('Failed to fetch or create user profile.');
        }
      } else {
        setUserEmail('');
        setUserImage(defaultUserImage);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    }
  };

  // Upload image to Firebase Storage & update Firestore
  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image.');
      return;
    }

    if (!auth.currentUser) {
      toast.error('You must be logged in to upload an image.');
      return;
    }

    const toastId = toast.loading('Uploading image...');

    try {
      const userId = auth.currentUser.uid;
      const storageRef = ref(storage, `users/${userId}/profile.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(error),
          () => resolve()
        );
      });

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        DisplayImageURL: downloadURL,
      }, { merge: true });

      setUserImage(downloadURL);
      setImageFile(null);
      toast.update(toastId, { render: 'Profile image updated successfully!', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.update(toastId, { render: 'Failed to upload profile image. Please try again.', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-center"></div>
      <div className="top-bar-right">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search here..." />
        </div>
        <div className="notifications">
          <FaBell className="notification-icon" />
        </div>
        <div className="language-selector">
          <span className="language-code">EN</span>
        </div>
        <div className="user-profile" onClick={() => document.getElementById('fileInput').click()}>
          <img src={userImage} alt="User Avatar" className="avatar" />
          <div className="user-info">
            <span className="user-name">{userEmail ? userEmail : 'Guest'}</span>
          </div>
        </div>

        {/* Hidden File Input for Profile Image Upload */}
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {imageFile && (
          <button onClick={handleImageUpload} className="upload-button">
            Upload Profile Image
          </button>
        )}
      </div>
    </div>
  );
}

export default TopBar;