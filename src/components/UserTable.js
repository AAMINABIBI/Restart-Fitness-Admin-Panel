import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './UserTable.css';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

function UserTable({ users, setUsers, setAdminUsers, onAssignTest }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'admin', or 'app'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileCompleted: false,
    notes: '',
    level: 1,
    workoutId: '',
    dietPlanId: '',
    status: 'active',
  });
  const [dietPlans, setDietPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [isEditUserMode, setIsEditUserMode] = useState(false);

  useEffect(() => {
    const unsubscribeDietPlans = onSnapshot(collection(db, 'dietPlans'), (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDietPlans(plans);
    }, (error) => {
      toast.error('Error fetching diet plans. Please try again later.');
    });

    const unsubscribeWorkouts = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      const workoutsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWorkouts(workoutsList);
    }, (error) => {
      toast.error('Error fetching workouts. Please try again later.');
    });

    return () => {
      unsubscribeDietPlans();
      unsubscribeWorkouts();
    };
  }, []);

  useEffect(() => {
    const enhanceUsers = async () => {
      const updatedUsers = await Promise.all(users.map(async (user) => {
        const userProgressRef = doc(db, 'userProgress', user.id);
        const userProgressDoc = await getDoc(userProgressRef);
        let workoutAssigned = false;
        let dietPlanAssigned = false;
        let testAssigned = false;

        if (userProgressDoc.exists()) {
          const workoutAssignments = await getDocs(collection(db, 'userProgress', user.id, 'assignedWorkouts'));
          const dietPlanAssignments = await getDocs(collection(db, 'userProgress', user.id, 'assignedDietPlans'));
          const testAssignments = await getDocs(query(
            collection(db, 'assignedTests'),
            where('userId', '==', user.id),
            where('status', '==', 'pending')
          ));

          workoutAssigned = workoutAssignments.docs.some((doc) => doc.data().status === 'active');
          dietPlanAssigned = dietPlanAssignments.docs.some((doc) => doc.data().status === 'active');
          testAssigned = testAssignments.docs.length > 0;
        }

        return { ...user, workoutAssigned, dietPlanAssigned, testAssigned };
      }));
      setUsers(updatedUsers);
    };

    if (users.length > 0) {
      enhanceUsers().catch((error) => {
        console.error('Error enhancing users:', error);
        toast.error('Failed to load user assignments. Please try again.');
      });
    }
  }, [users, setUsers]);

  const toggleAssignment = (userId, type) => {
    setSelectedUserId(userId);
    setSelectedType(type);
    setFormData({
      name: '',
      email: '',
      profileCompleted: false,
      notes: '',
      level: 1,
      workoutId: '',
      dietPlanId: '',
      status: 'active',
    });
    setIsEditUserMode(false);
    setModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedType) return;

    const userProgressRef = doc(db, 'userProgress', selectedUserId);
    const userProgressDoc = await getDoc(userProgressRef);

    if (!userProgressDoc.exists()) {
      await setDoc(userProgressRef, {
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    }

    const subCollection = selectedType === 'workout' ? 'assignedWorkouts' : 'assignedDietPlans';
    const idField = selectedType === 'workout' ? 'workoutId' : 'dietPlanId';
    const selectedId = formData[idField];

    if (!selectedId) {
      toast.error(`Please select a ${selectedType === 'workout' ? 'workout' : 'diet plan'} to assign.`);
      return;
    }

    try {
      const existingAssignments = await getDocs(collection(db, 'userProgress', selectedUserId, subCollection));
      const existingAssignment = existingAssignments.docs.find((doc) => doc.data().status === 'active');

      if (existingAssignment) {
        await deleteDoc(doc(db, 'userProgress', selectedUserId, subCollection, existingAssignment.id));
      }

      const assignmentData = {
        notes: formData.notes,
        level: parseInt(formData.level),
        assignedAt: serverTimestamp(),
        [idField]: selectedId,
        status: formData.status,
      };
      await addDoc(collection(db, 'userProgress', selectedUserId, subCollection), assignmentData);

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUserId ? { ...u, [idField === 'workoutId' ? 'workoutAssigned' : 'dietPlanAssigned']: true } : u
        )
      );
      toast.success(`${selectedType === 'workout' ? 'Workout' : 'Diet Plan'} assigned successfully!`);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        profileCompleted: false,
        notes: '',
        level: 1,
        workoutId: '',
        dietPlanId: '',
        status: 'active',
      });
    } catch (error) {
      console.error('Error assigning:', error);
      toast.error(`Failed to assign ${selectedType === 'workout' ? 'workout' : 'diet plan'}. Please try again.`);
    }
  };

  const handleEditUser = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userProgressRef = doc(db, 'userProgress', userId);

    try {
      const userDoc = await getDoc(userDocRef);
      const userProgressDoc = await getDoc(userProgressRef);

      if (!userDoc.exists()) {
        toast.error('User not found.');
        return;
      }

      const userData = userDoc.data();
      let workoutData = {};
      let dietPlanData = {};

      if (userProgressDoc.exists()) {
        const workoutAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedWorkouts'));
        const dietPlanAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedDietPlans'));

        const activeWorkout = workoutAssignments.docs.find((doc) => doc.data().status === 'active');
        const activeDietPlan = dietPlanAssignments.docs.find((doc) => doc.data().status === 'active');

        if (activeWorkout) workoutData = activeWorkout.data();
        if (activeDietPlan) dietPlanData = activeDietPlan.data();
      }

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        profileCompleted: userData.profileCompleted || false,
        notes: workoutData.notes || dietPlanData.notes || '',
        level: workoutData.level || dietPlanData.level || 1,
        workoutId: workoutData.workoutId || '',
        dietPlanId: dietPlanData.dietPlanId || '',
        status: workoutData.status || dietPlanData.status || 'active',
      });
      setSelectedUserId(userId);
      setIsEditUserMode(true);
      setModalOpen(true);
    } catch (error) {
      console.error('Error editing user:', error);
      toast.error('Failed to load user data for editing. Please try again.');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUserId) return;

    const userDocRef = doc(db, 'users', selectedUserId);
    const userProgressRef = doc(db, 'userProgress', selectedUserId);

    try {
      await updateDoc(userDocRef, {
        name: formData.name,
        email: formData.email,
        profileCompleted: formData.profileCompleted,
      });

      if (formData.workoutId) {
        const workoutAssignments = await getDocs(collection(db, 'userProgress', selectedUserId, 'assignedWorkouts'));
        const activeWorkout = workoutAssignments.docs.find((doc) => doc.data().status === 'active');

        if (activeWorkout) {
          await updateDoc(doc(db, 'userProgress', selectedUserId, 'assignedWorkouts', activeWorkout.id), {
            notes: formData.notes,
            level: parseInt(formData.level),
            status: formData.status,
          });
        } else {
          await addDoc(collection(db, 'userProgress', selectedUserId, 'assignedWorkouts'), {
            notes: formData.notes,
            level: parseInt(formData.level),
            assignedAt: serverTimestamp(),
            workoutId: formData.workoutId,
            status: formData.status,
          });
        }
      }

      if (formData.dietPlanId) {
        const dietPlanAssignments = await getDocs(collection(db, 'userProgress', selectedUserId, 'assignedDietPlans'));
        const activeDietPlan = dietPlanAssignments.docs.find((doc) => doc.data().status === 'active');

        if (activeDietPlan) {
          await updateDoc(doc(db, 'userProgress', selectedUserId, 'assignedDietPlans', activeDietPlan.id), {
            notes: formData.notes,
            level: parseInt(formData.level),
            status: formData.status,
          });
        } else {
          await addDoc(collection(db, 'userProgress', selectedUserId, 'assignedDietPlans'), {
            notes: formData.notes,
            level: parseInt(formData.level),
            assignedAt: serverTimestamp(),
            dietPlanId: formData.dietPlanId,
            status: formData.status,
          });
        }
      }

      toast.success('User updated successfully!');
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        profileCompleted: false,
        notes: '',
        level: 1,
        workoutId: '',
        dietPlanId: '',
        status: 'active',
      });
      setIsEditUserMode(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all associated data?')) return;

    try {
      await deleteDoc(doc(db, 'users', userId));
      const userProgressRef = doc(db, 'userProgress', userId);
      const workoutAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedWorkouts'));
      const dietPlanAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedDietPlans'));
      const testAssignments = await getDocs(collection(db, 'assignedTests', userId)); // Adjusted to top-level collection

      await Promise.all(workoutAssignments.docs.map((doc) => deleteDoc(doc.ref)));
      await Promise.all(dietPlanAssignments.docs.map((doc) => deleteDoc(doc.ref)));
      await Promise.all(testAssignments.docs.map((doc) => deleteDoc(doc.ref)));
      await deleteDoc(userProgressRef);

      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      toast.success('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user. Please try again.');
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setFormData({
      name: '',
      email: '',
      profileCompleted: false,
      notes: '',
      level: 1,
      workoutId: '',
      dietPlanId: '',
      status: 'active',
    });
    setIsEditUserMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Filter users based on viewMode
  const filteredUsers = viewMode === 'admin'
    ? users.filter((user) => user.collection === 'adminUsers')
    : viewMode === 'app'
      ? users.filter((user) => user.collection === 'users')
      : users;

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
            <th>Test</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.name || 'No Name'}</td>
              <td>{user.email || 'No Email'}</td>
              <td>{user.profileCompleted ? 'Yes' : 'No'}</td>
              <td>
                <div className="action-cell">
                  <button
                    className={`assignment-button ${user.workoutAssigned ? 'assigned' : 'not-assigned'}`}
                    onClick={() => toggleAssignment(user.id, 'workout')}
                  >
                    {user.workoutAssigned ? 'Assigned' : 'Not Assigned'}
                  </button>
                </div>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className={`assignment-button ${user.dietPlanAssigned ? 'assigned' : 'not-assigned'}`}
                    onClick={() => toggleAssignment(user.id, 'diet')}
                  >
                    {user.dietPlanAssigned ? 'Assigned' : 'Not Assigned'}
                  </button>
                </div>
              </td>
              <td>
                <div className="action-cell">
                  <button
                    className={`assignment-button ${user.testAssigned ? 'assigned' : 'not-assigned'}`}
                    onClick={() => onAssignTest(user)}
                  >
                    {user.testAssigned ? 'Assigned' : 'Not Assigned'}
                  </button>
                </div>
              </td>
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
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditUserMode ? 'Edit User' : `Assign ${selectedType === 'workout' ? 'Workout' : 'Diet Plan'}`}</h3>
            <div className="modal-form">
              {isEditUserMode && (
                <>
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
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
                </>
              )}
              <div className="form-group">
                <label>Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter notes"
                />
              </div>
              <div className="form-group">
                <label>Level</label>
                <input
                  type="number"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {(isEditUserMode || selectedType === 'workout') && (
                <div className="form-group">
                  <label>Select Workout</label>
                  <select
                    name="workoutId"
                    value={formData.workoutId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Workout</option>
                    {workouts.map((workout) => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name || workout.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(isEditUserMode || selectedType === 'diet') && (
                <div className="form-group">
                  <label>Select Diet Plan</label>
                  <select
                    name="dietPlanId"
                    value={formData.dietPlanId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Diet Plan</option>
                    {dietPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.title || plan.id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={isEditUserMode ? handleUpdateUser : handleAssign}>
                {isEditUserMode ? 'Update' : 'Assign'}
              </button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;