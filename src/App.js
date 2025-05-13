import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterAdminScreen = lazy(() => import('./screens/RegisterAdminScreen'));
const UserScreen = lazy(() => import('./screens/users'));
const AddUserScreen = lazy(() => import('./screens/AddUserScreen'));
const LevelsScreen = lazy(() => import('./screens/LevelsScreen'));
const WorkoutsScreen = lazy(() => import('./screens/workouts'));
const AddWorkoutScreen = lazy(() => import('./screens/AddWorkoutScreen'));
const PopularWorkoutsScreen = lazy(() => import('./screens/PopularWorkoutsScreen'));
const RecipesScreen = lazy(() => import('./screens/RecipesScreen'));
const AddRecipeScreen = lazy(() => import('./screens/AddRecipeScreen'));
const DietPlanScreen = lazy(() => import('./screens/DietPlanScreen'));
const AddDietPlanScreen = lazy(() => import('./screens/AddDietPlanScreen'));
const MealDetailScreen = lazy(() => import('./screens/MealDetailScreen'));
const ExamsScreen = lazy(() => import('./screens/ExamsScreen'));
const WeeklyChallengesScreen = lazy(() => import('./screens/weeklyChallenges'));
const WinnersScreen = lazy(() => import('./screens/winners'));
const ChatScreen = lazy(() => import('./screens/chatScreen'));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/register-admin" element={<RegisterAdminScreen />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-user"
            element={
              <ProtectedRoute>
                <AddUserScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/levels"
            element={
              <ProtectedRoute>
                <LevelsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts"
            element={
              <ProtectedRoute>
                <WorkoutsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workouts/add"
            element={
              <ProtectedRoute>
                <AddWorkoutScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/popular-workouts"
            element={
              <ProtectedRoute>
                <PopularWorkoutsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <RecipesScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/add"
            element={
              <ProtectedRoute>
                <AddRecipeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plan"
            element={
              <ProtectedRoute>
                <DietPlanScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plan/add"
            element={
              <ProtectedRoute>
                <AddDietPlanScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-plan/:mealId"
            element={
              <ProtectedRoute>
                <MealDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weekly-challenges"
            element={
              <ProtectedRoute>
                <WeeklyChallengesScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/winners"
            element={
              <ProtectedRoute>
                <WinnersScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatScreen />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;