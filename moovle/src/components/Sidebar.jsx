import { NavLink } from "react-router-dom";
import { Home, Calendar, Users, Bell, Plus } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/mates", icon: Users, label: "Mates" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-gray-100">
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
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? "bg-coral-500 text-white"
                  : "text-slate-600 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
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
      <NavLink
        to="/profile"
        className="px-4 py-4 border-t border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold">
          G
        </div>
        <div>
          <p className="font-medium text-slate-800">Gil Coopmans</p>
          <p className="text-sm text-slate-500">gcoopmans@gmail.com</p>
        </div>
      </NavLink>
    </aside>
  );
}
