import React, { useState } from 'react';
import './Modal.css';

function Modal({ isOpen, onClose, challenge, onSubmit }) {
  const [workouts, setWorkouts] = useState([
    { 
      title: challenge?.title || '', // Allow editing the title
      workoutName: challenge?.workoutName || '', 
      time: challenge?.time || '', 
      repetitions: challenge?.repetitions || '', 
      video: null 
    },
  ]);

  if (!isOpen) return null;

  const handleInputChange = (index, field, value) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index][field] = value;
    setWorkouts(updatedWorkouts);
  };

  const handleFileChange = (index, file) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[index].video = file;
    setWorkouts(updatedWorkouts);
  };

  const handleAddMoreWorkout = () => {
    setWorkouts([...workouts, { workoutName: '', time: '', repetitions: '', video: null }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(workouts);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <input
            type="text"
            value={workouts[0].title}
            onChange={(e) => handleInputChange(0, 'title', e.target.value)}
            placeholder="Round Title"
            className="modal-title-input"
          />
          <button className="modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {workouts.map((workout, index) => (
            <div key={index} className="workout-form">
              <div className="form-group">
                <label>Workout Name</label>
                <input
                  type="text"
                  value={workout.workoutName}
                  onChange={(e) => handleInputChange(index, 'workoutName', e.target.value)}
                  placeholder="abc"
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="text"
                  value={workout.time}
                  onChange={(e) => handleInputChange(index, 'time', e.target.value)}
                  placeholder="abc"
                />
              </div>
              <div className="form-group">
                <label>Repetitions</label>
                <input
                  type="text"
                  value={workout.repetitions}
                  onChange={(e) => handleInputChange(index, 'repetitions', e.target.value)}
                  placeholder="abc"
                />
              </div>
              <div className="form-group">
                <label>Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />
              </div>
            </div>
          ))}
          <button type="submit" className="submit-button">
            Add
          </button>
          <button
            type="button"
            className="add-more-button"
            onClick={handleAddMoreWorkout}
          >
            Add More Workout
          </button>
        </form>
      </div>
    </div>
  );
}

export default Modal;