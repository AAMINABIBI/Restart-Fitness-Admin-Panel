

// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { db } from '../firebase'; // Import db from firebase.js
// import { getDoc, collection, getDocs, addDoc, updateDoc, serverTimestamp, doc } from 'firebase/firestore'; // Import modular functions
// import './UserDetailsTable.css';

// function UserDetailsTable() {
//   const { userId } = useParams();
//   const navigate = useNavigate();
//   const [userDetails, setUserDetails] = useState(null);
//   const [activeSection, setActiveSection] = useState(null);
//   const [showWorkoutModal, setShowWorkoutModal] = useState(false);
//   const [showDietPlanModal, setShowDietPlanModal] = useState(false);
//   const [showTestModal, setShowTestModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [workouts, setWorkouts] = useState([]);
//   const [dietPlans, setDietPlans] = useState([]);
//   const [tests, setTests] = useState([]);
//   const [formData, setFormData] = useState({
//     workoutId: '',
//     dietPlanId: '',
//     testId: '',
//     level: 1,
//     notes: '',
//     status: 'active',
//     currentLevel: 2,
//     lastWorkoutPerformed: '',
//     updatedAt: '',
//   });
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const checkAdmin = async () => {
//       const { auth } = await import('../firebase'); // Dynamically import auth
//       const user = auth.currentUser;
//       if (user) {
//         const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
//         console.log('Admin status for', user.uid, ':', adminDoc.exists());
//       }
//     };
//     checkAdmin();

//     const fetchUserDetails = async () => {
//       try {
//         const userDocRef = doc(db, 'users', userId);
//         const userDoc = await getDoc(userDocRef);
//         if (!userDoc.exists()) {
//           setError('User not found.');
//           return;
//         }
//         setUserDetails(userDoc.data());
//       } catch (error) {
//         console.error('Error fetching user details:', error);
//         setError('Insufficient permissions or error fetching user data.');
//       }
//     };

//     const fetchProgressDetails = async () => {
//       try {
//         const progressDocRef = doc(db, 'userProgress', userId);
//         console.log('Attempting to fetch:', progressDocRef.path, 'with auth:', (await import('../firebase')).auth.currentUser?.uid);
//         const progressDoc = await getDoc(progressDocRef);
//         const assignedWorkouts = [];
//         const assignedDietPlans = [];
//         const assignedTests = [];

//         if (!progressDoc.exists()) {
//           await setDoc(progressDocRef, {
//             userId,
//             currentLevel: 2,
//             status: 'in_progress',
//             updatedAt: serverTimestamp(),
//           });
//           console.log('Created missing progress document:', progressDocRef.path);
//         }

//         const workoutSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedWorkouts'));
//         assignedWorkouts.push(...workoutSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

//         const dietPlanSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedDietPlans'));
//         assignedDietPlans.push(...dietPlanSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

//         const testSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedTests'));
//         assignedTests.push(...testSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

//         setUserDetails(prev => ({
//           ...prev,
//           ...(progressDoc.exists() ? progressDoc.data() : { currentLevel: 2, status: 'in_progress' }),
//           workouts: assignedWorkouts,
//           dietPlans: assignedDietPlans,
//           tests: assignedTests,
//         }));
//       } catch (error) {
//         console.error('Detailed error:', error.message, error.code);
//         setError('Insufficient permissions or error fetching progress data: ' + error.message);
//       }
//     };

//     const fetchWorkouts = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'workouts'));
//         setWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       } catch (error) {
//         console.error('Error fetching workouts:', error);
//       }
//     };

//     const fetchDietPlans = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'dietPlans'));
//         setDietPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       } catch (error) {
//         console.error('Error fetching diet plans:', error);
//       }
//     };

//     const fetchTests = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, 'tests'));
//         setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//       } catch (error) {
//         console.error('Error fetching tests:', error);
//       }
//     };

//     setError(null);
//     fetchUserDetails();
//     fetchProgressDetails();
//     fetchWorkouts();
//     fetchDietPlans();
//     fetchTests();
//   }, [userId]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAssignWorkout = async (e) => {
//     e.preventDefault();
//     if (!formData.workoutId) {
//       alert('Please select a workout.');
//       return;
//     }

//     try {
//       const progressDocRef = doc(db, 'userProgress', userId);
//       const progressDoc = await getDoc(progressDocRef);

//       if (!progressDoc.exists()) {
//         await setDoc(progressDocRef, {
//           userId,
//           currentLevel: 2,
//           status: 'in_progress',
//           updatedAt: serverTimestamp(),
//         });
//       }

//       await addDoc(collection(db, 'userProgress', userId, 'assignedWorkouts'), {
//         workoutId: formData.workoutId,
//         level: parseInt(formData.level),
//         notes: formData.notes,
//         status: formData.status,
//         assignedAt: serverTimestamp(),
//       });
//       setShowWorkoutModal(false);
//       setFormData(prev => ({ ...prev, workoutId: '', level: 1, notes: '', status: 'active' }));
//       window.location.reload();
//     } catch (error) {
//       console.error('Error assigning workout:', error);
//       setError('Insufficient permissions or error assigning workout.');
//     }
//   };

//   const handleAssignDietPlan = async (e) => {
//     e.preventDefault();
//     if (!formData.dietPlanId) {
//       alert('Please select a diet plan.');
//       return;
//     }

//     try {
//       const progressDocRef = doc(db, 'userProgress', userId);
//       const progressDoc = await getDoc(progressDocRef);

//       if (!progressDoc.exists()) {
//         await setDoc(progressDocRef, {
//           userId,
//           currentLevel: 2,
//           status: 'in_progress',
//           updatedAt: serverTimestamp(),
//         });
//       }

//       await addDoc(collection(db, 'userProgress', userId, 'assignedDietPlans'), {
//         dietPlanId: formData.dietPlanId,
//         level: parseInt(formData.level),
//         notes: formData.notes,
//         status: formData.status,
//         assignedAt: serverTimestamp(),
//       });
//       setShowDietPlanModal(false);
//       setFormData(prev => ({ ...prev, dietPlanId: '', level: 1, notes: '', status: 'active' }));
//       window.location.reload();
//     } catch (error) {
//       console.error('Error assigning diet plan:', error);
//       setError('Insufficient permissions or error assigning diet plan.');
//     }
//   };

//   const handleAssignTest = async (e) => {
//     e.preventDefault();
//     if (!formData.testId) {
//       alert('Please select a test.');
//       return;
//     }

//     try {
//       const progressDocRef = doc(db, 'userProgress', userId);
//       const progressDoc = await getDoc(progressDocRef);

//       if (!progressDoc.exists()) {
//         await setDoc(progressDocRef, {
//           userId,
//           currentLevel: 2,
//           status: 'in_progress',
//           updatedAt: serverTimestamp(),
//         });
//       }

//       await addDoc(collection(db, 'userProgress', userId, 'assignedTests'), {
//         testId: formData.testId,
//         levelId: parseInt(formData.level),
//         notes: formData.notes,
//         status: formData.status,
//         assignedAt: serverTimestamp(),
//       });
//       setShowTestModal(false);
//       setFormData(prev => ({ ...prev, testId: '', level: 1, notes: '', status: 'active' }));
//       window.location.reload();
//     } catch (error) {
//       console.error('Error assigning test:', error);
//       setError('Insufficient permissions or error assigning test.');
//     }
//   };

//   const handleUpdateProgress = async (e) => {
//     e.preventDefault();
//     try {
//       const progressDocRef = doc(db, 'userProgress', userId);
//       await updateDoc(progressDocRef, {
//         currentLevel: parseInt(formData.currentLevel),
//         lastWorkoutPerformed: formData.lastWorkoutPerformed ? new Date(formData.lastWorkoutPerformed) : serverTimestamp(),
//         status: formData.status,
//         updatedAt: serverTimestamp(),
//       });
//       setShowEditModal(false);
//       setFormData(prev => ({ ...prev, currentLevel: 2, lastWorkoutPerformed: '', status: 'active' }));
//       window.location.reload();
//     } catch (error) {
//       console.error('Error updating progress:', error);
//       setError('Insufficient permissions or error updating progress.');
//     }
//   };

//   if (!userDetails && !error) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="user-details-container">
//       <h2>User Details: {userDetails.name}</h2>

//       {/* Progress Details Section */}
//       <div className="details-section">
//         <h3>Progress Details</h3>
//         <table className="details-table">
//           <thead>
//             <tr>
//               <th>Field</th>
//               <th>Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>Current Level</td>
//               <td>{userDetails.currentLevel || 'N/A'}</td>
//             </tr>
//             <tr>
//               <td>Last Workout Performed</td>
//               <td>{userDetails.lastWorkoutPerformed?.toDate().toLocaleString() || 'N/A'}</td>
//             </tr>
//             <tr>
//               <td>Status</td>
//               <td>{userDetails.status || 'N/A'}</td>
//             </tr>
//             <tr>
//               <td>Updated At</td>
//               <td>{userDetails.updatedAt?.toDate().toLocaleString() || 'N/A'}</td>
//             </tr>
//           </tbody>
//         </table>
//         <button onClick={() => {
//           setShowEditModal(true);
//           setFormData(prev => ({
//             ...prev,
//             currentLevel: userDetails.currentLevel || 2,
//             lastWorkoutPerformed: userDetails.lastWorkoutPerformed?.toDate().toISOString().slice(0, 16) || '',
//             status: userDetails.status || 'active',
//           }));
//         }}>Edit Progress</button>
//       </div>

//       <div className="assignment-buttons">
//         <button onClick={() => setActiveSection('workouts')}>Assigned Workouts</button>
//         <button onClick={() => setActiveSection('dietPlans')}>Assigned Diet Plans</button>
//         <button onClick={() => setActiveSection('tests')}>Assigned Tests</button>
//       </div>

//       {activeSection === 'workouts' && (
//         <div className="assignment-section">
//           <h3>Assigned Workouts</h3>
//           <table className="assignment-table">
//             <thead>
//               <tr>
//                 <th>Workout ID</th>
//                 <th>Level</th>
//                 <th>Status</th>
//                 <th>Assigned At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userDetails.workouts && userDetails.workouts.length > 0 ? (
//                 userDetails.workouts.map((workout, index) => (
//                   <tr key={index}>
//                     <td>{workout.workoutId || 'N/A'}</td>
//                     <td>{workout.level || 'N/A'}</td>
//                     <td>{workout.status || 'N/A'}</td>
//                     <td>{workout.assignedAt?.toDate().toLocaleString() || 'N/A'}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4">No workouts assigned</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <button onClick={() => setShowWorkoutModal(true)}>Add Workout</button>
//         </div>
//       )}

//       {activeSection === 'dietPlans' && (
//         <div className="assignment-section">
//           <h3>Assigned Diet Plans</h3>
//           <table className="assignment-table">
//             <thead>
//               <tr>
//                 <th>Diet Plan ID</th>
//                 <th>Level</th>
//                 <th>Status</th>
//                 <th>Assigned At</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userDetails.dietPlans && userDetails.dietPlans.length > 0 ? (
//                 userDetails.dietPlans.map((dietPlan, index) => (
//                   <tr key={index}>
//                     <td>{dietPlan.dietPlanId || 'N/A'}</td>
//                     <td>{dietPlan.level || 'N/A'}</td>
//                     <td>{dietPlan.status || 'N/A'}</td>
//                     <td>{dietPlan.assignedAt?.toDate().toLocaleString() || 'N/A'}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4">No diet plans assigned</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <button onClick={() => setShowDietPlanModal(true)}>Add Diet Plan</button>
//         </div>
//       )}

//       {activeSection === 'tests' && (
//         <div className="assignment-section">
//           <h3>Assigned Tests</h3>
//           <table className="assignment-table">
//             <thead>
//               <tr>
//                 <th>Test ID</th>
//                 <th>Level</th>
//                 <th>Status</th>
//                 <th>Submitted At</th>
//                 <th>Video</th>
//               </tr>
//             </thead>
//             <tbody>
//               {userDetails.tests && userDetails.tests.length > 0 ? (
//                 userDetails.tests.map((test, index) => (
//                   <tr key={index}>
//                     <td>{test.testId || 'N/A'}</td>
//                     <td>{test.levelId || 'N/A'}</td>
//                     <td>{test.status || 'N/A'}</td>
//                     <td>{test.submittedAt?.toDate().toLocaleString() || 'N/A'}</td>
//                     <td>
//                       {test.videoUrl ? (
//                         <a href={test.videoUrl} target="_blank" rel="noopener noreferrer">View Video</a>
//                       ) : 'N/A'}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5">No tests assigned</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           <button onClick={() => setShowTestModal(true)}>Add Test</button>
//         </div>
//       )}

//       <button onClick={() => navigate('/dashboard')}>Back to Users</button>

//       {showWorkoutModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Add Workout</h3>
//             <form onSubmit={handleAssignWorkout}>
//               <div className="form-group">
//                 <label>Select Workout</label>
//                 <select name="workoutId" value={formData.workoutId} onChange={handleInputChange}>
//                   <option value="">Select Workout</option>
//                   {workouts.map(workout => (
//                     <option key={workout.id} value={workout.id}>{workout.name || workout.id}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Level</label>
//                 <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
//               </div>
//               <div className="form-group">
//                 <label>Notes</label>
//                 <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Status</label>
//                 <select name="status" value={formData.status} onChange={handleInputChange}>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//               <div className="modal-buttons">
//                 <button type="submit">Assign Workout</button>
//                 <button type="button" onClick={() => setShowWorkoutModal(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showDietPlanModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Add Diet Plan</h3>
//             <form onSubmit={handleAssignDietPlan}>
//               <div className="form-group">
//                 <label>Select Diet Plan</label>
//                 <select name="dietPlanId" value={formData.dietPlanId} onChange={handleInputChange}>
//                   <option value="">Select Diet Plan</option>
//                   {dietPlans.map(plan => (
//                     <option key={plan.id} value={plan.id}>{plan.title || plan.id}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Level</label>
//                 <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
//               </div>
//               <div className="form-group">
//                 <label>Notes</label>
//                 <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Status</label>
//                 <select name="status" value={formData.status} onChange={handleInputChange}>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                 </select>
//               </div>
//               <div className="modal-buttons">
//                 <button type="submit">Assign Diet Plan</button>
//                 <button type="button" onClick={() => setShowDietPlanModal(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showTestModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Add Test</h3>
//             <form onSubmit={handleAssignTest}>
//               <div className="form-group">
//                 <label>Select Test</label>
//                 <select name="testId" value={formData.testId} onChange={handleInputChange}>
//                   <option value="">Select Test</option>
//                   {tests.map(test => (
//                     <option key={test.id} value={test.id}>{test.title || test.id}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Level</label>
//                 <input type="number" name="level" value={formData.level} onChange={handleInputChange} min="1" />
//               </div>
//               <div className="form-group">
//                 <label>Notes</label>
//                 <input type="text" name="notes" value={formData.notes} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Status</label>
//                 <select name="status" value={formData.status} onChange={handleInputChange}>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="submitted">Submitted</option>
//                 </select>
//               </div>
//               <div className="modal-buttons">
//                 <button type="submit">Assign Test</button>
//                 <button type="button" onClick={() => setShowTestModal(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showEditModal && (
//         <div className="modal">
//           <div className="modal-content">
//             <h3>Edit Progress</h3>
//             <form onSubmit={handleUpdateProgress}>
//               <div className="form-group">
//                 <label>Current Level</label>
//                 <input type="number" name="currentLevel" value={formData.currentLevel} onChange={handleInputChange} min="1" />
//               </div>
//               <div className="form-group">
//                 <label>Last Workout Performed</label>
//                 <input type="datetime-local" name="lastWorkoutPerformed" value={formData.lastWorkoutPerformed} onChange={handleInputChange} />
//               </div>
//               <div className="form-group">
//                 <label>Status</label>
//                 <select name="status" value={formData.status} onChange={handleInputChange}>
//                   <option value="active">Active</option>
//                   <option value="inactive">Inactive</option>
//                   <option value="in_progress">In Progress</option>
//                 </select>
//               </div>
//               <div className="modal-buttons">
//                 <button type="submit">Update Progress</button>
//                 <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default UserDetailsTable;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Import db from firebase.js
import { getDoc, collection, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore'; // Removed updateDoc and setDoc as they were related to progress
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
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { auth } = await import('../firebase');
                const user = auth.currentUser;
                if (user) {
                    const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
                    console.log('Admin status for', user.uid, ':', adminDoc.exists());
                }
            } catch (err) {
                console.error("Error checking admin status:", err);
            }
        };
        checkAdmin();

        const fetchUserDetailsAndAssignments = async () => {
            setError(null); // Clear previous errors

            // Fetch User Details
            try {
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);
                if (!userDoc.exists()) {
                    setError('User not found.');
                    setUserDetails(null);
                    return;
                }
                setUserDetails(userDoc.data());
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError('Insufficient permissions or error fetching user data.');
                setUserDetails(null);
                return;
            }

            // Fetch Assignments (Workouts, Diet Plans, Tests)
            try {
                // Fetch assigned workouts
                const workoutSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedWorkouts'));
                const assignedWorkouts = workoutSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch assigned diet plans
                const dietPlanSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedDietPlans'));
                const assignedDietPlans = dietPlanSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch assigned tests
                const testSnapshot = await getDocs(collection(db, 'userProgress', userId, 'assignedTests'));
                const assignedTests = testSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Update userDetails state with assignment data
                setUserDetails(prev => ({
                    ...prev, // Keep existing user personal/additional details
                    workouts: assignedWorkouts,
                    dietPlans: assignedDietPlans,
                    tests: assignedTests,
                }));

            } catch (error) {
                console.error('Detailed error fetching assignments:', error.message, error.code);
                setError('Insufficient permissions or error fetching assignment data: ' + error.message);
            }
        };

        // Fetch master lists of workouts, diet plans, and tests for assignment modals
        const fetchMasterData = async () => {
            try {
                const workoutsSnapshot = await getDocs(collection(db, 'workouts'));
                setWorkouts(workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const dietPlansSnapshot = await getDocs(collection(db, 'dietPlans'));
                setDietPlans(dietPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const testsSnapshot = await getDocs(collection(db, 'tests'));
                setTests(testsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching master data:', error);
                setError('Error fetching available workouts, diet plans, or tests.');
            }
        };

        fetchUserDetailsAndAssignments();
        fetchMasterData();
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

        try {
            // Note: This assumes the 'userProgress' document always exists for subcollections
            // If it might not exist, you'd need to create it here with a setDoc call
            await addDoc(collection(db, 'userProgress', userId, 'assignedWorkouts'), {
                workoutId: formData.workoutId,
                level: parseInt(formData.level),
                notes: formData.notes,
                status: formData.status,
                assignedAt: serverTimestamp(),
            });
            setShowWorkoutModal(false);
            setFormData(prev => ({ ...prev, workoutId: '', level: 1, notes: '', status: 'active' }));
            window.location.reload();
        } catch (error) {
            console.error('Error assigning workout:', error);
            setError('Insufficient permissions or error assigning workout.');
        }
    };

    const handleAssignDietPlan = async (e) => {
        e.preventDefault();
        if (!formData.dietPlanId) {
            alert('Please select a diet plan.');
            return;
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
            setFormData(prev => ({ ...prev, dietPlanId: '', level: 1, notes: '', status: 'active' }));
            window.location.reload();
        } catch (error) {
            console.error('Error assigning diet plan:', error);
            setError('Insufficient permissions or error assigning diet plan.');
        }
    };

    const handleAssignTest = async (e) => {
        e.preventDefault();
        if (!formData.testId) {
            alert('Please select a test.');
            return;
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
            setFormData(prev => ({ ...prev, testId: '', level: 1, notes: '', status: 'active' }));
            window.location.reload();
        } catch (error) {
            console.error('Error assigning test:', error);
            setError('Insufficient permissions or error assigning test.');
        }
    };

    if (!userDetails && !error) return <div>Loading user details...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;
    if (!userDetails) return <div>No user data available.</div>;

    return (
        <div className="user-details-container">
            <h2>User Details: {userDetails.name || 'N/A'}</h2>

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
                            <td>{userId || 'N/A'}</td>
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
                                <th>Submitted At</th>
                                <th>Video</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userDetails.tests && userDetails.tests.length > 0 ? (
                                userDetails.tests.map((test, index) => (
                                    <tr key={index}>
                                        <td>{test.testId || 'N/A'}</td>
                                        <td>{test.levelId || 'N/A'}</td>
                                        <td>{test.status || 'N/A'}</td>
                                        <td>{test.submittedAt?.toDate().toLocaleString() || 'N/A'}</td>
                                        <td>
                                            {test.videoUrl ? (
                                                <a href={test.videoUrl} target="_blank" rel="noopener noreferrer">View Video</a>
                                            ) : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No tests assigned</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <button onClick={() => setShowTestModal(true)}>Add Test</button>
                </div>
            )}

            <button onClick={() => navigate('/dashboard')}>Back to Users</button>

            {/* Modals for Adding Workouts, Diet Plans, and Tests */}
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
                                    <option value="submitted">Submitted</option>
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