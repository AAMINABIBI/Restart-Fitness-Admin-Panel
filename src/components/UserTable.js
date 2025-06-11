import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './UserTable.css';

function UserTable({ users, setUsers, setAdminUsers }) {
  const navigate = useNavigate();

  const handleEditUser = (userId) => {
    // Implement edit logic if needed
    console.log('Edit user:', userId);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all associated data?')) {
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      console.log('Deleted user:', userId);
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/user-details/${userId}`);
  };

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Profile Completed</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name || 'No Name'}</td>
              <td>{user.email || 'No Email'}</td>
              <td>{user.profileCompleted ? 'Yes' : 'No'}</td>
              <td>
                <div className="action-cell">
                  <FaEdit className="edit-icon" onClick={() => handleEditUser(user.id)} />
                </div>
              </td>
              <td>
                <div className="action-cell">
                  <FaTrash className="delete-icon" onClick={() => handleDeleteUser(user.id)} />
                </div>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className="view-details-button"
                    onClick={() => handleViewDetails(user.id)}
                  >
                    View Details
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;