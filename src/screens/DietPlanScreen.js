import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './DietPlanScreen.css';

function DietPlanScreen() {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState([]);
  const [recipes, setRecipes] = useState([]); // To populate recipe selection
  const [error, setError] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null); // Track which plan's meals are expanded
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch diet plans and recipes from Firestore
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
    setCurrentPage(1); // Reset page on search
  };

  const filteredDietPlans = dietPlans.filter(plan =>
    plan.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
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
    </div>
  );
}

export default DietPlanScreen;