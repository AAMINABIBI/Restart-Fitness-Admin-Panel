const React = require('react');
const { Suspense, lazy } = React;
const { BrowserRouter, Routes, Route } = require('react-router-dom');
const { ToastContainer } = require('react-toastify');
require('react-toastify/dist/ReactToastify.css');
const ProtectedRoute = require('./components/ProtectedRoute');
require('./App.css');

// Lazy-loaded components
const LoginScreen = lazy(() => Promise.resolve().then(() => require('./screens/LoginScreen')));
const RegisterAdminScreen = lazy(() => Promise.resolve().then(() => require('./screens/RegisterAdminScreen')));
const UserScreen = lazy(() => Promise.resolve().then(() => require('./screens/UserScreen')));
const AddUserScreen = lazy(() => Promise.resolve().then(() => require('./screens/AddUserScreen')));
const LevelsScreen = lazy(() => Promise.resolve().then(() => require('./screens/LevelsScreen')));
const LevelBadgesScreen = lazy(() => Promise.resolve().then(() => require('./screens/LevelBadgesScreen')));
const AddWorkoutScreen = lazy(() => Promise.resolve().then(() => require('./screens/AddWorkoutScreen')));
const PopularWorkoutsScreen = lazy(() => Promise.resolve().then(() => require('./screens/PopularWorkoutsScreen')));
const RecipesScreen = lazy(() => Promise.resolve().then(() => require('./screens/RecipesScreen')));
const AddRecipeScreen = lazy(() => Promise.resolve().then(() => require('./screens/AddRecipeScreen')));
const DietPlanScreen = lazy(() => Promise.resolve().then(() => require('./screens/DietPlanScreen')));
const AddDietPlanScreen = lazy(() => Promise.resolve().then(() => require('./screens/AddDietPlanScreen')));
const MealDetailScreen = lazy(() => Promise.resolve().then(() => require('./screens/MealDetailScreen')));
const ExamsScreen = lazy(() => Promise.resolve().then(() => require('./screens/ExamsScreen')));
const ChatScreen = lazy(() => Promise.resolve().then(() => require('./screens/chatScreen')));
const WinnersScreen = lazy(() => Promise.resolve().then(() => require('./screens/winners')));

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
    <BrowserRouter>
      <div className="App">
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
    </BrowserRouter>
  );
}

module.exports = App;