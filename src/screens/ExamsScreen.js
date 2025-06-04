import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './ExamsScreen.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

Modal.setAppElement('#root');

function ExamsScreen() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [addFormData, setAddFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tests'));
        const examsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExams(examsList);
      } catch (err) {
        console.error('Error fetching exams:', err.message);
        toast.error('Failed to load exams. Please try again later.', { autoClose: 3000 });
      }
    };
    fetchExams();
  }, []);

  const handleAddExamClick = () => {
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddFormData({ title: '', description: '' });
  };

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveAdd = async () => {
    if (!addFormData.title || !addFormData.description) {
      toast.error('Please fill in all fields.', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const newExamRef = await addDoc(collection(db, 'tests'), {
        title: addFormData.title,
        description: addFormData.description,
        createdAt: new Date().toISOString(),
      });
      setExams([...exams, { id: newExamRef.id, ...addFormData, createdAt: new Date().toISOString() }]);
      toast.success('Exam added successfully!', { autoClose: 3000 });
      closeAddModal();
    } catch (err) {
      console.error('Error adding exam:', err.message);
      toast.error('Failed to add exam. Please try again.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (exam) => {
    setLoading(true);
    try {
      const examDoc = await getDoc(doc(db, 'tests', exam.id));
      if (examDoc.exists()) {
        const examData = { id: examDoc.id, ...examDoc.data() };
        setEditFormData(examData);
      } else {
        toast.error('Exam not found.', { autoClose: 3000 });
      }
    } catch (err) {
      console.error('Error fetching exam for edit:', err.message);
      toast.error('Failed to load exam details.', { autoClose: 3000 });
    }
    setLoading(false);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditFormData(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'tests', editFormData.id), {
        title: editFormData.title,
        description: editFormData.description,
      });
      setExams(exams.map((exam) => (exam.id === editFormData.id ? editFormData : exam)));
      toast.success('Exam updated successfully!', { autoClose: 3000 });
      closeEditModal();
    } catch (err) {
      console.error('Error saving exam:', err.message);
      toast.error('Failed to save exam. Please try again.', { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      await deleteDoc(doc(db, 'tests', examId));
      setExams(exams.filter((exam) => exam.id !== examId));
      toast.success('Exam deleted successfully!', { autoClose: 3000 });
    } catch (err) {
      console.error('Error deleting exam:', err.message);
      toast.error('Failed to delete exam. Please try again.', { autoClose: 3000 });
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
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
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-exam-button" onClick={handleAddExamClick}>
                Add Exam
              </button>
            </div>
          </div>
          {filteredExams.length === 0 ? (
            <p>No exams found.</p>
          ) : (
            <>
              <table className="exams-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {currentExams.map((exam, index) => (
                    <tr key={exam.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{exam.title}</td>
                      <td>{exam.description}</td>
                      <td>
                        <FaEdit onClick={() => openEditModal(exam)} className="edit-icon" />
                      </td>
                      <td>
                        <FaTrash
                          onClick={() => handleDelete(exam.id)}
                          className="delete-icon"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">
                  {renderPageNumbers()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Exam Modal */}
      <Modal
        isOpen={addModalOpen}
        onRequestClose={closeAddModal}
        contentLabel="Add Exam"
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : (
          <div className="modal-content">
            <h2>Add Exam</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={addFormData.title}
                  onChange={handleAddInputChange}
                  placeholder="Enter exam title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={addFormData.description}
                  onChange={handleAddInputChange}
                  placeholder="Enter exam description"
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSaveAdd} disabled={loading}>
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button onClick={closeAddModal} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Exam"
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : editFormData ? (
          <div className="modal-content">
            <h2>Edit Exam</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditInputChange}
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={closeEditModal} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>No exam data available.</p>
        )}
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default ExamsScreen;