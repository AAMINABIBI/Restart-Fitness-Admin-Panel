import React from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import './UserTable.css';

function UserTable() {
  const users = [
    { id: 1, name: 'John', gender: 'Female', email: 'john@gmail.com' },
    { id: 2, name: 'Selena', gender: 'Female', email: 'john@gmail.com' },
  ];

  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>SL</th>
          <th>NAME</th>
          <th>GENDER</th>
          <th>EMAIL</th>
          <th>PASSWORD</th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.gender}</td>
            <td>{user.email}</td>
            <td>
              <button className="change-password-button">CHANGE</button>
            </td>
            <td className="actions-column">
              <button className="action-button view-button">
                <FaEye />
              </button>
              <button className="action-button delete-button">
                <FaTrash />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;