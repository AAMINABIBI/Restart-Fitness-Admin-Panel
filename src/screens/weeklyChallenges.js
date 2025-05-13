import React, { useState } from 'react';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import Modal from '../components/Modal';
import './WeeklyChallengesScreen.css';
import challanges from '../assets/challanges.jpg'
function WeeklyChallengesScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState({
    thisWeek: [
      { id: 1, title: 'Round 1', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 2, title: 'Round 2', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 3, title: 'Round 3', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 4, title: 'Round 3', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
    ],
    lastWeek: [
      { id: 5, title: 'Round 1', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 6, title: 'Round 2', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 7, title: 'Round 3', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
      { id: 8, title: 'Round 3', date: 'June 20, 2022', image: challanges, workoutName: 'abc', time: 'abc', repetitions: 'abc' },
    ],
  });

  const handleCardClick = (challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleAddRoundClick = () => {
    // Open the modal with an empty challenge object for adding a new round
    setSelectedChallenge({
      id: challenges.thisWeek.length + challenges.lastWeek.length + 1, // Generate a new ID
      title: `Round ${challenges.thisWeek.length + 1}`, // Auto-generate title
      date: 'June 20, 2022', // Default date (can be made dynamic)
      image: 'https://via.placeholder.com/150', // Default image
      workoutName: '',
      time: '',
      repetitions: '',
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedChallenge(null);
  };

  const handleModalSubmit = (updatedWorkouts) => {
    const updatedChallenge = { 
      ...selectedChallenge, 
      title: updatedWorkouts[0].title, // Include the updated title
      workoutName: updatedWorkouts[0].workoutName,
      time: updatedWorkouts[0].time,
      repetitions: updatedWorkouts[0].repetitions,
      video: updatedWorkouts[0].video
    };
    
    // Check if this is an existing challenge (editing) or a new one (adding)
    if (challenges.thisWeek.some((c) => c.id === updatedChallenge.id) || challenges.lastWeek.some((c) => c.id === updatedChallenge.id)) {
      // Update existing challenge
      const updatedThisWeek = challenges.thisWeek.map((c) =>
        c.id === updatedChallenge.id ? updatedChallenge : c
      );
      const updatedLastWeek = challenges.lastWeek.map((c) =>
        c.id === updatedChallenge.id ? updatedChallenge : c
      );
      setChallenges({ thisWeek: updatedThisWeek, lastWeek: updatedLastWeek });
    } else {
      // Add new challenge to "This Week"
      setChallenges({
        ...challenges,
        thisWeek: [...challenges.thisWeek, updatedChallenge],
      });
    }
  };

  const handleDeleteChallenge = (challengeId, week) => {
    if (week === 'thisWeek') {
      setChallenges({
        ...challenges,
        thisWeek: challenges.thisWeek.filter((c) => c.id !== challengeId),
      });
    } else {
      setChallenges({
        ...challenges,
        lastWeek: challenges.lastWeek.filter((c) => c.id !== challengeId),
      });
    }
  };

  return (
    <div className="weekly-challenges-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="challenges-section">
          <div className="challenges-header">
            <div className="information">Weekly Challenges</div>
            <div className="header-actions">
              <button className="add-rounds-button" onClick={handleAddRoundClick}>
                <span className="plus-icon">+</span> Add Rounds
              </button>
              <select className="months-dropdown">
                <option>Months</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
              </select>
            </div>
          </div>
          <div className="week-section">
            <h3 className="week-title">This Week (June 20, 2022)</h3>
            <div className="challenges-grid">
              {challenges.thisWeek.map((challenge) => (
                <div key={challenge.id} className="challenge-card">
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className="challenge-image"
                    onClick={() => handleCardClick(challenge)}
                  />
                  <div className="challenge-info">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.date}</p>
                  </div>
                  <div className="challenge-actions">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleCardClick(challenge)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteChallenge(challenge.id, 'thisWeek')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="week-section">
            <h3 className="week-title">Last Week (June 20, 2022)</h3>
            <div className="challenges-grid">
              {challenges.lastWeek.map((challenge) => (
                <div key={challenge.id} className="challenge-card">
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className="challenge-image"
                    onClick={() => handleCardClick(challenge)}
                  />
                  <div className="challenge-info">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.date}</p>
                  </div>
                  <div className="challenge-actions">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleCardClick(challenge)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteChallenge(challenge.id, 'lastWeek')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        challenge={selectedChallenge}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}

export default WeeklyChallengesScreen;