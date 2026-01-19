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
  agendaMode = false,
  isPast = false,
}) {
  const visibilityBadge = getVisibilityBadge(activity.visibility);
  const VisibilityIcon = visibilityBadge.icon;

  // Determine action button/badge
  let action = null;
  if (isHost) {
    action = (
      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold border border-slate-200">
        Host
      </span>
    );
  } else if (joined) {
    action = (
      <div className="flex items-center gap-2">
        <button
          className="border border-coral-500 text-coral-500 bg-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-coral-50 transition-colors cursor-pointer"
          disabled={loading}
        >
          Joined <span className="text-green-500 text-base">✓</span>
        </button>
        <button
          className="text-xs text-slate-400 hover:text-coral-500 underline cursor-pointer"
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
  } else if (!agendaMode) {
    if (currentCount >= capacity) {
      action = (
        <button
          className="bg-slate-200 text-slate-500 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-not-allowed"
          disabled
        >
          Full
        </button>
      );
    } else {
      action = (
        <button
          className="bg-coral-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-coral-600 transition-colors shadow-sm cursor-pointer"
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
  }

  const cardClasses = [
    "bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer",
    isPast ? "opacity-60 grayscale" : "",
  ].join(" ");

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Sport Icon */}
        <div className="w-14 h-14 bg-coral-50 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-coral-100">
          {getSportIcon(activity.sport)}
        </div>

        {/* Activity Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-semibold text-coral-600 uppercase tracking-wide">
              {activity.sport}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${visibilityBadge.color}`}
            >
              <VisibilityIcon size={10} />
              {visibilityBadge.label}
            </span>
          </div>

          <h3 className="font-bold text-lg text-slate-800 mb-3 leading-tight">
            {activity.title}
          </h3>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(activity.date_time)} •{" "}
              {formatTime(activity.date_time)}
              {activity.duration && ` • ${formatDuration(activity.duration)}`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {activity.location}
            </span>
          </div>

          {/* Organizer and Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {activity.organizer?.full_name?.charAt(0) || "?"}
              </div>
              <span className="text-sm text-slate-600 font-medium">
                {activity.organizer?.full_name || "Unknown"}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400 ml-2">
                <Users size={12} />
                {currentCount || 0}/{capacity || "∞"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Participant Avatars */}
              {Array.isArray(activity.participants) &&
                activity.participants.length > 0 && (
                  <div className="flex -space-x-2">
                    {activity.participants.slice(0, 4).map((p) => {
                      const hasName =
                        typeof p.full_name === "string" &&
                        p.full_name.trim().length > 0;
                      return (
                        <div
                          key={p.id}
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 overflow-hidden shadow-sm"
                          title={hasName ? p.full_name : ""}
                        >
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={hasName ? p.full_name : "Participant"}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : hasName ? (
                            p.full_name.charAt(0)
                          ) : (
                            "?"
                          )}
                        </div>
                      );
                    })}
                    {activity.participants.length > 4 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600 shadow-sm">
                        +{activity.participants.length - 4}
                      </div>
                    )}
                  </div>
                )}
              {action}
            </div>
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
  return new Date(dateString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
