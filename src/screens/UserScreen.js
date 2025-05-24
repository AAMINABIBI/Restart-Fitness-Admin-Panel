import React, { useState, useEffect, useMemo } from 'react';
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
  const [adminUsers, setAdminUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);

  useEffect(() => {
    let unsubscribeUsers, unsubscribeAdminUsers;
    try {
      unsubscribeUsers = onSnapshot(collection(db, 'users'), { includeMetadataChanges: false }, (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          collection: 'users',
        }));
        console.log('Users fetched:', usersList.length, 'documents');
        setUsers(usersList);
      }, (error) => {
        console.error('Error fetching users:', error);
      });

      unsubscribeAdminUsers = onSnapshot(collection(db, 'adminUsers'), { includeMetadataChanges: false }, (snapshot) => {
        const adminUsersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          collection: 'adminUsers',
        }));
        console.log('Admin Users fetched:', adminUsersList.length, 'documents');
        setAdminUsers(adminUsersList);
      }, (error) => {
        console.error('Error fetching admin users:', error);
      });

      return () => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeAdminUsers) unsubscribeAdminUsers();
      };
    } catch (error) {
      console.error('Error setting up onSnapshot:', error);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredAdminUsers = useMemo(() => {
    return adminUsers.filter((user) =>
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [adminUsers, searchQuery]);

  const displayedUsers = showAdminsOnly ? filteredAdminUsers : filteredUsers;

  useEffect(() => {
    console.log('Filter applied - Displayed users:', displayedUsers.length, 'documents');
  }, [displayedUsers.length]);

  const handleAddUsersClick = () => {
    navigate('/add-user');
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
            <div className="information">{showAdminsOnly ? 'Admin Users' : 'Users List'}</div>
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
              <button
                className="admin-users-button"
                onClick={() => setShowAdminsOnly(!showAdminsOnly)}
              >
                {showAdminsOnly ? 'All Users' : 'Admin Users'}
              </button>
            </div>
          </div>
          <UserTable users={displayedUsers} setUsers={showAdminsOnly ? setAdminUsers : setUsers} setAdminUsers={setAdminUsers} />
        </div>
      </div>
    </div>
  );
}

export default UserScreen;