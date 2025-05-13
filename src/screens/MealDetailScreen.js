import React from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './MealDetailScreen.css';

function MealDetailScreen() {
  const { mealId } = useParams();

  // Static data for meals (for demo purposes)
  const meals = [
    {
      id: 1,
      name: 'Meal 1',
      title: 'Delights with Greek yogurt',
      time: '8:00am - 9:00 am',
      calories: 150,
      ingredients: ['', '', ''],
      preparation:
        'Sed earum sequi est magnam doloremque aut porro dolores sit molestiae fuga. Et rerum inventore ut perspiciatis dolorum sed internos porro aut labore dolorem At quia reiciendis in consequuntur possimus.',
      image: null, // Placeholder for image
    },
    {
      id: 2,
      name: 'Meal 2',
      title: 'Delights with Greek yogurt',
      time: '8:00am - 9:00 am',
      calories: 150,
      ingredients: ['', '', ''],
      preparation:
        'Sed earum sequi est magnam doloremque aut porro dolores sit molestiae fuga. Et rerum inventore ut perspiciatis dolorum sed internos porro aut labore dolorem At quia reiciendis in consequuntur possimus.',
      image: null, // Placeholder for image
    },
    {
      id: 3,
      name: 'Meal 3',
      time: '8:00am - 9:00 am',
      calories: 150,
      ingredients: ['', '', ''],
      preparation:
        'Sed earum sequi est magnam doloremque aut porro dolores sit molestiae fuga. Et rerum inventore ut perspiciatis dolorum sed internos porro aut labore dolorem At quia reiciendis in consequuntur possimus.',
      image: null,
    },
    {
      id: 4,
      name: 'Meal 4',
      time: '8:00am - 9:00 am',
      calories: 150,
      ingredients: ['', '', ''],
      preparation:
        'Sed earum sequi est magnam doloremque aut porro dolores sit molestiae fuga. Et rerum inventore ut perspiciatis dolorum sed internos porro aut labore dolorem At quia reiciendis in consequuntur possimus.',
      image: null,
    },
    {
      id: 5,
      name: 'Meal 5',
      time: '8:00am - 9:00 am',
      calories: 150,
      ingredients: ['', '', ''],
      preparation:
        'Sed earum sequi est magnam doloremque aut porro dolores sit molestiae fuga. Et rerum inventore ut perspiciatis dolorum sed internos porro aut labore dolorem At quia reiciendis in consequuntur possimus.',
      image: null,
    },
  ];

  const meal = meals.find((m) => m.id === parseInt(mealId));

  if (!meal) {
    return <div>Meal not found</div>;
  }

  return (
    <div className="meal-detail-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="meal-detail-section">
          <div className="meal-detail-header">
            <h2>Diet Plan</h2>
            <button className="add-more-button">+ Add More Menu</button>
          </div>
          <div className="meal-details-grid">
            <div className="meal-detail-card">
              <div className="meal-image-placeholder">
                <span>Upload Image</span>
              </div>
              <div className="meal-info">
                <h3>{meal.name}</h3>
                <div className="meal-title">{meal.title}</div>
                <div className="meal-time">
                  <span>Time</span>
                  <p>{meal.time}</p>
                </div>
                <div className="meal-calories">
                  <span>Calories</span>
                  <p>{meal.calories}</p>
                </div>
                <div className="meal-ingredients">
                  <span>Ingredients</span>
                  <ul>
                    {meal.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient || ' '}</li>
                    ))}
                  </ul>
                </div>
                <div className="meal-preparation">
                  <span>Preparation</span>
                  <p>{meal.preparation}</p>
                </div>
              </div>
            </div>
            <div className="meal-detail-card">
              <div className="meal-image-placeholder">
                <span>Upload Image</span>
              </div>
              <div className="meal-info">
                <h3>{meal.name}</h3>
                <div className="meal-title">{meal.title}</div>
                <div className="meal-time">
                  <span>Time</span>
                  <p>{meal.time}</p>
                </div>
                <div className="meal-calories">
                  <span>Calories</span>
                  <p>{meal.calories}</p>
                </div>
                <div className="meal-ingredients">
                  <span>Ingredients</span>
                  <ul>
                    {meal.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient || ' '}</li>
                    ))}
                  </ul>
                </div>
                <div className="meal-preparation">
                  <span>Preparation</span>
                  <p>{meal.preparation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDetailScreen;