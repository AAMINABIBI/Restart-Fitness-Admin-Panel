import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Modal from 'react-modal';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './RecipesScreen.css'; // Ensure your CSS handles pagination

Modal.setAppElement('#root');

function RecipesScreen() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // You can adjust this value

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on new search
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
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
    </div>
  );
}

export default RecipesScreen;