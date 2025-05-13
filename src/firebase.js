import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration (replace with your config from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyBxacw44fxmw64rw9bhOh37LrUTUPJM06k",
    authDomain: "restart-cb3ce.firebaseapp.com",
    projectId: "restart-cb3ce",
    storageBucket: "restart-cb3ce.firebasestorage.app",
    messagingSenderId: "73420420527",
    appId: "1:73420420527:web:eb9918a28ccc443265ab5a",
    measurementId: "G-KM1XN57LWX"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };