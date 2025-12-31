import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Agenda from "./pages/Agenda";
import Mates from "./pages/Mates";
import Notifications from "./pages/Notifications";
import CreateActivity from "./pages/CreateActivity";
import Profile from "./pages/Profile";
import SignupProfile from "./pages/SignupProfile";

function AppRoutes() {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and profile is incomplete, show SignupProfile directly
  if (
    user &&
    (!profile ||
      !profile.city ||
      !profile.favorite_sports ||
      (Array.isArray(profile.favorite_sports) &&
        profile.favorite_sports.length === 0))
  ) {
    return <SignupProfile />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup-profile" element={<SignupProfile />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed" element={<Feed />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="mates" element={<Mates />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="create-activity" element={<CreateActivity />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
