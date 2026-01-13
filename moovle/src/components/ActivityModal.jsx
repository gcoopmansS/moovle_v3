import {
  X,
  MapPin,
  Clock,
  Users,
  Calendar,
  User,
  Globe,
  Lock,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { getSportIcon, formatDuration } from "../config/sports";

export default function ActivityModal({
  activity,
  open,
  onClose,
  joined,
  isHost,
  currentCount,
  onJoin,
  onLeave,
  loading,
}) {
  if (!open || !activity) return null;

  // Format date and time
  const formatActivityDate = (dateTime) => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  const formatActivityTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get visibility badge
  const getVisibilityBadge = (visibility) => {
    switch (visibility) {
      case "public":
        return {
          icon: Globe,
          label: "Public",
          color: "bg-green-100 text-green-700",
        };
      case "invite_only":
        return {
          icon: Lock,
          label: "Invite Only",
          color: "bg-coral-100 text-coral-700",
        };
      default:
        return {
          icon: Globe,
          label: "Public",
          color: "bg-green-100 text-green-700",
        };
    }
  };

  const visibilityBadge = getVisibilityBadge(activity.visibility);
  const VisibilityIcon = visibilityBadge.icon;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-coral-50 rounded-xl flex items-center justify-center text-3xl">
                {getSportIcon(activity.sport)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-coral-500 uppercase">
                    {activity.sport}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${visibilityBadge.color}`}
                  >
                    <VisibilityIcon size={12} />
                    {visibilityBadge.label}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {activity.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                When & Where
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-coral-500" />
                  <span>
                    {formatActivityDate(activity.date_time)} at{" "}
                    {formatActivityTime(activity.date_time)}
                  </span>
                </div>
                {activity.duration && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Clock size={18} className="text-coral-500" />
                    <span>{formatDuration(activity.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={18} className="text-coral-500" />
                  <span>{activity.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Participants
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Users size={18} className="text-coral-500" />
                  <span>
                    {currentCount || 0} / {activity.max_participants || "∞"}{" "}
                    participants
                  </span>
                </div>
                {activity.organizer && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <User size={18} className="text-coral-500" />
                    <span>Organized by {activity.organizer.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
          )}

          {/* Additional Details */}
          {(activity.distance || activity.difficulty || activity.equipment) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activity.distance && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-slate-500 mb-1">Distance</div>
                    <div className="font-medium text-slate-800">
                      {activity.distance} km
                    </div>
                  </div>
                )}
                {activity.difficulty && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-slate-500 mb-1">
                      Difficulty
                    </div>
                    <div className="font-medium text-slate-800 capitalize">
                      {activity.difficulty}
                    </div>
                  </div>
                )}
                {activity.equipment && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-slate-500 mb-1">Equipment</div>
                    <div className="font-medium text-slate-800">
                      {activity.equipment}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Participants List */}
          {activity.participants && activity.participants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Who's Going
              </h3>
              <div className="flex flex-wrap gap-3">
                {activity.participants.slice(0, 8).map((participant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div className="w-6 h-6 bg-coral-100 rounded-full flex items-center justify-center text-xs font-medium text-coral-700">
                      {participant.full_name?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm text-slate-700">
                      {participant.full_name}
                    </span>
                  </div>
                ))}
                {activity.participants.length > 8 && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-slate-500">
                      +{activity.participants.length - 8} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500">
              {currentCount || 0} / {activity.max_participants || "∞"}{" "}
              participants
            </div>

            <div className="flex items-center gap-3">
              {isHost ? (
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium">
                  You're the host
                </span>
              ) : joined ? (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Joined
                  </span>
                  <button
                    onClick={onLeave}
                    disabled={loading}
                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <UserMinus size={16} />
                    {loading ? "Leaving..." : "Leave"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={onJoin}
                  disabled={
                    loading ||
                    (activity.max_participants &&
                      currentCount >= activity.max_participants)
                  }
                  className="px-6 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus size={16} />
                  {loading ? "Joining..." : "Join Activity"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
