// import React from 'react';
// import ReactDOM from 'react-dom/client'; // Use the new client API
// import { BrowserRouter } from 'react-router-dom';
// import App from './App';
// import Modal from 'react-modal';

// Modal.setAppElement('#root'); // Assuming your root div has id="root"
// // Create a root using createRoot
// const root = ReactDOM.createRoot(document.getElementById('root'));

// // Render the app using the root
// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );


import { createRoot } from 'react-dom/client';
import App from './App';
import Modal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';

// Set the app element for react-modal
Modal.setAppElement('#root');

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
  
  <App />
  </BrowserRouter>);
