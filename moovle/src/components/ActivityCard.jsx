import { MapPin, Clock, Users, Lock, Globe } from "lucide-react";
import { getSportIcon, formatDuration } from "../config/sports";

export default function ActivityCard({
  activity,
  onClick,
  children,
  joined,
  isHost,
  currentCount,
  capacity,
  loading,
  onJoin,
  onLeave,
}) {
  const visibilityBadge = getVisibilityBadge(activity.visibility);
  const VisibilityIcon = visibilityBadge.icon;

  // Determine action button/badge
  let action = null;
  if (isHost) {
    action = (
      <span className="ml-2 px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
        Host
      </span>
    );
  } else if (joined) {
    action = (
      <div className="flex items-center gap-2 ml-2">
        <button
          className="border border-coral-500 text-coral-500 bg-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1"
          disabled={loading}
        >
          Joined <span className="text-green-500">✓</span>
        </button>
        <button
          className="text-xs text-slate-400 hover:text-coral-500 underline"
          onClick={(e) => {
            e.stopPropagation();
            onLeave();
          }}
          disabled={loading}
        >
          {loading ? "Leaving..." : "Leave"}
        </button>
      </div>
    );
  } else if (currentCount >= capacity) {
    action = (
      <button
        className="ml-2 bg-slate-200 text-slate-400 px-3 py-1 rounded-lg text-sm font-semibold cursor-not-allowed"
        disabled
      >
        Full
      </button>
    );
  } else {
    action = (
      <button
        className="ml-2 bg-coral-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-coral-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onJoin();
        }}
        disabled={loading}
      >
        {loading ? "Joining..." : "Join"}
      </button>
    );
  }

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

          {/* Organizer and Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {activity.organizer?.full_name?.charAt(0) || "?"}
            </div>
            <span className="text-sm text-slate-600">
              {activity.organizer?.full_name || "Unknown"}
            </span>
            <span className="ml-auto flex items-center gap-1 text-sm text-slate-400">
              <Users size={14} />
              {currentCount || 0}/{capacity || "∞"}
              {action}
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
