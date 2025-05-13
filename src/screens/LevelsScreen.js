import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import levelimg1 from '../assets/level1.jpg';
import './LevelsScreen.css';

function LevelsScreen() {
  const navigate = useNavigate(); // Hook for navigation

  const levels = [
    {
      id: 1,
      name: 'Level 1',
      badge: '🥇',
      workoutsImage: levelimg1,
      dietPlanImage: levelimg1,
      testsImage: levelimg1,
    },
    {
      id: 2,
      name: 'Level 2',
      badge: '🥈',
      workoutsImage: levelimg1,
      dietPlanImage: levelimg1,
      testsImage: levelimg1,
    },
  ];

  const handleCreateLevelClick = () => {
    console.log('Create Level button clicked');
    // Add logic to open a form for creating a new level (e.g., navigate to a new route)
  };

  const handleEditClick = (levelId) => {
    console.log(`Edit button clicked for Level ${levelId}`);
    // Add logic to edit the level (e.g., navigate to an edit form)
  };

  // Navigation handlers for each section
  const handleWorkoutsClick = () => {
    navigate('/workouts/add');
  };

  const handleDietPlanClick = () => {
    navigate('/diet-plan');
  };

  const handleTestsClick = () => {
    navigate('/exams');
  };

  return (
    <div className="levels-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="levels-section">
          <div className="levels-header">
            <div className="information">Levels</div>
            <button className="create-level-button" onClick={handleCreateLevelClick}>
              Create Level
            </button>
          </div>
          <div className="levels-grid">
            {levels.map((level) => (
              <div key={level.id} className="level-card">
                <div className="level-header">
                  <h3>
                    {level.name} {level.badge}
                  </h3>
                  <button
                    className="edit-button"
                    onClick={() => handleEditClick(level.id)}
                  >
                    Edit
                  </button>
                </div>
                <div className="level-section" onClick={handleWorkoutsClick}>
                  <img src={level.workoutsImage} alt="Workouts" className="section-image" />
                  <div className="section-label">Workouts</div>
                </div>
                <div className="level-section" onClick={handleDietPlanClick}>
                  <img src={level.dietPlanImage} alt="Diet Plan" className="section-image" />
                  <div className="section-label">Diet Plan</div>
                </div>
                <div className="level-section" onClick={handleTestsClick}>
                  <img src={level.testsImage} alt="Tests" className="section-image" />
                  <div className="section-label">Tests</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelsScreen;