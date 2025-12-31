import { NavLink, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, Bell, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-100 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          <span className="text-coral-500">M</span>
          <span className="text-slate-800">oovle</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {/* eslint-disable-next-line no-unused-vars */}
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              isActive
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-50"
            }`
          }
        >
          {/* Feed icon here */}
          <span className="font-medium">Feed</span>
        </NavLink>
        <NavLink
          to="/agenda"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              isActive
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-50"
            }`
          }
        >
          {/* Agenda icon here */}
          <span className="font-medium">Agenda</span>
        </NavLink>
        <NavLink
          to="/mates"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              isActive
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-50"
            }`
          }
        >
          {/* Mates icon here */}
          <span className="font-medium">Mates</span>
        </NavLink>
        {/* Notifications removed from sidebar */}
      </nav>

      {/* New Activity Button */}
      <div className="px-4 mb-6">
        <NavLink
          to="/create-activity"
          className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">New Activity</span>
        </NavLink>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100">
        <NavLink
          to="/profile"
          className="px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold">
            {getInitial()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-sm text-slate-500 truncate">{profile?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 flex items-center gap-3 text-slate-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
