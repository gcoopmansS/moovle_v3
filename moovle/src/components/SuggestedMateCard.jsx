import { UserPlus, Loader2, Check } from "lucide-react";

export default function SuggestedMateCard({
  profile,
  reasons = [],
  onAdd,
  requested,
  loading,
  mutualCount,
}) {
  return (
    <div className="flex flex-col items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow max-w-[150px] w-full h-full min-h-[200px] cursor-pointer">
      <div className="flex flex-col items-center w-full">
        <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            profile.full_name?.charAt(0)?.toUpperCase() || "?"
          )}
        </div>
        <div className="text-center w-full">
          <div className="font-semibold text-base text-slate-800 truncate">
            {profile.full_name || "Unknown"}
          </div>
          {profile.city && (
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {profile.city}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 justify-center mt-2 mb-1 w-full">
          {reasons.slice(0, 2).map((reason, i) => (
            <span
              key={i}
              className="bg-teal-50 text-teal-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            >
              {reason}
            </span>
          ))}
          {mutualCount > 0 && (
            <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
              {mutualCount} mutual
            </span>
          )}
        </div>
      </div>
      <div className="w-full mt-2">
        {requested ? (
          <span className="flex items-center justify-center gap-1 text-green-600 font-medium w-full py-1 bg-green-50 rounded-lg text-xs">
            <Check size={14} /> Requested
          </span>
        ) : (
          <button
            onClick={onAdd}
            disabled={loading}
            className="flex items-center justify-center gap-1 w-full px-2 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 font-medium text-xs cursor-pointer"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <UserPlus size={12} />
            )}
            Add Mate
          </button>
        )}
      </div>
    </div>
  );
}
