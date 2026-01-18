import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If profile is missing city or favorite_sports, redirect to signup-profile
  if (
    profile &&
    (!profile.city ||
      !profile.favorite_sports ||
      (Array.isArray(profile.favorite_sports) &&
        profile.favorite_sports.length === 0))
  ) {
    return <Navigate to="/signup-profile" replace />;
  }

  return children;
}
