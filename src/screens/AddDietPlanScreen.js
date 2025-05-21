import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './AddDietPlanScreen.css';

function AddDietPlanScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationDays: '',
    goal: '',
    ageGroup: '',
    gender: '',
    cuisine: '',
    allergies: [],
    intensity: '',
    tags: [],
    meals: [],
  });
  const [recipes, setRecipes] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [mealEntries, setMealEntries] = useState([
    { type: 'Breakfast', recipeId: '' },
    { type: 'Lunch', recipeId: '' },
    { type: 'Dinner', recipeId: '' },
  ]);

  // Fetch recipes for selection
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const recipesSnapshot = await getDocs(collection(db, 'recipes'));
        const recipesList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipesList);
      } catch (err) {
        console.error('Error fetching recipes:', err.message);
        toast.error('Failed to load recipes. Please try again later.', { autoClose: 3000 });
      }
    };
    fetchRecipes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleListChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: values });
  };

  const handleMealChange = (index, value) => {
    const updatedMeals = [...mealEntries];
    updatedMeals[index].recipeId = value;
    setMealEntries(updatedMeals);
  };

  const addDayMeals = () => {
    if (mealEntries.some(meal => !meal.recipeId)) {
      toast.error('Please select a recipe for each meal type before adding the day.', { autoClose: 3000 });
      return;
    }
    setFormData({
      ...formData,
      meals: [...formData.meals, { day: currentDay, meals: mealEntries }],
    });
    setCurrentDay(currentDay + 1);
    setMealEntries([
      { type: 'Breakfast', recipeId: '' },
      { type: 'Lunch', recipeId: '' },
      { type: 'Dinner', recipeId: '' },
    ]);
  };

  const validateForm = () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.durationDays ||
      !formData.goal ||
      !formData.ageGroup ||
      !formData.gender ||
      !formData.cuisine ||
      !formData.intensity ||
      formData.meals.length === 0
    ) {
      toast.error('Please fill in all required fields and add at least one day of meals.', { autoClose: 3000 });
      return false;
    }
    if (formData.meals.length !== parseInt(formData.durationDays)) {
      toast.error('Number of days with meals must match the duration of the diet plan.', { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const dietPlanData = {
        title: formData.title,
        description: formData.description,
        durationDays: parseInt(formData.durationDays) || 0,
        goal: formData.goal,
        ageGroup: formData.ageGroup,
        gender: formData.gender,
        cuisine: formData.cuisine,
        allergies: formData.allergies,
        intensity: formData.intensity,
        tags: formData.tags,
        meals: formData.meals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'dietPlans'), dietPlanData);
      console.log('Diet Plan added to Firestore with ID:', docRef.id);

      toast.success('Diet Plan added successfully!', { autoClose: 3000 });

      // Navigate back to diet plans after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/diet-plan');
      }, 3000);
    } catch (err) {
      console.error('Error adding diet plan:', err.message);
      toast.error('Failed to add diet plan. Please try again later.', { autoClose: 3000 });
    }
  };

  const handleBack = () => navigate('/diet-plan');

  return (
    <div className="add-diet-plan-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="add-diet-plan-section">
          <div className="add-diet-plan-header">
            <div className="information">Add New Diet Plan</div>
            <button className="back-button" onClick={handleBack}>
              Back to Diet Plans
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Diet Plan Information</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Weight Loss Plan"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="A 7-day plan for weight loss."
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input
                  type="number"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleInputChange}
                  placeholder="7"
                  required
                />
              </div>
              <div className="form-group">
                <label>Goal</label>
                <input
                  type="text"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="Weight Loss"
                  required
                />
              </div>
              <div className="form-group">
                <label>Age Group</label>
                <input
                  type="text"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  placeholder="Adults"
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="All"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  placeholder="Mediterranean"
                  required
                />
              </div>
              <div className="form-group">
                <label>Allergies (comma-separated)</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies.join(', ') || ''}
                  onChange={(e) => handleListChange(e, 'allergies')}
                  placeholder="nuts, dairy"
                />
              </div>
              <div className="form-group">
                <label>Intensity</label>
                <select
                  name="intensity"
                  value={formData.intensity}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Intensity</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ') || ''}
                  onChange={(e) => handleListChange(e, 'tags')}
                  placeholder="weight-loss, healthy"
                />
              </div>
              <div className="form-section">
                <h3>Add Daily Meals - Day {currentDay}</h3>
                {mealEntries.map((meal, index) => (
                  <div key={index} className="form-group">
                    <label>{meal.type}</label>
                    <select
                      value={meal.recipeId}
                      onChange={(e) => handleMealChange(index, e.target.value)}
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
                <button
                  type="button"
                  className="add-day-button"
                  onClick={addDayMeals}
                >
                  Add Day {currentDay}
                </button>
              </div>
              {formData.meals.length > 0 && (
                <div className="added-meals">
                  <h3>Added Days</h3>
                  {formData.meals.map(dailyPlan => (
                    <div key={dailyPlan.day} className="daily-plan">
                      <h4>Day {dailyPlan.day}</h4>
                      {dailyPlan.meals.map((meal, idx) => (
                        <p key={idx}>
                          {meal.type}: {recipes.find(r => r.id === meal.recipeId)?.name || 'N/A'}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <div className="form-actions">
                <button type="button" className="back-button" onClick={handleBack}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Diet Plan
                </button>
              </div>
            </div>
          </form>
        </div>
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

export default AddDietPlanScreen;