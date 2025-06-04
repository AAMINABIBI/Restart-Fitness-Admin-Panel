const { createRoot } = require('react-dom/client');
const App = require('./App');
const Modal = require('react-modal');
const { BrowserRouter } = require('react-router-dom');

Modal.setAppElement('#root');

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);