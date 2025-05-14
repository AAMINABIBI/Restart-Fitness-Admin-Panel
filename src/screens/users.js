import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import UserTable from '../components/UserTable';
import './UserScreen.css';

function UserScreen() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    }, (error) => {
      console.error('Error fetching users:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUsersClick = () => {
    navigate('/add-user');
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <input
                type="text"
                placeholder="Ex: type by name"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="add-users-button" onClick={handleAddUsersClick}>
                Add Users
              </button>
            </div>
          </div>
          <UserTable users={filteredUsers} setUsers={setUsers} />
        </div>
      </div>
    </div>
  );
}

export default UserScreen;