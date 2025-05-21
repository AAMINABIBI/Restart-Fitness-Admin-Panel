import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './AddRecipeScreen.css';

function AddRecipeScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    thumbnailUrl: '',
    name: '',
    ingredients: [],
    instructions: '',
    category: '',
    mealType: '',
    calories: '',
    macros: { protein: '', carbs: '', fat: '' },
    tags: [],
    allergies: [],
    cuisine: '',
    ageGroup: '',
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'macros.protein' || name === 'macros.carbs' || name === 'macros.fat') {
      const macroField = name.split('.')[1];
      setFormData({
        ...formData,
        macros: { ...formData.macros, [macroField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleListChange = (e, field) => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: values });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
    setFormData({ ...formData, thumbnailUrl: file ? file.name : '' });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview(null);
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.instructions || !formData.category || !formData.mealType || !formData.calories || !thumbnailFile) {
      toast.error('Please fill in all required fields and upload a thumbnail.', { autoClose: 3000 });
      return false;
    }
    if (formData.ingredients.length === 0) {
      toast.error('Please provide at least one ingredient.', { autoClose: 3000 });
      return false;
    }
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedImageTypes.includes(thumbnailFile.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, JPG).', { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Upload thumbnail to Firebase Storage
      const thumbnailRef = ref(storage, `recipes/thumbs/${Date.now()}_${thumbnailFile.name}`);
      await uploadBytes(thumbnailRef, thumbnailFile);
      const thumbnailUrl = await getDownloadURL(thumbnailRef);

      const recipeData = {
        thumbnailUrl,
        name: formData.name,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        category: formData.category,
        mealType: formData.mealType,
        calories: parseInt(formData.calories) || 0,
        macros: {
          protein: parseInt(formData.macros.protein) || 0,
          carbs: parseInt(formData.macros.carbs) || 0,
          fat: parseInt(formData.macros.fat) || 0,
        },
        tags: formData.tags,
        allergies: formData.allergies,
        cuisine: formData.cuisine,
        ageGroup: formData.ageGroup,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add recipe to Firestore
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('Recipe added to Firestore with ID:', docRef.id);

      toast.success('Recipe added successfully!', { autoClose: 3000 });

      // Navigate back to recipes after a short delay to allow toast to be seen
      setTimeout(() => {
        navigate('/recipes');
      }, 3000);
    } catch (err) {
      console.error('Error adding recipe:', err.message);
      toast.error('Failed to add recipe. Please try again later.', { autoClose: 3000 });
    }
  };

  const handleBack = () => navigate('/recipes');

  return (
    <div className="add-recipe-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="add-recipe-section">
          <div className="add-recipe-header">
            <div className="information">Add New Recipe</div>
            <button className="back-button" onClick={handleBack}>
              Back to Recipes
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Recipe Information</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Chicken Salad"
                  required
                />
              </div>
              <div className="form-group">
                <label>Ingredients (comma-separated)</label>
                <input
                  type="text"
                  name="ingredients"
                  value={formData.ingredients.join(', ') || ''}
                  onChange={(e) => handleListChange(e, 'ingredients')}
                  placeholder="chicken, lettuce, tomato"
                  required
                />
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Mix ingredients and serve."
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Healthy"
                  required
                />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <input
                  type="text"
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleInputChange}
                  placeholder="Lunch"
                  required
                />
              </div>
              <div className="form-group">
                <label>Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={formData.calories}
                  onChange={handleInputChange}
                  placeholder="300"
                  required
                />
              </div>
              <div className="form-group">
                <label>Macros (Protein/Carbs/Fat)</label>
                <div className="macros-inputs">
                  <input
                    type="number"
                    name="macros.protein"
                    value={formData.macros.protein}
                    onChange={handleInputChange}
                    placeholder="Protein (g)"
                  />
                  <input
                    type="number"
                    name="macros.carbs"
                    value={formData.macros.carbs}
                    onChange={handleInputChange}
                    placeholder="Carbs (g)"
                  />
                  <input
                    type="number"
                    name="macros.fat"
                    value={formData.macros.fat}
                    onChange={handleInputChange}
                    placeholder="Fat (g)"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ') || ''}
                  onChange={(e) => handleListChange(e, 'tags')}
                  placeholder="healthy, low-carb"
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
                <label>Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  placeholder="Italian"
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
                />
              </div>
              <div className="form-group">
                <label>Thumbnail</label>
                <div className="upload-thumbnail">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleThumbnailChange}
                    style={{ display: 'none' }}
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="upload-thumbnail-label">
                    {formData.thumbnailUrl || 'Upload Thumbnail'}
                  </label>
                </div>
                {thumbnailPreview && (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="thumbnail-image" />
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button type="button" className="back-button" onClick={handleBack}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Recipe
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

export default AddRecipeScreen;