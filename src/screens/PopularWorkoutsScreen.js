import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, ref } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './PopularWorkoutsScreen.css';
import { FaPlay } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

Modal.setAppElement('#root');

function PopularWorkoutsScreen() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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

  const openEditModal = async (workout) => {
    setLoading(true);
    try {
      const workoutDoc = await getDoc(doc(db, 'workouts', workout.id));
      if (workoutDoc.exists()) {
        const workoutData = { id: workoutDoc.id, ...workoutDoc.data() };
        workoutData.tags = Array.isArray(workoutData.tags) ? workoutData.tags : [];
        setEditFormData(workoutData);
      } else {
        setError('Workout not found.');
      }
    } catch (err) {
      console.error('Error fetching workout for edit:', err.message);
      setError('Failed to load workout details.');
    }
    setLoading(false);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditFormData(null);
    setImageFile(null);
    setVideoFile(null);
    setUploadProgress(0);
    setVideoUploadProgress(0);
    setError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image file size must be less than 5MB.');
        return;
      }
      setImageFile(file);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Video file size must be less than 50MB.');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    setLoading(true);
    try {
      let newThumbnailURL = editFormData.thumbnailURL;
      let newVideoURL = editFormData.videoURL;

      // Handle image upload
      if (imageFile) {
        const storageReference = storageRef(storage, `workouts/thumbs/${editFormData.id}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageReference, imageFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Image upload failed:', error.message);
            setError('Failed to upload image.');
          },
          async () => {
            newThumbnailURL = await getDownloadURL(uploadTask.snapshot.ref);
          }
        );
        await uploadTask; // Wait for image upload to complete
      }

      // Handle video upload
      if (videoFile) {
        const storageReference = storageRef(storage, `workouts/videos/${editFormData.id}/${videoFile.name}`);
        const uploadTask = uploadBytesResumable(storageReference, videoFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setVideoUploadProgress(progress);
          },
          (error) => {
            console.error('Video upload failed:', error.message);
            setError('Failed to upload video.');
          },
          async () => {
            newVideoURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateWorkout(newThumbnailURL, newVideoURL);
          }
        );
        await uploadTask; // Wait for video upload to complete
      } else {
        await updateWorkout(newThumbnailURL, newVideoURL);
      }
    } catch (err) {
      console.error('Error saving workout:', err.message);
      setError('Failed to save workout. Please try again.');
    }
    setLoading(false);
  };

  const updateWorkout = async (newThumbnailURL, newVideoURL) => {
    await updateDoc(doc(db, 'workouts', editFormData.id), {
      name: editFormData.name,
      category: editFormData.category,
      caloriesBurned: parseInt(editFormData.caloriesBurned) || 0,
      totalTime: parseInt(editFormData.totalTime) || 0,
      difficultyLevel: editFormData.difficultyLevel,
      intensity: editFormData.intensity,
      tags: editFormData.tags?.length ? editFormData.tags : [],
      thumbnailURL: newThumbnailURL,
      videoURL: newVideoURL,
    });
    setWorkouts(workouts.map(w => w.id === editFormData.id ? { ...editFormData, thumbnailURL: newThumbnailURL, videoURL: newVideoURL } : w));
    closeEditModal();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWorkouts.map((workout, index) => (
                    <tr key={workout.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
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
                      <td>
                        <FaEdit onClick={() => openEditModal(workout)} />
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

      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Workout"
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : editFormData ? (
          <div className="modal-content">
            <h2>Edit Workout</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Calories Burned</label>
                <input
                  type="number"
                  name="caloriesBurned"
                  value={editFormData.caloriesBurned || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Total Time (min)</label>
                <input
                  type="number"
                  name="totalTime"
                  value={editFormData.totalTime || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <input
                  type="text"
                  name="difficultyLevel"
                  value={editFormData.difficultyLevel || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Intensity</label>
                <input
                  type="text"
                  name="intensity"
                  value={editFormData.intensity || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={editFormData.tags?.join(', ') || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input
                  type="text"
                  name="videoURL"
                  value={editFormData.videoURL || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Current Thumbnail</label>
                {editFormData.thumbnailURL && (
                  <img
                    src={editFormData.thumbnailURL}
                    alt={`${editFormData.name} thumbnail`}
                    className="thumbnail-image"
                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Upload New Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
                      {uploadProgress.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Current Video</label>
                {editFormData.videoURL && (
                  <video
                    src={editFormData.videoURL}
                    controls
                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Upload New Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${videoUploadProgress}%` }}>
                      {videoUploadProgress.toFixed(2)}%
                    </div>
                  </div>
                )}
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
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <p>No workout data available.</p>
        )}
      </Modal>
    </div>
  );
}

export default PopularWorkoutsScreen;