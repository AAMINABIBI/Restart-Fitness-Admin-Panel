import React from 'react';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import { FaEye } from 'react-icons/fa';
import './WinnersScreen.css';

function WinnersScreen() {
  const winners = [
    { id: 1, week: 'July 30, 2023', name: 'John', gender: 'Female', email: 'john@gmail.com', position: '1st' },
    { id: 2, week: 'Aug 6, 2023', name: 'Selena', gender: 'Female', email: 'john@gmail.com', position: '2nd' },
    { id: 3, week: 'Aug 5, 2023', name: 'Selena', gender: 'Female', email: 'john@gmail.com', position: '3rd' },
  ];

  return (
    <div className="winners-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="winners-section">
          <div className="winners-header">
            <div className="information">Weekly Challenge Winners</div>
            <div className="header-actions">
              <select className="week-dropdown">
                <option>Week</option>
                <option>July 30, 2023</option>
                <option>Aug 6, 2023</option>
                <option>Aug 5, 2023</option>
              </select>
            </div>
          </div>
          <div className="top-winners">
            <h3 className="top-winners-title">Top Winners</h3>
            <table className="winners-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Week</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Position</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr key={winner.id}>
                    <td>{winner.id}</td>
                    <td>{winner.week}</td>
                    <td>{winner.name}</td>
                    <td>{winner.gender}</td>
                    <td>{winner.email}</td>
                    <td>
                      <span className={`position-badge position-${winner.position}`}>
                        {winner.position}
                      </span>
                    </td>
                    <td>
                      <button className="action-button view-button">
                        <FaEye />
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

export default WinnersScreen;