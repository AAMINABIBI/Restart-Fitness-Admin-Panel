import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './ExamsScreen.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

Modal.setAppElement('#root');

function ExamsScreen() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

export default ExamsScreen;