import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import TopBar from '../components/topBar'; // Fixed capitalization
import SideBar from '../components/SideBar';
import UserTable from '../components/UserTable';
import './UserScreen.css';

function UserScreen() {
  const navigate = useNavigate(); // Hook for navigation

  const handleAddUsersClick = () => {
    navigate('/add-user'); // Navigate to the AddUserScreen
  };

  return (
    <div className="user-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="users-list-section">
          <div className="users-list-header">
            <div className="information">Users List</div>
            <div className="search-add">
              <input type="text" placeholder="Ex: type by name" className="search-input" />
              <button className="add-users-button" onClick={handleAddUsersClick}>
                Add Users
              </button>
            </div>
          </div>
          <UserTable />
        </div>
      </div>
    </div>
  );
}

export default UserScreen;