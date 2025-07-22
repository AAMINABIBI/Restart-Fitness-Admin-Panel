import React from 'react';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import '../screens/UserScreen.css';
import AddWorkoutScreen from './AddWorkoutScreen';
import { useNavigate } from 'react-router-dom';
import './WorkoutsScreen.css';


function WorkoutsScreen() {
  const navigate =useNavigate();
const handleSubmit=()=>{
    navigate('/workouts/add')
}
  return (
    <div className="user-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="users-list-section">
          <div className="users-list-header">
            <div className="information">Workouts</div>
          </div>
          <p>Workout added to firebase</p>
          <button onClick={handleSubmit}>Add new Workout</button>
        </div>
      </div>
    </div>
  );
}

export default WorkoutsScreen;