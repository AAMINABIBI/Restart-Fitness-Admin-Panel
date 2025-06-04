import React, { Suspense, lazy, Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Error Boundary Class
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded components
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterAdminScreen = lazy(() => import('./screens/RegisterAdminScreen'));
const UserScreen = lazy(() => import('./screens/UserScreen'));
const AddUserScreen = lazy(() => import('./screens/AddUserScreen'));
const LevelsScreen = lazy(() => import('./screens/LevelsScreen'));
const LevelBadgesScreen = lazy(() => import('./screens/LevelBadgesScreen'));
const AddWorkoutScreen = lazy(() => import('./screens/AddWorkoutScreen'));
const PopularWorkoutsScreen = lazy(() => import('./screens/PopularWorkoutsScreen'));
const RecipesScreen = lazy(() => import('./screens/RecipesScreen'));
const AddRecipeScreen = lazy(() => import('./screens/AddRecipeScreen'));
const DietPlanScreen = lazy(() => import('./screens/DietPlanScreen'));
const AddDietPlanScreen = lazy(() => import('./screens/AddDietPlanScreen'));
const MealDetailScreen = lazy(() => import('./screens/MealDetailScreen'));
const ExamsScreen = lazy(() => import('./screens/ExamsScreen'));
const ChatScreen = lazy(() => import('./screens/chatScreen'));
const WinnersScreen = lazy(() => import('./screens/winners'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function App() {
  console.log({
    LoginScreen,
    RegisterAdminScreen,
    UserScreen,
    ProtectedRoute,
    LevelsScreen,
    LevelBadgesScreen,
    ExamsScreen,
  });
  return (
    <div className="App">
      <ErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/register-admin" element={<RegisterAdminScreen />} />
            <Route path="/dashboard" element={<ProtectedRoute><UserScreen /></ProtectedRoute>} />
            <Route path="/add-user" element={<ProtectedRoute><AddUserScreen /></ProtectedRoute>} />
            <Route path="/levels" element={<ProtectedRoute><LevelsScreen /></ProtectedRoute>} />
            <Route path="/level-badges" element={<ProtectedRoute><LevelBadgesScreen /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><AddWorkoutScreen /></ProtectedRoute>} />
            <Route path="/workouts/add" element={<ProtectedRoute><AddWorkoutScreen /></ProtectedRoute>} />
            <Route path="/popular-workouts" element={<ProtectedRoute><PopularWorkoutsScreen /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><RecipesScreen /></ProtectedRoute>} />
            <Route path="/recipes/add" element={<ProtectedRoute><AddRecipeScreen /></ProtectedRoute>} />
            <Route path="/diet-plan" element={<ProtectedRoute><DietPlanScreen /></ProtectedRoute>} />
            <Route path="/diet-plan/add" element={<ProtectedRoute><AddDietPlanScreen /></ProtectedRoute>} />
            <Route path="/diet-plan/:mealId" element={<ProtectedRoute><MealDetailScreen /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><ExamsScreen /></ProtectedRoute>} />
            <Route path="/weekly-challenges" element={<ProtectedRoute><div>Weekly Challenges (Component Missing)</div></ProtectedRoute>} />
            <Route path="/winners" element={<ProtectedRoute><WinnersScreen /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
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

export default App;