import { NavLink, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, Bell, Plus, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { navItem, primaryButton } from "./ui/styles";

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
    <aside className="w-64 bg-surface h-screen flex flex-col border-r border-gray-100 fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold">
          <span className="text-brand">M</span>
          <span className="text-heading">oovle</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {/* eslint-disable-next-line no-unused-vars */}
        <NavLink
          to="/app/feed"
          className={({ isActive }) => navItem.getClassName(isActive)}
        >
          <Home size={20} />
          <span className="font-medium">Feed</span>
        </NavLink>
        <NavLink
          to="/app/agenda"
          className={({ isActive }) => navItem.getClassName(isActive)}
        >
          <Calendar size={20} />
          <span className="font-medium">Agenda</span>
        </NavLink>
        <NavLink
          to="/app/mates"
          className={({ isActive }) => navItem.getClassName(isActive)}
        >
          <Users size={20} />
          <span className="font-medium">Mates</span>
        </NavLink>
        {/* Notifications removed from sidebar */}
      </nav>

      {/* New Activity Button */}
      <div className="px-4 mb-6">
        <NavLink
          to="/app/create-activity"
          className={`${primaryButton.className} flex items-center justify-center gap-2 w-full`}
        >
          <Plus size={20} />
          <span className="font-medium">New Activity</span>
        </NavLink>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-100">
        <NavLink
          to="/app/profile"
          className="px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
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
