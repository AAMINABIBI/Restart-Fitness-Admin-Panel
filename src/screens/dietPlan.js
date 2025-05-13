import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import mealImage from '../assets/mealImage.png';
import './dietPlan.css';

function DietPlanScreen() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mealAssignments, setMealAssignments] = useState({
    meal1: '',
    meal2: '',
    meal3: '',
  });

  // Static data for meals
  const meals = [
    { id: 1, name: 'Meal 1', time: '8:00 am - 9:00 am', image: mealImage },
    { id: 2, name: 'Meal 2', time: '8:00 am - 9:00 am', image: mealImage },
    { id: 3, name: 'Meal 3', time: '8:00 am - 9:00 am', image: mealImage },
    { id: 4, name: 'Meal 4', time: '8:00 am - 9:00 am', image: mealImage },
    { id: 5, name: 'Meal 5', time: '8:00 am - 9:00 am', image: mealImage },
  ];

  // Static data for users
  const users = [
    { id: 1, week: 'July 23, 2023', name: 'John', gender: 'Female', email: 'john@gmail.com', mealAssigned: false },
    { id: 2, week: 'Aug 5, 2023', name: 'Selena', gender: 'Female', email: 'john@gmail.com', mealAssigned: false },
  ];

  const handleAssignMeal = (user) => {
    setSelectedUser(user);
    setMealAssignments({ meal1: '', meal2: '', meal3: '' }); // Reset meal assignments
    setShowModal(true);
  };

  const handleEditUser = (userId) => {
    console.log(`Edit user ${userId}`);
  };

  const handleMealClick = (mealId) => {
    navigate(`/diet-plan/${mealId}`);
  };

  const handleCustomizeMeal = (mealKey) => {
    console.log(`Customize ${mealKey} for user ${selectedUser?.id}`);
    // Add logic to customize the meal (e.g., navigate to a customization screen)
  };

  const handleSaveAssignment = () => {
    console.log('Meal assignments for user', selectedUser?.id, mealAssignments);
    // Add logic to save the meal assignments (e.g., update Firestore)
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="diet-plan-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="diet-plan-section">
          <h2>Diet Plan</h2>
          <div className="meals-grid">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="meal-card"
                onClick={() => handleMealClick(meal.id)}
              >
                <img src={meal.image} alt={meal.name} className="meal-image" />
                <div className="meal-name">{meal.name}</div>
                <div className="meal-time">{meal.time}</div>
              </div>
            ))}
          </div>
          <div className="user-info-section">
            <h3>User Information</h3>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Sl</th>
                  <th>Week</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Meal Assign</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.week}</td>
                    <td>{user.name}</td>
                    <td>{user.gender}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="assign-button"
                        onClick={() => handleAssignMeal(user)}
                      >
                        Not Assign
                      </button>
                    </td>
                    <td>
                      <button
                        className="edit-button"
                        onClick={() => handleEditUser(user.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2 14H14M8 12V14M4 10L6 8M10 6L12 4M6 8L10 4M6 8L4 6M10 4L8 2"
                            stroke="#d2b48c"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Meal Assignment */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close-button" onClick={handleCloseModal}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="modal-content">
              <div className="user-info">
                <div className="user-avatar"></div>
                <div className="user-details">
                  <h3>{selectedUser?.name}</h3>
                  <p>{selectedUser?.email}</p>
                  <p>{selectedUser?.week}</p>
                </div>
              </div>
              <div className="meal-assignment">
                <div className="meal-item">
                  <span>Meal 1</span>
                  <button
                    className="customize-button"
                    onClick={() => handleCustomizeMeal('meal1')}
                  >
                    Customize
                  </button>
                </div>
                <div className="meal-item">
                  <span>Meal 2</span>
                  <button
                    className="customize-button"
                    onClick={() => handleCustomizeMeal('meal2')}
                  >
                    Customize
                  </button>
                </div>
                <div className="meal-item">
                  <span>Meal 3</span>
                  <button
                    className="customize-button"
                    onClick={() => handleCustomizeMeal('meal3')}
                  >
                    Customize
                  </button>
                </div>
              </div>
              <button className="save-button" onClick={handleSaveAssignment}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DietPlanScreen;