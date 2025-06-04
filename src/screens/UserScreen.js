import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import UserTable from '../components/UserTable';
import './UserScreen.css';
import { db, auth } from '../firebase'; // Single import for db and auth
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';

function UserScreen() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [tests, setTests] = useState([]); // List of available tests
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAssignTestModal, setShowAssignTestModal] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' or 'app'
  const [selectedUser, setSelectedUser] = useState(null); // User to assign test to
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileCompleted: false,
  });
  const [assignTestFormData, setAssignTestFormData] = useState({
    testId: '',
    levelId: '',
    specialNotes: '',
  });

  // Fetch users and admin users
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

  // Fetch available tests for assignment
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tests'));
        const testsList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTests(testsList);
      } catch (err) {
        console.error('Error fetching tests:', err.message);
        toast.error('Failed to load tests. Please try again later.', { autoClose: 3000 });
      }
    };
    fetchTests();
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
    setUserType(null);
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

  const handleAssignTestClick = (user) => {
    setSelectedUser(user);
    setShowAssignTestModal(true);
    setAssignTestFormData({
      testId: '',
      levelId: '',
      specialNotes: '',
    });
  };

  const handleAssignTestInputChange = (e) => {
    const { name, value } = e.target;
    setAssignTestFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignTestSubmit = async (e) => {
    e.preventDefault();
    if (!assignTestFormData.testId || !assignTestFormData.levelId) {
      toast.error('Please select a test and specify a level.', { autoClose: 3000 });
      return;
    }

    try {
      const userProgressRef = doc(db, 'userProgress', selectedUser.id);
      const userProgressDoc = await getDoc(userProgressRef);

      if (!userProgressDoc.exists()) {
        await setDoc(userProgressRef, {
          currentLevel: 1,
          status: 'in_progress',
          updatedAt: serverTimestamp(),
        });
      }

      const assignedData = {
        userId: selectedUser.id,
        testId: assignTestFormData.testId,
        levelId: parseInt(assignTestFormData.levelId),
        specialNotes: assignTestFormData.specialNotes || '',
        status: 'pending',
        assignedAt: serverTimestamp(),
        submittedAt: null,
        reviewedAt: null,
        videoUrl: null,
        feedback: null,
        score: null,
      };

      await addDoc(collection(db, 'assignedTests'), assignedData);
      toast.success('Test assigned successfully!', { autoClose: 3000 });
      setShowAssignTestModal(false);
      setSelectedUser(null);
      setAssignTestFormData({
        testId: '',
        levelId: '',
        specialNotes: '',
      });
    } catch (error) {
      console.error('Error assigning test:', error);
      toast.error('Failed to assign test. Please try again.', { autoClose: 3000 });
    }
  };

  const handleAssignTestCancel = () => {
    setShowAssignTestModal(false);
    setSelectedUser(null);
    setAssignTestFormData({
      testId: '',
      levelId: '',
      specialNotes: '',
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
          <UserTable
            users={displayedUsers}
            setUsers={showAdminsOnly ? setAdminUsers : setUsers}
            setAdminUsers={setAdminUsers}
            onAssignTest={handleAssignTestClick}
          />
        </div>

        {/* Add User Modal */}
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

        {/* Assign Test Modal */}
        {showAssignTestModal && selectedUser && (
          <div className="modal">
            <div className="modal-content">
              <h3>Assign Test to {selectedUser.name}</h3>
              <form onSubmit={handleAssignTestSubmit}>
                <div className="form-group">
                  <label>Select Test</label>
                  <select
                    name="testId"
                    value={assignTestFormData.testId}
                    onChange={handleAssignTestInputChange}
                    required
                  >
                    <option value="">Select a test</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Level ID</label>
                  <input
                    type="number"
                    name="levelId"
                    value={assignTestFormData.levelId}
                    onChange={handleAssignTestInputChange}
                    placeholder="Enter level ID"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Special Notes</label>
                  <textarea
                    name="specialNotes"
                    value={assignTestFormData.specialNotes}
                    onChange={handleAssignTestInputChange}
                    placeholder="Enter special notes (optional)"
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit">Assign Test</button>
                  <button type="button" onClick={handleAssignTestCancel}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default UserScreen;