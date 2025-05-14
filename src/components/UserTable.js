import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, updateDoc, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import './UserTable.css';

function UserTable({ users, setUsers }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    notes: '',
    level: 1,
    assignedAt: new Date(),
    workoutId: '',
    dietPlanId: '',
    status: 'active',
  });
  const [dietPlans, setDietPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  // Fetch diet plans and workouts from Firestore
  useEffect(() => {
    const unsubscribeDietPlans = onSnapshot(collection(db, 'dietPlans'), (snapshot) => {
      const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Diet Plans:', plans); // Debug log to check data
      setDietPlans(plans);
    }, (error) => console.error('Error fetching diet plans:', error));

    const unsubscribeWorkouts = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      const workoutsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Workouts:', workoutsList); // Debug log to check data
      setWorkouts(workoutsList);
    }, (error) => console.error('Error fetching workouts:', error));

    return () => {
      unsubscribeDietPlans();
      unsubscribeWorkouts();
    };
  }, []);

  const toggleAssignment = (userId, type) => {
    setSelectedUserId(userId);
    setSelectedType(type);
    setFormData({
      notes: '',
      level: 1,
      assignedAt: new Date(),
      workoutId: '',
      dietPlanId: '',
      status: 'active',
    });
    setModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedType) return;

    const userProgressRef = doc(db, 'userProgress', selectedUserId);
    const userProgressDoc = await getDoc(userProgressRef);

    // Create userProgress document if it doesn't exist
    if (!userProgressDoc.exists()) {
      await setDoc(userProgressRef, {
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    }

    const subCollection = selectedType === 'workout' ? 'assignedWorkouts' : 'assignedDietPlans';
    const field = selectedType === 'workout' ? 'workoutAssigned' : 'dietPlanAssigned';
    const idField = selectedType === 'workout' ? 'workoutId' : 'dietPlanId';
    const selectedId = formData[idField];

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
          u.id === selectedUserId ? { ...u, [field]: true } : u
        )
      );
      setModalOpen(false);
      setFormData({
        notes: '',
        level: 1,
        assignedAt: new Date(),
        workoutId: '',
        dietPlanId: '',
        status: 'active',
      });
    } catch (error) {
      console.error(`Error assigning ${selectedType}:`, error);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setFormData({
      notes: '',
      level: 1,
      assignedAt: new Date(),
      workoutId: '',
      dietPlanId: '',
      status: 'active',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  onClick={() => toggleAssignment(user.id, 'workout')}
                >
                  {user.workoutAssigned ? 'Assigned' : 'Not Assigned'}
                </button>
              </td>
              <td>
                <button
                  className={`assignment-button ${user.dietPlanAssigned ? 'assigned' : 'not-assigned'}`}
                  onClick={() => toggleAssignment(user.id, 'diet')}
                >
                  {user.dietPlanAssigned ? 'Assigned' : 'Not Assigned'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Assign {selectedType === 'workout' ? 'Workout' : 'Diet Plan'}</h3>
            <div className="modal-form">
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
              <div className="form-group">
                <label>Select {selectedType === 'workout' ? 'Workout' : 'Diet Plan'}</label>
                <select
                  name={selectedType === 'workout' ? 'workoutId' : 'dietPlanId'}
                  value={selectedType === 'workout' ? formData.workoutId : formData.dietPlanId}
                  onChange={handleInputChange}
                >
                  <option value="">Select {selectedType === 'workout' ? 'Workout' : 'Diet Plan'}</option>
                  {(selectedType === 'workout' ? workouts : dietPlans).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {selectedType === 'workout' ? (plan.name || plan.id) : (plan.title || plan.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleAssign}>Assign</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;