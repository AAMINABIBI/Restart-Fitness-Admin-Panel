import React from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './UserTable.css';

function UserTable({ users, setUsers }) {
  const toggleAssignment = async (userId, field) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const user = users.find((u) => u.id === userId);
      const newValue = !user[field];

      // Update Firestore
      await updateDoc(userDocRef, { [field]: newValue });

      // Update local state for immediate UI update
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, [field]: newValue } : u
        )
      );
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
    }
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
            <th>Workout</th>
            <th>Diet Plan</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.profileCompleted ? 'Yes' : 'No'}</td>
              <td>
                <button
                  className={`assignment-button ${user.workoutAssigned ? 'assigned' : 'not-assigned'}`}
                  onClick={() => toggleAssignment(user.id, 'workoutAssigned')}
                >
                  {user.workoutAssigned ? 'Assigned' : 'Not Assigned'}
                </button>
              </td>
              <td>
                <button
                  className={`assignment-button ${user.dietPlanAssigned ? 'assigned' : 'not-assigned'}`}
                  onClick={() => toggleAssignment(user.id, 'dietPlanAssigned')}
                >
                  {user.dietPlanAssigned ? 'Assigned' : 'Not Assigned'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;