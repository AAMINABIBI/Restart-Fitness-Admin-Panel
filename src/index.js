import { createRoot } from 'react-dom/client';
import App from './App';
import Modal from 'react-modal';
import { BrowserRouter } from 'react-router-dom';

Modal.setAppElement('#root');

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);