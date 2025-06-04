const React = require('react');
const { useState, useEffect } = React;
const { useNavigate } = require('react-router-dom');
const { db } = require('../firebase');
const { collection, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const { toast, ToastContainer } = require('react-toastify');
require('react-toastify/dist/ReactToastify.css');
const Modal = require('react-modal');
const TopBar = require('../components/topBar');
const SideBar = require('../components/SideBar');
require('./ExamsScreen.css');
const { FaEdit, FaTrash } = require('react-icons/fa');

Modal.setAppElement('#root');

function ExamsScreen() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tests'));
        const testsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTests(testsList);
      } catch (err) {
        console.error('Error fetching tests:', err.message);
        toast.error('Failed to load tests. Please try again later.');
      }
    };
    fetchTests();
  }, []);

  const handleAddTest = () => {
    navigate('/exams/add');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="exams-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="exams-section">
          <div className="exams-header">
            <div className="information">Exams</div>
            <div className="search-add">
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button onClick={handleAddTest}>Add Exam</button>
            </div>
          </div>
          {tests.length === 0 ? (
            <p>No exams found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.title}</td>
                    <td>{test.description}</td>
                    <td>
                      <FaEdit onClick={() => console.log('Edit', test.id)} />
                    </td>
                    <td>
                      <FaTrash onClick={() => console.log('Delete', test.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ToastContainer autoClose={3000} />
    </div>
  );
}

module.exports = ExamsScreen;