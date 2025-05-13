import React from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import './topBAr.css';
import user from '../assets/user.jpg'
function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-center">
        {/* <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search here..." />
        </div> */}
      </div>
      <div className="top-bar-right">
      
      <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search here..." />
        </div>
        <div className="notifications">
          <FaBell className="notification-icon" />
        </div>
        <div className="language-selector">
          <span className="language-code">EN</span>
        </div>
        <div className="user-profile">
          <img
            src={user}
            alt="User Avatar"
            className="avatar"
          />
          <div className="user-info">
            <span className="user-name">Jhon Doe</span>
            <span className="user-email">admin@admin.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;