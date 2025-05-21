import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, auth, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import AddEquipmentModal from '../components/AddEquipmentModal';
import ChapterModal from '../components/ChapterModal';
import './AddWorkoutScreen.css';

function AddWorkoutScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    videoURL: '',
    thumbnailURL: '',
    chapters: [],
    caloriesBurned: '',
    category: '',
    totalTime: '',
    tags: [],
    equipments: [],
    difficultyLevel: 'Beginner',
    intensity: 'Low',
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (field === 'video') {
      setVideoFile(file);
      setFormData({ ...formData, videoURL: file ? file.name : '' });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setVideoPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setVideoPreview(null);
      }
    } else if (field === 'thumbnail') {
      setThumbnailFile(file);
      setFormData({ ...formData, thumbnailURL: file ? file.name : '' });
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setThumbnailPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setThumbnailPreview(null);
      }
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  const validateVideo = () => {
    if (!videoFile) {
      toast.error('Please upload a video.', { autoClose: 3000 });
      return false;
    }
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    if (!allowedVideoTypes.includes(videoFile.type)) {
      toast.error('Please upload a valid video file (MP4, MOV, AVI, WebM).', { autoClose: 3000 });
      return false;
    }
    const maxSizeInMB = 100;
    if (videoFile.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`Video file size must be less than ${maxSizeInMB}MB.`, { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const validateThumbnail = () => {
    if (!thumbnailFile) {
      toast.error('Please upload a thumbnail.', { autoClose: 3000 });
      return false;
    }
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedImageTypes.includes(thumbnailFile.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG).', { autoClose: 3000 });
      return false;
    }
    const maxSizeInMB = 5;
    if (thumbnailFile.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`Thumbnail file size must be less than ${maxSizeInMB}MB.`, { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleAddEquipment = async (equipment) => {
    try {
      let iconUrl = equipment.iconUrl;
      if (equipment.iconUrl instanceof File) {
        const iconRef = ref(storage, `equipments/icons/${Date.now()}_${equipment.iconUrl.name}`);
        const uploadTask = uploadBytesResumable(iconRef, equipment.iconUrl);
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => {
              toast.error('Failed to upload equipment icon. Please try again.', { autoClose: 3000 });
              reject(error);
            },
            async () => {
              iconUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }
      const newEquipment = {
        id: Date.now().toString(),
        name: equipment.name,
        weight: equipment.weight,
        weightUnit: equipment.weightUnit,
        iconUrl: iconUrl,
      };
      setFormData({
        ...formData,
        equipments: [...formData.equipments, newEquipment],
      });
      console.log('Equipment added:', newEquipment);
    } catch (err) {
      console.error('Error uploading equipment icon:', err.message);
      toast.error('Failed to upload equipment icon. Please try again.', { autoClose: 3000 });
    }
  };

  const handleAddChapter = (chapter) => {
    setFormData({
      ...formData,
      chapters: [...formData.chapters, chapter],
    });
    console.log('Chapter added:', chapter);
  };

  const handleOpenEquipmentModal = () => {
    console.log('Opening Equipment Modal');
    setIsEquipmentModalOpen(true);
  };
  const handleCloseEquipmentModal = () => setIsEquipmentModalOpen(false);

  const handleOpenChapterModal = () => {
    console.log('Opening Chapter Modal');
    setIsChapterModalOpen(true);
  };
  const handleCloseChapterModal = () => setIsChapterModalOpen(false);

  const handleAddMore = () => {
    console.log('Add More clicked');
    setFormData({
      name: '',
      description: '',
      videoURL: '',
      thumbnailURL: '',
      chapters: [],
      caloriesBurned: '',
      category: '',
      totalTime: '',
      tags: [],
      equipments: [],
      difficultyLevel: 'Beginner',
      intensity: 'Low',
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
  };

  const handleAddBadge = () => console.log('Add Badge clicked');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadProgress(0);

    console.log('Current user:', auth.currentUser);

    if (!validateVideo() || !validateThumbnail()) return;

    try {
      const videoRef = ref(storage, `workouts/${Date.now()}_${videoFile.name}`);
      const uploadTask = uploadBytesResumable(videoRef, videoFile);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading video:', error.message);
          if (error.code === 'storage/unauthorized') {
            toast.error('You do not have permission to upload videos.', { autoClose: 3000 });
          } else {
            toast.error('Failed to upload video.', { autoClose: 3000 });
          }
          setUploadProgress(0);
        },
        async () => {
          const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

          const thumbnailRef = ref(storage, `workouts/thumbs/${Date.now()}_${thumbnailFile.name}`);
          const thumbnailTask = uploadBytesResumable(thumbnailRef, thumbnailFile);
          thumbnailTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Error uploading thumbnail:', error.message);
              toast.error('Failed to upload thumbnail.', { autoClose: 3000 });
              setUploadProgress(0);
            },
            async () => {
              const thumbnailUrl = await getDownloadURL(thumbnailTask.snapshot.ref);

              const workoutData = {
                name: formData.name,
                description: formData.description,
                videoURL: videoUrl,
                thumbnailURL: thumbnailUrl,
                chapters: formData.chapters,
                caloriesBurned: parseInt(formData.caloriesBurned) || 0,
                category: formData.category,
                totalTime: parseInt(formData.totalTime) || 0,
                tags: formData.tags,
                equipments: formData.equipments,
                difficultyLevel: formData.difficultyLevel,
                intensity: formData.intensity,
              };

              const docRef = await addDoc(collection(db, 'workouts'), workoutData);
              console.log('Workout added to Firestore with ID:', docRef.id);

              setUploadProgress(0);
              toast.success('Workout added successfully!', { autoClose: 3000 });

              // Navigate back to workouts after a short delay to allow toast to be seen
              setTimeout(() => {
                navigate('/popular-workouts');
              }, 3000);
            }
          );
        }
      );
    } catch (err) {
      console.error('Error:', err.message);
      toast.error('An unexpected error occurred.', { autoClose: 3000 });
      setUploadProgress(0);
    }
  };

  const handleBack = () => navigate('/workouts');

  return (
    <div className="add-workout-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="add-workout-section">
          <div className="add-workout-header">
            <div className="level-title">
              <h2>Level 1</h2>
              <button className="add-badge-button" onClick={handleAddBadge}>
                Add Badge
              </button>
            </div>
            <button className="create-level-button" onClick={() => navigate('/levels')}>
              Create Level
            </button>
          </div>
          <div className="form-section">
            <h3>Add Workout Information</h3>
            <button className="add-more-button" onClick={handleAddMore}>
              + Add More
            </button>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Workout Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Arms Exercise"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the workout"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Calories Burned</label>
                  <input
                    type="number"
                    name="caloriesBurned"
                    value={formData.caloriesBurned}
                    onChange={handleInputChange}
                    placeholder="340"
                    required
                  />
                </div>
                <div className="form-group half-width">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Strength"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Total Time (minutes)</label>
                  <input
                    type="number"
                    name="totalTime"
                    value={formData.totalTime}
                    onChange={handleInputChange}
                    placeholder="30"
                    required
                  />
                </div>
                <div className="form-group half-width">
                  <label>Difficulty Level</label>
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Intensity</label>
                <select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Chapters</label>
                <button
                  type="button"
                  className="add-chapter-button"
                  onClick={handleOpenChapterModal}
                >
                  + Add Chapter
                </button>
                {formData.chapters.length > 0 && (
                  <ul className="chapter-list">
                    {formData.chapters.map((chapter, index) => (
                      <li key={index}>
                        {chapter.title} ({chapter.startTime}s - {chapter.endTime}s): {chapter.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ') || ''}
                  onChange={handleTagsChange}
                  placeholder="fitness, strength, cardio"
                />
              </div>
              <div className="form-group">
                <label>Upload Video</label>
                <div className="upload-video">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    style={{ display: 'none' }}
                    id="video-upload"
                    name="videoURL"
                  />
                  <label htmlFor="video-upload" className="upload-video-label">
                    {formData.videoURL || 'Upload Video'}
                  </label>
                </div>
                {videoPreview && (
                  <div className="video-preview">
                    <video controls src={videoPreview} className="video-player" />
                  </div>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                      {Math.round(uploadProgress)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Upload Thumbnail</label>
                <div className="upload-video">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    style={{ display: 'none' }}
                    id="thumbnail-upload"
                    name="thumbnailURL"
                  />
                  <label htmlFor="thumbnail-upload" className="upload-video-label">
                    {formData.thumbnailURL || 'Upload Thumbnail'}
                  </label>
                </div>
                {thumbnailPreview && (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="thumbnail-player" />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Equipment Used</label>
                <button type="button" className="add-equipment-button" onClick={handleOpenEquipmentModal}>
                  + Add equipment
                </button>
                {formData.equipments.length > 0 && (
                  <ul className="equipment-list">
                    {formData.equipments.map((equip, index) => (
                      <li key={index}>
                        {equip.name} ({equip.weight} {equip.weightUnit}) -{' '}
                        <a href={equip.iconUrl} target="_blank" rel="noopener noreferrer">
                          Icon
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="back-button" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="save-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AddEquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={handleCloseEquipmentModal}
        onAddEquipment={handleAddEquipment}
      />
      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={handleCloseChapterModal}
        onAddChapter={handleAddChapter}
      />
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

export default AddWorkoutScreen;