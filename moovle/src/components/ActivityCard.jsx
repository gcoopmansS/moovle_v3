import { MapPin, Clock, Users, Lock, Globe } from "lucide-react";
import { getSportIcon, formatDuration } from "../config/sports";

export default function ActivityCard({ activity, onClick, children }) {
  // Accepts activity object, optional onClick handler, and children for extra actions
  const visibilityBadge = getVisibilityBadge(activity.visibility);
  const VisibilityIcon = visibilityBadge.icon;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Sport Icon */}
        <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
          {getSportIcon(activity.sport)}
        </div>

        {/* Activity Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium text-coral-500 uppercase">
              {activity.sport}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {formatDate(activity.date_time)}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${visibilityBadge.color}`}
            >
              <VisibilityIcon size={10} />
              {visibilityBadge.label}
            </span>
          </div>

          <h3 className="font-semibold text-slate-800 mb-2 truncate">
            {activity.title}
          </h3>

          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatTime(activity.date_time)}
              {activity.duration && ` • ${formatDuration(activity.duration)}`}
              {activity.distance && ` • ${activity.distance} km`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {activity.location}
            </span>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {activity.organizer?.full_name?.charAt(0) || "?"}
            </div>
            <span className="text-sm text-slate-600">
              {activity.organizer?.full_name || "Unknown"}
            </span>
            <span className="ml-auto flex items-center gap-1 text-sm text-slate-400">
              <Users size={14} />
              {activity.current_participants || 0}/
              {activity.max_participants || "∞"}
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Helper functions (copied from Feed.jsx)
function getVisibilityBadge(visibility) {
  switch (visibility) {
    case "invite_only":
      return {
        label: "Invite Only",
        icon: Lock,
        color: "bg-amber-100 text-amber-700",
      };
    case "mates":
      return {
        label: "Mates",
        icon: Users,
        color: "bg-blue-100 text-blue-700",
      };
    default:
      return {
        label: "Public",
        icon: Globe,
        color: "bg-green-100 text-green-700",
      };
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
