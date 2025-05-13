import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './PopularWorkoutsScreen.css'; // Ensure your CSS handles pagination
import { FaPlay } from "react-icons/fa";

Modal.setAppElement('#root');

function PopularWorkoutsScreen() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // You can adjust this value

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workouts'));
        const workoutsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(workoutsList);
      } catch (err) {
        console.error('Error fetching workouts:', err.message);
        setError('Failed to load workouts. Please try again later.');
      }
    };
    fetchWorkouts();
  }, []);

  const handleAddWorkout = () => {
    navigate('/workouts/add');
  };

  const openModal = (workout) => {
    setSelectedWorkout(workout);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedWorkout(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on new search
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkouts = filteredWorkouts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);

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
    <div className="popular-workouts-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="popular-workouts-section">
          <div className="popular-workouts-header">
            <div className="information">Popular Workouts</div>
            <div className="search-add">
              <input
                type="text"
                placeholder="Search by tag..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-workout-button" onClick={handleAddWorkout}>
                Add Workout
              </button>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          {filteredWorkouts.length === 0 ? (
            <p>No workouts found.</p>
          ) : (
            <>
              <table className="workouts-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Calories Burned</th>
                    <th>Total Time (min)</th>
                    <th>Difficulty</th>
                    <th>Intensity</th>
                    <th>Tags</th>
                    <th>Image</th>
                    <th>Video</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWorkouts.map((workout, index) => (
                    <tr key={workout.id}>
                      <td>{indexOfFirstItem + index + 1}</td> {/* Corrected index */}
                      <td>{workout.name}</td>
                      <td>{workout.category || 'N/A'}</td>
                      <td>{workout.caloriesBurned}</td>
                      <td>{workout.totalTime}</td>
                      <td>{workout.difficultyLevel}</td>
                      <td>{workout.intensity}</td>
                      <td>{workout.tags?.join(', ') || 'N/A'}</td>
                      <td>
                        {workout.thumbnailURL && (
                          <img
                            src={workout.thumbnailURL}
                            alt={`${workout.name} thumbnail`}
                            className="thumbnail-image"
                            onClick={() => openModal(workout)}
                          />
                        )}
                      </td>
                      <td>
                        {workout.videoURL && (
                          <a
                            href={workout.videoURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="video-icon-link"
                            aria-label={`Play ${workout.name} video`}
                          >
                            <FaPlay />
                          </a>
                        )}
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

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Workout Preview"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedWorkout && (
          <div className="modal-content">
            <h2>{selectedWorkout.name}</h2>
            <img
              src={selectedWorkout.thumbnailURL}
              alt={`${selectedWorkout.name} full image`}
              className="modal-image"
            />
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PopularWorkoutsScreen;