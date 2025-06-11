import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import './UserDetailsTable.css';

function UserDetailsTable() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showDietPlanModal, setShowDietPlanModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [tests, setTests] = useState([]);
  const [formData, setFormData] = useState({
    workoutId: '',
    dietPlanId: '',
    testId: '',
    level: 1,
    notes: '',
    status: 'active',
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDocRef = doc(db, 'users', userId);
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.error('User not found.');
          return;
        }
        setUserDetails(userDoc.data());
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    const fetchAssignments = async () => {
      const userProgressRef = doc(db, 'userProgress', userId);
      const userProgressDoc = await getDoc(userProgressRef);
      if (userProgressDoc.exists()) {
        const workoutAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedWorkouts'));
        const dietPlanAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedDietPlans'));
        const testAssignments = await getDocs(collection(db, 'userProgress', userId, 'assignedTests'));

        setUserDetails(prev => ({
          ...prev,
          workouts: workoutAssignments.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          dietPlans: dietPlanAssignments.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          tests: testAssignments.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        }));
      }
    };

    const fetchWorkouts = async () => {
      const snapshot = await getDocs(collection(db, 'workouts'));
      setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchDietPlans = async () => {
      const snapshot = await getDocs(collection(db, 'dietPlans'));
      setDietPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchTests = async () => {
      const snapshot = await getDocs(collection(db, 'tests'));
      setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUserDetails();
    fetchAssignments();
    fetchWorkouts();
    fetchDietPlans();
    fetchTests();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignWorkout = async (e) => {
    e.preventDefault();
    if (!formData.workoutId) {
      alert('Please select a workout.');
      return;
    }

    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressDoc = await getDoc(userProgressRef);

    if (!userProgressDoc.exists()) {
      await addDoc(collection(db, 'userProgress'), {
        userId,
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await addDoc(collection(db, 'userProgress', userId, 'assignedWorkouts'), {
        workoutId: formData.workoutId,
        level: parseInt(formData.level),
        notes: formData.notes,
        status: formData.status,
        assignedAt: serverTimestamp(),
      });
      setShowWorkoutModal(false);
      setFormData({ workoutId: '', dietPlanId: '', testId: '', level: 1, notes: '', status: 'active' });
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error assigning workout:', error);
      alert('Failed to assign workout.');
    }
  };

  const handleAssignDietPlan = async (e) => {
    e.preventDefault();
    if (!formData.dietPlanId) {
      alert('Please select a diet plan.');
      return;
    }

    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressDoc = await getDoc(userProgressRef);

    if (!userProgressDoc.exists()) {
      await addDoc(collection(db, 'userProgress'), {
        userId,
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await addDoc(collection(db, 'userProgress', userId, 'assignedDietPlans'), {
        dietPlanId: formData.dietPlanId,
        level: parseInt(formData.level),
        notes: formData.notes,
        status: formData.status,
        assignedAt: serverTimestamp(),
      });
      setShowDietPlanModal(false);
      setFormData({ workoutId: '', dietPlanId: '', testId: '', level: 1, notes: '', status: 'active' });
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error assigning diet plan:', error);
      alert('Failed to assign diet plan.');
    }
  };

  const handleAssignTest = async (e) => {
    e.preventDefault();
    if (!formData.testId) {
      alert('Please select a test.');
      return;
    }

    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressDoc = await getDoc(userProgressRef);

    if (!userProgressDoc.exists()) {
      await addDoc(collection(db, 'userProgress'), {
        userId,
        currentLevel: 1,
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await addDoc(collection(db, 'userProgress', userId, 'assignedTests'), {
        testId: formData.testId,
        levelId: parseInt(formData.level),
        notes: formData.notes,
        status: formData.status,
        assignedAt: serverTimestamp(),
      });
      setShowTestModal(false);
      setFormData({ workoutId: '', dietPlanId: '', testId: '', level: 1, notes: '', status: 'active' });
      window.location.reload(); // Refresh to update the UI
    } catch (error) {
      console.error('Error assigning test:', error);
      alert('Failed to assign test.');
    }
  };

  if (!userDetails) return <div>Loading...</div>;

  return (
    <div className="user-details-container">
      <h2>User Details: {userDetails.name}</h2>

      {/* Personal Information Section */}
      <div className="details-section">
        <h3>Personal Information</h3>
        <table className="details-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name</td>
              <td>{userDetails.name || 'N/A'}</td>
            </tr>
            <tr>
              <td>Age</td>
              <td>{userDetails.age || 'N/A'}</td>
            </tr>
            <tr>
              <td>Gender</td>
              <td>{userDetails.gender || 'N/A'}</td>
            </tr>
            <tr>
              <td>Weight</td>
              <td>{userDetails.weight || 'N/A'} {userDetails.weightUnitPrefrence || 'N/A'}</td>
            </tr>
            <tr>
              <td>Height</td>
              <td>{userDetails.height || 'N/A'} {userDetails.heightUnitPrefrence || 'N/A'}</td>
            </tr>
            <tr>
              <td>Profile Picture</td>
              <td>
                {userDetails.displayPicUrl ? (
                  <a href={userDetails.displayPicUrl} target="_blank" rel="noopener noreferrer">
                    View Image
                  </a>
                ) : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Additional Details Section */}
      <div className="details-section">
        <h3>Additional Details</h3>
        <table className="details-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Activity Level</td>
              <td>{userDetails.activityLevel || 'N/A'}</td>
            </tr>
            <tr>
              <td>Body Shape</td>
              <td>{userDetails.bodyShape || 'N/A'}</td>
            </tr>
            <tr>
              <td>Target Body Shape</td>
              <td>{userDetails.targetBodyShape || 'N/A'}</td>
            </tr>
            <tr>
              <td>Physical Preparation</td>
              <td>{userDetails.physicalPreparation || 'N/A'}</td>
            </tr>
            <tr>
              <td>Workout Rate</td>
              <td>{userDetails.workoutRate || 'N/A'}</td>
            </tr>
            <tr>
              <td>Profile Completed</td>
              <td>{userDetails.profileCompleted ? 'Yes' : 'No'}</td>
            </tr>
            <tr>
              <td>ID</td>
              <td>{userDetails.id || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="assignment-buttons">
        <button onClick={() => setActiveSection('workouts')}>Assigned Workouts</button>
        <button onClick={() => setActiveSection('dietPlans')}>Assigned Diet Plans</button>
        <button onClick={() => setActiveSection('tests')}>Assigned Tests</button>
      </div>

      {activeSection === 'workouts' && (
        <div className="assignment-section">
          <h3>Assigned Workouts</h3>
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Workout ID</th>
                <th>Level</th>
                <th>Status</th>
                <th>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {userDetails.workouts && userDetails.workouts.length > 0 ? (
                userDetails.workouts.map((workout, index) => (
                  <tr key={index}>
                    <td>{workout.workoutId || 'N/A'}</td>
                    <td>{workout.level || 'N/A'}</td>
                    <td>{workout.status || 'N/A'}</td>
                    <td>{workout.assignedAt?.toDate().toLocaleString() || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No workouts assigned</td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setShowWorkoutModal(true)}>Add Workout</button>
        </div>
      )}

      {activeSection === 'dietPlans' && (
        <div className="assignment-section">
          <h3>Assigned Diet Plans</h3>
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Diet Plan ID</th>
                <th>Level</th>
                <th>Status</th>
                <th>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {userDetails.dietPlans && userDetails.dietPlans.length > 0 ? (
                userDetails.dietPlans.map((dietPlan, index) => (
                  <tr key={index}>
                    <td>{dietPlan.dietPlanId || 'N/A'}</td>
                    <td>{dietPlan.level || 'N/A'}</td>
                    <td>{dietPlan.status || 'N/A'}</td>
                    <td>{dietPlan.assignedAt?.toDate().toLocaleString() || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No diet plans assigned</td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setShowDietPlanModal(true)}>Add Diet Plan</button>
        </div>
      )}

      {activeSection === 'tests' && (
        <div className="assignment-section">
          <h3>Assigned Tests</h3>
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Level</th>
                <th>Status</th>
                <th>Assigned At</th>
              </tr>
            </thead>
            <tbody>
              {userDetails.tests && userDetails.tests.length > 0 ? (
                userDetails.tests.map((test, index) => (
                  <tr key={index}>
                    <td>{test.testId || 'N/A'}</td>
                    <td>{test.levelId || 'N/A'}</td>
                    <td>{test.status || 'N/A'}</td>
                    <td>{test.assignedAt?.toDate().toLocaleString() || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No tests assigned</td>
                </tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setShowTestModal(true)}>Add Test</button>
        </div>
      )}

      <button onClick={() => navigate('/dashboard')}>Back to Users</button>

      {showWorkoutModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Workout</h3>
            <form onSubmit={handleAssignWorkout}>
              <div className="form-group">
                <label>Select Workout</label>
                <select name="workoutId" value={formData.workoutId} onChange={handleInputChange}>
                  <option value="">Select Workout</option>
                  {workouts.map(workout => (
                    <option key={workout.id} value={workout.id}>{workout.name || workout.id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">Assign Workout</button>
                <button type="button" onClick={() => setShowWorkoutModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDietPlanModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Diet Plan</h3>
            <form onSubmit={handleAssignDietPlan}>
              <div className="form-group">
                <label>Select Diet Plan</label>
                <select name="dietPlanId" value={formData.dietPlanId} onChange={handleInputChange}>
                  <option value="">Select Diet Plan</option>
                  {dietPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.title || plan.id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">Assign Diet Plan</button>
                <button type="button" onClick={() => setShowDietPlanModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTestModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Test</h3>
            <form onSubmit={handleAssignTest}>
              <div className="form-group">
                <label>Select Test</label>
                <select name="testId" value={formData.testId} onChange={handleInputChange}>
                  <option value="">Select Test</option>
                  {tests.map(test => (
                    <option key={test.id} value={test.id}>{test.title || test.id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit">Assign Test</button>
                <button type="button" onClick={() => setShowTestModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetailsTable;