import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' or 'app'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileCompleted: false,
  });

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
    setShowAddUserModal(true);
    setUserType(null); // Reset user type selection
    setFormData({
      name: '',
      email: '',
      profileCompleted: false,
    });
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userType) {
      alert('Please select whether to add an Admin User or App User.');
      return;
    }

    try {
      const collectionRef = userType === 'admin' ? collection(db, 'adminUsers') : collection(db, 'users');
      const newUserRef = await addDoc(collectionRef, {
        ...formData,
        createdAt: serverTimestamp(),
        collection: collectionRef.id,
      });
      console.log('User added to:', collectionRef.id, 'with ID:', newUserRef.id);
      setShowAddUserModal(false);
      setUserType(null);
      setFormData({
        name: '',
        email: '',
        profileCompleted: false,
      });
      // No need to navigate; stay on the same page to see the updated table
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowAddUserModal(false);
    setUserType(null);
    setFormData({
      name: '',
      email: '',
      profileCompleted: false,
    });
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

        {showAddUserModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New User</h3>
              {!userType ? (
                <div className="user-type-selection">
                  <p>Select user type:</p>
                  <button onClick={() => handleUserTypeSelection('admin')}>
                    Add Admin User
                  </button>
                  <button onClick={() => handleUserTypeSelection('app')}>
                    Add App User
                  </button>
                  <button onClick={handleCancel}>Cancel</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Completed</label>
                    <input
                      type="checkbox"
                      name="profileCompleted"
                      checked={formData.profileCompleted}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="submit">Add {userType === 'admin' ? 'Admin' : 'App'} User</button>
                    <button type="button" onClick={handleCancel}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserScreen;