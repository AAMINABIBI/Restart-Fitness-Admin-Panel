import React from 'react';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import { FaEye, FaTrash } from 'react-icons/fa'; // For view and delete buttons
import './ExamsScreen.css'; // New CSS file for this screen

function ExamsScreen() {
  const examVideos = [
    { id: 1, week: 'July 30, 2023', name: 'John', gender: 'Female', email: 'john@gmail.com', videoLink: '#' },
    { id: 2, week: 'Aug 6, 2023', name: 'Selena', gender: 'Female', email: 'john@gmail.com', videoLink: '#' },
    { id: 3, week: 'Aug 5, 2023', name: 'Selena', gender: 'Female', email: 'john@gmail.com', videoLink: '#' },
  ];

  const handleViewClick = (videoLink) => {
    console.log(`View video: ${videoLink}`);
    // Add logic to open the video link (e.g., window.open(videoLink))
  };

  const handleDeleteClick = (id) => {
    console.log(`Delete video with ID: ${id}`);
    // Add logic to delete the video (e.g., update state or make an API call)
  };

  return (
    <div className="exams-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="exams-section">
          <div className="exams-header">
            <div className="information">Exams Videos</div>
            <div className="header-actions">
              <select className="week-dropdown">
                <option>Week</option>
                <option>July 30, 2023</option>
                <option>Aug 6, 2023</option>
                <option>Aug 5, 2023</option>
              </select>
            </div>
          </div>
          <div className="user-info">
            <h3 className="user-info-title">User Information</h3>
            <table className="exams-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Week</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Video</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {examVideos.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.id}</td>
                    <td>{exam.week}</td>
                    <td>{exam.name}</td>
                    <td>{exam.gender}</td>
                    <td>{exam.email}</td>
                    <td>
                      <button
                        className="video-link-button"
                        onClick={() => handleViewClick(exam.videoLink)}
                      >
                        Video Link
                      </button>
                    </td>
                    <td>
                      <button
                        className="action-button view-button"
                        onClick={() => handleViewClick(exam.videoLink)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteClick(exam.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamsScreen;