import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, ref } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './DietPlanScreen.css';
import { FaEdit } from "react-icons/fa";

Modal.setAppElement('#root');

function DietPlanScreen() {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [recipes, setRecipes] = useState([]); // To populate recipe selection
  const [error, setError] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null); // Track which plan's meals are expanded
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        const dietPlansSnapshot = await getDocs(collection(db, 'dietPlans'));
        const dietPlansList = dietPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDietPlans(dietPlansList);
      } catch (err) {
        console.error('Error fetching diet plans:', err.message);
        setError('Failed to load diet plans. Please try again later.');
      }
    };

    const fetchRecipes = async () => {
      try {
        const recipesSnapshot = await getDocs(collection(db, 'recipes'));
        const recipesList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipesList);
      } catch (err) {
        console.error('Error fetching recipes:', err.message);
        setError('Failed to load recipes. Please try again later.');
      }
    };

    fetchDietPlans();
    fetchRecipes();
  }, []);

  const handleAddDietPlan = () => {
    navigate('/diet-plan/add');
  };

  const toggleMeals = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openEditModal = async (plan) => {
    setLoading(true);
    try {
      const planDoc = await getDoc(doc(db, 'dietPlans', plan.id));
      if (planDoc.exists()) {
        const planData = { id: planDoc.id, ...planDoc.data() };
        planData.tags = Array.isArray(planData.tags) ? planData.tags : [];
        planData.meals = planData.meals || []; // Ensure meals is an array
        setEditFormData(planData);
      } else {
        setError('Diet plan not found.');
      }
    } catch (err) {
      console.error('Error fetching diet plan for edit:', err.message);
      setError('Failed to load diet plan details.');
    }
    setLoading(false);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditFormData(null);
    setImageFile(null);
    setUploadProgress(0);
    setError(null);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tags') {
      setEditFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(tag => tag.trim())
      }));
    } else if (name.startsWith('meals')) {
      const [_, dayIdx, mealIdx, field] = name.split('-');
      const newMeals = [...editFormData.meals];
      if (!newMeals[dayIdx]) newMeals[dayIdx] = { day: parseInt(dayIdx) + 1, meals: [] };
      if (!newMeals[dayIdx].meals[mealIdx]) newMeals[dayIdx].meals[mealIdx] = { type: '', recipeId: '' };
      newMeals[dayIdx].meals[mealIdx] = { ...newMeals[dayIdx].meals[mealIdx], [field]: value };
      setEditFormData(prev => ({
        ...prev,
        meals: newMeals
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB.');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;

    setLoading(true);
    try {
      let newThumbnailURL = editFormData.thumbnailURL || '';
      if (imageFile) {
        const storageReference = storageRef(storage, `dietPlans/thumbs/${editFormData.id}/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageReference, imageFile);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload failed:', error.message);
            setError('Failed to upload image.');
          },
          async () => {
            newThumbnailURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDietPlan(newThumbnailURL);
          }
        );
        await uploadTask; // Wait for upload to complete
      } else {
        await updateDietPlan(newThumbnailURL);
      }
    } catch (err) {
      console.error('Error saving diet plan:', err.message);
      setError('Failed to save diet plan. Please try again.');
    }
    setLoading(false);
  };

  const updateDietPlan = async (newThumbnailURL) => {
    await updateDoc(doc(db, 'dietPlans', editFormData.id), {
      title: editFormData.title,
      durationDays: parseInt(editFormData.durationDays) || 0,
      goal: editFormData.goal,
      ageGroup: editFormData.ageGroup,
      gender: editFormData.gender,
      cuisine: editFormData.cuisine,
      intensity: editFormData.intensity,
      tags: editFormData.tags,
      meals: editFormData.meals,
      thumbnailURL: newThumbnailURL,
    });
    setDietPlans(dietPlans.map(p => p.id === editFormData.id ? { ...editFormData, thumbnailURL: newThumbnailURL } : p));
    closeEditModal();
  };

  const filteredDietPlans = dietPlans.filter(plan =>
    plan.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDietPlans = filteredDietPlans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDietPlans.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="diet-plan-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="diet-plan-section">
          <div className="diet-plan-header">
            <div className="information">Diet Plans</div>
            <div className="search-add">
              <input
                type="text"
                placeholder="Search by tag..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-diet-plan-button" onClick={handleAddDietPlan}>
                Add Diet Plan
              </button>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          {filteredDietPlans.length === 0 ? (
            <p>No diet plans found.</p>
          ) : (
            <>
              <table className="diet-plans-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Title</th>
                    <th>Duration (Days)</th>
                    <th>Goal</th>
                    <th>Age Group</th>
                    <th>Gender</th>
                    <th>Cuisine</th>
                    <th>Intensity</th>
                    <th>Tags</th>
                    <th>Meals</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDietPlans.map((plan, index) => (
                    <React.Fragment key={plan.id}>
                      <tr>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{plan.title}</td>
                        <td>{plan.durationDays}</td>
                        <td>{plan.goal || 'N/A'}</td>
                        <td>{plan.ageGroup || 'N/A'}</td>
                        <td>{plan.gender || 'N/A'}</td>
                        <td>{plan.cuisine || 'N/A'}</td>
                        <td>{plan.intensity || 'N/A'}</td>
                        <td>{plan.tags?.join(', ') || 'N/A'}</td>
                        <td>
                          <button
                            className="view-meals-button"
                            onClick={() => toggleMeals(plan.id)}
                          >
                            {expandedPlan === plan.id ? 'Hide Meals' : 'View Meals'}
                          </button>
                        </td>
                        <td>
                          <FaEdit onClick={() => openEditModal(plan)} />
                        </td>
                      </tr>
                      {expandedPlan === plan.id && (
                        <tr>
                          <td colSpan="10">
                            <div className="meals-dropdown">
                              {plan.meals.map(dailyPlan => (
                                <div key={dailyPlan.day} className="daily-plan">
                                  <h4>Day {dailyPlan.day}</h4>
                                  {dailyPlan.meals.map((meal, idx) => (
                                    <div key={idx} className="meal-entry">
                                      <h5>{meal.type}</h5>
                                      <p>
                                        {recipes.find(recipe => recipe.id === meal.recipeId)?.name || 'No recipe selected'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">
                  {renderPageNumbers()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Diet Plan"
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : editFormData ? (
          <div className="modal-content">
            <h2>Edit Diet Plan</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input
                  type="number"
                  name="durationDays"
                  value={editFormData.durationDays || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Goal</label>
                <input
                  type="text"
                  name="goal"
                  value={editFormData.goal || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Age Group</label>
                <input
                  type="text"
                  name="ageGroup"
                  value={editFormData.ageGroup || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={editFormData.gender || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={editFormData.cuisine || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Intensity</label>
                <input
                  type="text"
                  name="intensity"
                  value={editFormData.intensity || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={editFormData.tags?.join(', ') || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Meals</label>
                {editFormData.meals.map((dailyPlan, dayIdx) => (
                  <div key={dayIdx} className="daily-meal-group">
                    <h4>Day {dailyPlan.day}</h4>
                    {dailyPlan.meals.map((meal, mealIdx) => (
                      <div key={mealIdx} className="meal-input-group">
                        <label>{`Meal ${mealIdx + 1} Type`}</label>
                        <input
                          type="text"
                          name={`meals-${dayIdx}-${mealIdx}-type`}
                          value={meal.type || ''}
                          onChange={handleEditInputChange}
                        />
                        <label>{`Meal ${mealIdx + 1} Recipe`}</label>
                        <select
                          name={`meals-${dayIdx}-${mealIdx}-recipeId`}
                          value={meal.recipeId || ''}
                          onChange={handleEditInputChange}
                        >
                          <option value="">Select Recipe</option>
                          {recipes.map(recipe => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Current Thumbnail</label>
                {editFormData.thumbnailURL && (
                  <img
                    src={editFormData.thumbnailURL}
                    alt={`${editFormData.title} thumbnail`}
                    className="thumbnail-image"
                    style={{ maxWidth: '200px', marginBottom: '10px' }}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Upload New Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
                      {uploadProgress.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleSaveEdit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={closeEditModal} disabled={loading}>
                Cancel
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <p>No diet plan data available.</p>
        )}
      </Modal>
    </div>
  );
}

export default DietPlanScreen;