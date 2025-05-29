import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './WeeklyChallengesScreen.css';
import { FaEdit, FaTrash } from "react-icons/fa";

function WeeklyChallengesScreen() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [workouts, setWorkouts] = useState([]); // For video selection
  const [expandedChallenge, setExpandedChallenge] = useState(null); // Track expanded rounds
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active',
    rounds: [],
  });
  const [newRound, setNewRound] = useState({
    roundNumber: 1,
    roundTitle: '',
    reps: 1,
    videoUrl: '',
    videoFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch challenges and workouts
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'weeklyChallenges'));
        const challengesList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
          };
        });
        setChallenges(challengesList);
      } catch (err) {
        console.error('Error fetching challenges:', err.message);
        toast.error('Failed to load challenges. Please try again later.', { autoClose: 3000 });
      }
    };

    const fetchWorkouts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'workouts'));
        const workoutsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkouts(workoutsList);
      } catch (err) {
        console.error('Error fetching workouts:', err.message);
        toast.error('Failed to load workouts for video selection.', { autoClose: 3000 });
      }
    };

    fetchChallenges();
    fetchWorkouts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Toggle rounds visibility
  const toggleRounds = (challengeId) => {
    setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle new round input changes
  const handleRoundInputChange = (e) => {
    const { name, value } = e.target;
    setNewRound((prev) => ({
      ...prev,
      [name]: name === 'reps' ? parseInt(value) || 1 : value,
    }));
  };

  // Handle video file selection for a round
  const handleVideoFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('Video file size must be less than 50MB.', { autoClose: 3000 });
        return;
      }
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedVideoTypes.includes(file.type)) {
        toast.error('Please upload a valid video file (MP4, WebM, Ogg).', { autoClose: 3000 });
        return;
      }
      setNewRound((prev) => ({
        ...prev,
        videoFile: file,
        videoUrl: '',
      }));
    }
  };

  // Add a new round to the form
  const addRound = () => {
    if (!newRound.roundTitle || (!newRound.videoUrl && !newRound.videoFile)) {
      toast.error('Please provide a round title and either upload a video or select one.', { autoClose: 3000 });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          roundNumber: newRound.roundNumber,
          roundTitle: newRound.roundTitle,
          reps: newRound.reps,
          videoUrl: newRound.videoUrl || '',
          videoFile: newRound.videoFile,
        },
      ],
    }));

    setNewRound({
      roundNumber: newRound.roundNumber + 1,
      roundTitle: '',
      reps: 1,
      videoUrl: '',
      videoFile: null,
    });
  };

  // Upload video to Firebase Storage
  const uploadVideo = async (file) => {
    const storageReference = storageRef(storage, `weeklyChallengesSubmittedVideos/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageReference, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Video upload failed:', error.message);
          toast.error('Failed to upload video.', { autoClose: 3000 });
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || formData.rounds.length === 0) {
      toast.error('Please fill in all fields and add at least one round.', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      // Upload videos for rounds if necessary
      const roundsWithUploadedVideos = await Promise.all(
        formData.rounds.map(async (round) => {
          if (round.videoFile) {
            const videoUrl = await uploadVideo(round.videoFile);
            return { ...round, videoUrl, videoFile: null };
          }
          return round;
        })
      );

      const challengeData = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        rounds: roundsWithUploadedVideos,
        status: formData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (formData.id) {
        // Update existing challenge
        await updateDoc(doc(db, 'weeklyChallenges', formData.id), challengeData);
        setChallenges(challenges.map(c => c.id === formData.id ? { id: formData.id, ...challengeData } : c));
        toast.success('Challenge updated successfully!', { autoClose: 3000 });
      } else {
        // Add new challenge
        const docRef = await addDoc(collection(db, 'weeklyChallenges'), challengeData);
        setChallenges([...challenges, { id: docRef.id, ...challengeData }]);
        toast.success('Challenge added successfully!', { autoClose: 3000 });
      }

      setModalOpen(false);
      setFormData({
        id: null,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active',
        rounds: [],
      });
      setNewRound({
        roundNumber: 1,
        roundTitle: '',
        reps: 1,
        videoUrl: '',
        videoFile: null,
      });
    } catch (err) {
      console.error('Error saving challenge:', err.message);
      toast.error('Failed to save challenge. Please try again.', { autoClose: 3000 });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Handle edit challenge
  const handleEditChallenge = (challenge) => {
    setFormData({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      startDate: challenge.startDate.split('T')[0], // Convert ISO to YYYY-MM-DD
      endDate: challenge.endDate.split('T')[0],
      status: challenge.status,
      rounds: challenge.rounds.map(round => ({
        roundNumber: round.roundNumber,
        roundTitle: round.roundTitle,
        reps: round.reps,
        videoUrl: round.videoUrl,
        videoFile: null,
      })),
    });
    setNewRound({
      roundNumber: challenge.rounds.length + 1,
      roundTitle: '',
      reps: 1,
      videoUrl: '',
      videoFile: null,
    });
    setModalOpen(true);
  };

  // Handle add new challenge
  const handleAddChallenge = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], // Default to 7 days later
      status: 'active',
      rounds: [],
    });
    setNewRound({
      roundNumber: 1,
      roundTitle: '',
      reps: 1,
      videoUrl: '',
      videoFile: null,
    });
    setModalOpen(true);
  };

  // Handle delete challenge
  const handleDeleteChallenge = async (challengeId, rounds) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    try {
      // Delete videos from Firebase Storage
      for (const round of rounds) {
        if (round.videoUrl && round.videoUrl.includes('weeklyChallengesSubmittedVideos')) {
          const videoRef = storageRef(storage, round.videoUrl);
          await deleteObject(videoRef).catch(err => {
            console.warn('Failed to delete video:', err.message);
          });
        }
      }

      // Delete the challenge from Firestore
      await deleteDoc(doc(db, 'weeklyChallenges', challengeId));
      setChallenges(challenges.filter(c => c.id !== challengeId));
      toast.success('Challenge deleted successfully!', { autoClose: 3000 });
    } catch (err) {
      console.error('Error deleting challenge:', err.message);
      toast.error('Failed to delete challenge. Please try again.', { autoClose: 3000 });
    }
  };

  // Filter and paginate challenges
  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentChallenges = filteredChallenges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);

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

  // Helper function to safely convert Timestamp to Date string
  const formatTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return new Date(timestamp.toDate()).toLocaleString();
    }
    return '-';
  };

  return (
    <div className="weekly-challenges-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="weekly-challenges-section">
          <div className="weekly-challenges-header">
            <div className="information">Weekly Challenges</div>
            <div className="search-add">
              <input
                type="text"
                placeholder="Search by title..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-challenge-button" onClick={handleAddChallenge}>
                Add Challenge
              </button>
            </div>
          </div>
          {filteredChallenges.length === 0 ? (
            <p>No challenges found.</p>
          ) : (
            <>
              <table className="challenges-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Rounds</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {currentChallenges.map((challenge, index) => (
                    <React.Fragment key={challenge.id}>
                      <tr>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{challenge.title}</td>
                        <td>{challenge.description}</td>
                        <td>{new Date(challenge.startDate).toLocaleDateString()}</td>
                        <td>{new Date(challenge.endDate).toLocaleDateString()}</td>
                        <td>{challenge.status}</td>
                        <td>
                          <button
                            className="view-rounds-button"
                            onClick={() => toggleRounds(challenge.id)}
                          >
                            {expandedChallenge === challenge.id ? 'Hide Rounds' : 'View Rounds'}
                          </button>
                        </td>
                        <td>{formatTimestamp(challenge.createdAt)}</td>
                        <td>{formatTimestamp(challenge.updatedAt)}</td>
                        <td>
                          <FaEdit onClick={() => handleEditChallenge(challenge)} className="edit-icon" />
                        </td>
                        <td>
                          <FaTrash
                            onClick={() => handleDeleteChallenge(challenge.id, challenge.rounds)}
                            className="delete-icon"
                          />
                        </td>
                      </tr>
                      {expandedChallenge === challenge.id && (
                        <tr>
                          <td colSpan="11">
                            <div className="rounds-dropdown">
                              {challenge.rounds.map((round, idx) => (
                                <div key={idx} className="round-entry">
                                  <h5>{round.roundTitle}</h5>
                                  <p>Round Number: {round.roundNumber}</p>
                                  <p>Reps: {round.reps}</p>
                                  <p>
                                    Video:{' '}
                                    {round.videoUrl ? (
                                      <a href={round.videoUrl} target="_blank" rel="noopener noreferrer">
                                        View Video
                                      </a>
                                    ) : (
                                      'No video'
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          {/* Inline Modal */}
          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>{formData.id ? 'Edit Challenge' : 'Add New Challenge'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter description"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rounds</label>
                    <div className="rounds-container">
                      {formData.rounds.map((round, idx) => (
                        <div key={idx} className="round-card">
                          <h5>{round.roundTitle}</h5>
                          <p>Round Number: {round.roundNumber}</p>
                          <p>Reps: {round.reps}</p>
                          <p>
                            Video:{' '}
                            {round.videoUrl ? (
                              <a href={round.videoUrl} target="_blank" rel="noopener noreferrer">
                                View Video
                              </a>
                            ) : (
                              'No video'
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="new-round-form">
                      <h4>Add New Round</h4>
                      <div className="form-group">
                        <label>Round Title</label>
                        <input
                          type="text"
                          name="roundTitle"
                          value={newRound.roundTitle}
                          onChange={handleRoundInputChange}
                          placeholder="Enter round title"
                        />
                      </div>
                      <div className="form-group">
                        <label>Reps</label>
                        <input
                          type="number"
                          name="reps"
                          value={newRound.reps}
                          onChange={handleRoundInputChange}
                          min="1"
                        />
                      </div>
                      <div className="form-group">
                        <label>Video</label>
                        <div className="video-options">
                          <div>
                            <label>Upload Video:</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoFileChange}
                            />
                          </div>
                          <div>
                            <label>Or Select Workout Video:</label>
                            <select
                              name="videoUrl"
                              value={newRound.videoUrl}
                              onChange={handleRoundInputChange}
                            >
                              <option value="">Select a workout video</option>
                              {workouts.map((workout) => (
                                <option key={workout.id} value={workout.videoURL || ''}>
                                  {workout.name || workout.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
                              {uploadProgress.toFixed(2)}%
                            </div>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={addRound} className="add-round-button">
                        Add Round
                      </button>
                    </div>
                  </div>
                  <div className="modal-buttons">
                    <button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setModalOpen(false)} disabled={loading}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
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

export default WeeklyChallengesScreen;