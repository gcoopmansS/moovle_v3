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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
          >
            <X size={18} className="text-slate-400" />
          </button>

          <div className="flex items-start gap-6 pr-12">
            <div className="w-16 h-16 bg-coral-50 rounded-xl flex items-center justify-center text-2xl border border-coral-100">
              {getSportIcon(activity.sport)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium text-coral-500 uppercase tracking-wider">
                  {activity.sport}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    activity.visibility === "public"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-amber-50 text-amber-600 border border-amber-200"
                  }`}
                >
                  <VisibilityIcon size={10} />
                  {visibilityBadge.label}
                </span>
              </div>
              <h2 className="text-3xl font-light text-slate-900 mb-3 leading-tight">
                {activity.title}
              </h2>
              <div className="flex items-center gap-6 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{formatActivityDate(activity.date_time)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{formatActivityTime(activity.date_time)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>{currentCount || 0} joined</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-6"></div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="px-8 pb-8 space-y-8">
            {/* Essential Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin
                  size={16}
                  className="text-slate-400 mt-1 flex-shrink-0"
                />
                <div>
                  <div className="font-medium text-slate-900 mb-1">
                    {activity.location}
                  </div>
                  {activity.duration && (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock size={14} />
                      {formatDuration(activity.duration)}
                    </div>
                  )}
                </div>
              </div>

              {activity.organizer && (
                <div className="flex items-center gap-4">
                  <User size={16} className="text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">
                    Organized by{" "}
                    <span className="font-medium text-slate-900">
                      {activity.organizer.full_name}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {activity.description && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  About this activity
                </h3>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activity.description}
                  </p>
                </div>
              </div>
            )}

            {/* Activity Details */}
            {(activity.distance ||
              activity.difficulty ||
              activity.equipment) && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activity.distance && (
                    <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-2xl font-light text-slate-900 mb-1">
                        {activity.distance}
                        <span className="text-sm font-normal text-slate-500 ml-1">
                          km
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        Distance
                      </div>
                    </div>
                  )}
                  {activity.difficulty && (
                    <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-lg font-medium text-slate-900 mb-1 capitalize">
                        {activity.difficulty}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        Difficulty
                      </div>
                    </div>
                  )}
                  {activity.equipment && (
                    <div className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-lg font-medium text-slate-900 mb-1">
                        {activity.equipment}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        Equipment
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Participants List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">
                  Who's Going
                </h3>
                <span className="text-sm text-slate-500">
                  {currentCount} {currentCount === 1 ? "person" : "people"}
                </span>
              </div>

              <div className="space-y-3">
                {/* Always show organizer first */}
                {activity.organizer && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-coral-50 border border-coral-100">
                    <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {activity.organizer.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {activity.organizer.full_name}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Organizer
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show other participants */}
                {activity.participants &&
                  activity.participants.length > 0 &&
                  activity.participants
                    .filter(
                      (participant) =>
                        participant.full_name !== activity.organizer?.full_name
                    )
                    .slice(0, 5)
                    .map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-medium text-slate-600 text-sm">
                          {participant.full_name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-slate-900">
                          {participant.full_name}
                        </span>
                      </div>
                    ))}

                {/* Show "more participants" if needed */}
                {activity.participants &&
                  activity.participants.filter(
                    (p) => p.full_name !== activity.organizer?.full_name
                  ).length > 5 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-slate-500">
                        +
                        {activity.participants.filter(
                          (p) => p.full_name !== activity.organizer?.full_name
                        ).length - 5}{" "}
                        more participants
                      </span>
                    </div>
                  )}

                {/* Empty state when only organizer */}
                {(!activity.participants ||
                  activity.participants.length === 0 ||
                  activity.participants.every(
                    (p) => p.full_name === activity.organizer?.full_name
                  )) && (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    {isHost
                      ? "You're the first one! Invite your mates to join."
                      : "Be the first to join this activity!"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-600">
                <span className="font-medium">{currentCount || 0}</span>
                {activity.max_participants && (
                  <> of {activity.max_participants}</>
                )}{" "}
                joined
              </div>

              {/* Minimal capacity indicator */}
              {activity.max_participants && (
                <div className="flex-1 max-w-24">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-coral-500 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((currentCount || 0) / activity.max_participants) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isHost ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium border border-slate-200">
                  Host
                </div>
              ) : joined ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                    <span className="text-green-500">✓</span>
                    Joined
                  </div>
                  <button
                    onClick={onLeave}
                    disabled={loading}
                    className="text-xs text-slate-400 hover:text-coral-500 underline cursor-pointer transition-colors disabled:opacity-50"
                  >
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
                  className="px-6 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Joining...
                    </div>
                  ) : activity.max_participants &&
                    currentCount >= activity.max_participants ? (
                    "Activity Full"
                  ) : (
                    "Join Activity"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
