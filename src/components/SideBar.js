import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaSearch, FaUsers, FaLevelUpAlt, FaDumbbell, FaUtensils, FaBook, FaCalendarWeek, FaTrophy, FaComment, FaFire } from 'react-icons/fa';
import './SideBar.css';
import logo from '../assets/logo.png';

function SideBar() {
  return (
    <div className="side-bar">
      <div>
        <img src={logo} className="sidebar-logo" alt="Restart Logo" />
      </div>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Search Menu..." />
      </div>
      <nav className="nav-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive || window.location.pathname === '/add-user' ? 'active' : ''}`}
        >
          <FaUsers className="nav-icon" />
          Users
        </NavLink>
        <NavLink to="/levels" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaLevelUpAlt className="nav-icon" />
          Levels
        </NavLink>
        <NavLink to="/level-badges" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaLevelUpAlt className="nav-icon" />
          Level Badges
        </NavLink>
        <NavLink to="/workouts" className={({ isActive }) => `nav-link ${isActive || window.location.pathname === '/workouts/add' ? 'active' : ''}`}>
          <FaDumbbell className="nav-icon" />
          Workouts
        </NavLink>
        <NavLink to="/diet-plan" className={({ isActive }) => `nav-link ${isActive || window.location.pathname === '/diet-plan/add' ? 'active' : ''}`}>
          <FaUtensils className="nav-icon" />
          Diet Plan
        </NavLink>
        <NavLink to="/exams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaBook className="nav-icon" />
          Exams
        </NavLink>
        <NavLink to="/weekly-challenges" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaCalendarWeek className="nav-icon" />
          Weekly Challenges
        </NavLink>
        <NavLink to="/popular-workouts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaFire className="nav-icon" />
          Popular Workouts
        </NavLink>
        <NavLink to="/recipes" className={({ isActive }) => `nav-link ${isActive || window.location.pathname === '/recipes/add' ? 'active' : ''}`}>
          <FaUtensils className="nav-icon" />
          Recipes
        </NavLink>
        <NavLink to="/winners" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaTrophy className="nav-icon" />
          Winners
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <FaComment className="nav-icon" />
          Chat
        </NavLink>
      </nav>
      <div className="copyright">© 2023 Restart | ALL RIGHT</div>
    </div>
  );
}

export default SideBar;