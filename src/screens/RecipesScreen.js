import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, ref } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './RecipesScreen.css';
import { FaEdit } from "react-icons/fa";

Modal.setAppElement('#root');

function RecipesScreen() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        const recipesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecipes(recipesList);
      } catch (err) {
        console.error('Error fetching recipes:', err.message);
        setError('Failed to load recipes. Please try again later.');
      }
    };
    fetchRecipes();
  }, []);

  const handleAddRecipe = () => {
    navigate('/recipes/add');
  };

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRecipe(null);
  };

  const openEditModal = async (recipe) => {
    setLoading(true);
    try {
      const recipeDoc = await getDoc(doc(db, 'recipes', recipe.id));
      if (recipeDoc.exists()) {
        const recipeData = { id: recipeDoc.id, ...recipeDoc.data() };
        recipeData.tags = Array.isArray(recipeData.tags) ? recipeData.tags : [];
        setEditFormData(recipeData);
      } else {
        setError('Recipe not found.');
      }
    } catch (err) {
      console.error('Error fetching recipe for edit:', err.message);
      setError('Failed to load recipe details.');
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
    if (name.startsWith('macros.')) {
      const macroField = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        macros: { ...prev.macros, [macroField]: value }
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
      let newThumbnailUrl = editFormData.thumbnailUrl;
      if (imageFile) {
        const storageReference = storageRef(storage, `recipes/thumbs/${editFormData.id}/${imageFile.name}`);
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
            newThumbnailUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await updateRecipe(newThumbnailUrl);
          }
        );
      } else {
        await updateRecipe(newThumbnailUrl);
      }
    } catch (err) {
      console.error('Error saving recipe:', err.message);
      setError('Failed to save recipe. Please try again.');
    }
    setLoading(false);
  };

  const updateRecipe = async (newThumbnailUrl) => {
    await updateDoc(doc(db, 'recipes', editFormData.id), {
      name: editFormData.name,
      category: editFormData.category,
      mealType: editFormData.mealType,
      calories: parseInt(editFormData.calories) || 0,
      macros: {
        protein: parseInt(editFormData.macros?.protein) || 0,
        carbs: parseInt(editFormData.macros?.carbs) || 0,
        fat: parseInt(editFormData.macros?.fat) || 0,
      },
      tags: editFormData.tags?.length ? editFormData.tags : [],
      cuisine: editFormData.cuisine,
      ageGroup: editFormData.ageGroup,
      thumbnailUrl: newThumbnailUrl,
    });
    setRecipes(recipes.map(r => r.id === editFormData.id ? { ...editFormData, thumbnailUrl: newThumbnailUrl } : r));
    closeEditModal();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecipes = filteredRecipes.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

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
    <div className="recipes-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="recipes-section">
          <div className="recipes-header">
            <div className="information">Recipes</div>
            <div className="search-add">
              <input
                type="text"
                placeholder="Search by tag..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="add-recipe-button" onClick={handleAddRecipe}>
                Add Recipe
              </button>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          {filteredRecipes.length === 0 ? (
            <p>No recipes found.</p>
          ) : (
            <>
              <table className="recipes-table">
                <thead>
                  <tr>
                    <th>SL</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Meal Type</th>
                    <th>Calories</th>
                    <th>Macros (P/C/F)</th>
                    <th>Tags</th>
                    <th>Cuisine</th>
                    <th>Age Group</th>
                    <th>Thumbnail</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecipes.map((recipe, index) => (
                    <tr key={recipe.id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{recipe.name}</td>
                      <td>{recipe.category || 'N/A'}</td>
                      <td>{recipe.mealType || 'N/A'}</td>
                      <td>{recipe.calories}</td>
                      <td>{recipe.macros ? `${recipe.macros.protein}/${recipe.macros.carbs}/${recipe.macros.fat}` : 'N/A'}</td>
                      <td>{recipe.tags?.join(', ') || 'N/A'}</td>
                      <td>{recipe.cuisine || 'N/A'}</td>
                      <td>{recipe.ageGroup || 'N/A'}</td>
                      <td>
                        {recipe.thumbnailUrl && (
                          <img
                            src={recipe.thumbnailUrl}
                            alt={`${recipe.name} thumbnail`}
                            className="thumbnail-image"
                            onClick={() => openModal(recipe)}
                          />
                        )}
                      </td>
                      <td>
                        <FaEdit onClick={() => openEditModal(recipe)} />
                      </td>
                    </tr>
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
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Recipe Preview"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedRecipe && (
          <div className="modal-content">
            <h2>{selectedRecipe.name}</h2>
            <img
              src={selectedRecipe.thumbnailUrl}
              alt={`${selectedRecipe.name} full image`}
              className="modal-image"
            />
            <button className="close-button" onClick={closeModal}>
              Close
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={editModalOpen}
        onRequestClose={closeEditModal}
        contentLabel="Edit Recipe"
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : editFormData ? (
          <div className="modal-content">
            <h2>Edit Recipe</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Meal Type</label>
                <input
                  type="text"
                  name="mealType"
                  value={editFormData.mealType || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={editFormData.calories || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Macros (Protein)</label>
                <input
                  type="number"
                  name="macros.protein"
                  value={editFormData.macros?.protein || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Macros (Carbs)</label>
                <input
                  type="number"
                  name="macros.carbs"
                  value={editFormData.macros?.carbs || ''}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="form-group">
                <label>Macros (Fat)</label>
                <input
                  type="number"
                  name="macros.fat"
                  value={editFormData.macros?.fat || ''}
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
                <label>Cuisine</label>
                <input
                  type="text"
                  name="cuisine"
                  value={editFormData.cuisine || ''}
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
                <label>Current Thumbnail</label>
                {editFormData.thumbnailUrl && (
                  <img
                    src={editFormData.thumbnailUrl}
                    alt={`${editFormData.name} thumbnail`}
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
          <p>No recipe data available.</p>
        )}
      </Modal>
    </div>
  );
}

export default RecipesScreen;