import { useState, useEffect } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { Calendar, List, MoreHorizontal } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import ActivityCard from "../components/ActivityCard";

// Tabs removed for simpler UI; future filtering options can be added here

export default function Agenda() {
  const [showPast, setShowPast] = useState(false);
  const { user } = useAuth();
  // Tabs removed; only showPast toggle remains
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Get activities where user is a participant or organizer
      // 1. Activities user created
      const { data: organized } = await supabase
        .from("activities")
        .select(`*, organizer:profiles!creator_id(id, full_name, avatar_url)`)
        .eq("creator_id", user.id);

      // 2. Activities user joined (activity_participants)
      const { data: joinedLinks } = await supabase
        .from("activity_participants")
        .select("activity_id")
        .eq("user_id", user.id);

      const joinedIds = (joinedLinks || []).map((a) => a.activity_id);
      let joined = [];
      if (joinedIds.length > 0) {
        const { data: joinedActs } = await supabase
          .from("activities")
          .select(`*, organizer:profiles!creator_id(id, full_name, avatar_url)`)
          .in("id", joinedIds);
        joined = joinedActs || [];
      }

      // Combine and dedupe (in case user is both creator and participant)
      const all = [...(organized || []), ...joined].filter(
        (a, i, arr) => arr.findIndex((b) => b.id === a.id) === i
      );
      setActivities(all);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering: show upcoming or all (if showPast)
  const now = new Date();
  const filtered = activities
    .filter((a) => {
      const date = new Date(a.date_time);
      if (showPast) return true;
      return date >= now;
    })
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  // Group activities by user's local day (YYYY-MM-DD)
  function getLocalDayKey(date) {
    const d = new Date(date);
    // Get local year, month, day
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const dayGroups = {};
  filtered.forEach((activity) => {
    // Always use local time for grouping
    const dayKey = getLocalDayKey(activity.date_time);
    if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
    dayGroups[dayKey].push(activity);
  });

  // Sort day groups ascending
  const sortedDayKeys = Object.keys(dayGroups).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // Find next upcoming activity (closest future start)
  let nextDayKey = null;
  for (const key of sortedDayKeys) {
    const acts = dayGroups[key];
    if (acts.some((a) => new Date(a.date_time) >= now)) {
      nextDayKey = key;
      break;
    }
  }

  // Helper: get day label
  function getDayLabel(dayKey) {
    const d = new Date(dayKey);
    if (isToday(d)) return `Today · ${format(d, "MMM d")}`;
    if (isTomorrow(d)) return `Tomorrow · ${format(d, "MMM d")}`;
    return `${format(d, "EEE")} · ${format(d, "MMM d")}`;
  }

  // Helper: get dot status for a day group
  function getDayDotStatus(acts) {
    if (acts.some((a) => a.creator_id === user.id)) return "host";
    if (acts.some((a) => a.creator_id !== user.id)) return "joined";
    return "neutral";
  }

  // Helper: is day in past
  function isDayPast(dayKey) {
    const d = new Date(dayKey);
    d.setHours(23, 59, 59, 999);
    return d < now;
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Agenda</h1>
      </div>

      {/* Show Past Button only */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setShowPast((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            showPast
              ? "bg-slate-200 border-slate-300 text-slate-700"
              : "bg-white border-gray-200 text-slate-500 hover:bg-gray-50"
          }`}
          title={showPast ? "Hide past activities" : "Show past activities"}
        >
          <MoreHorizontal size={18} />
          {showPast ? "Hide past" : "Show past"}
        </button>
      </div>

      {/* Activities Timeline List - grouped by day */}
      {!loading && (
        <div className="relative">
          {/* Vertical timeline line - lighter, thinner, only spans visible groups */}
          <div className="absolute top-0 left-6 w-0.5 h-full bg-gray-100 z-0" />
          <div className="flex flex-col gap-12">
            {sortedDayKeys.length === 0 && (
              <div className="flex flex-row items-center min-h-28 group">
                <div className="flex flex-col items-center justify-center w-12 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-gray-300 border-4 border-white shadow-md opacity-60" />
                </div>
                <div className="flex-1">
                  <div className="p-6 rounded-lg border border-gray-200 bg-white text-slate-500 text-center shadow-sm">
                    No activities planned
                  </div>
                </div>
              </div>
            )}
            {/* Always render today dot at the top */}
            {(() => {
              const todayKey = getLocalDayKey(now);
              const todayActs =
                dayGroups[todayKey]?.sort(
                  (a, b) => new Date(a.date_time) - new Date(b.date_time)
                ) || [];
              // Today dot: green and larger
              return (
                <div key={todayKey} className="flex flex-row items-start group">
                  {/* Timeline column: dot and line */}
                  <div className="flex flex-col items-center justify-start w-12 relative z-10 pt-2">
                    <div className="rounded-full border-4 border-white shadow-md transition-transform bg-green-500 w-6 h-6" />
                  </div>
                  {/* Card column */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-slate-700">
                        Today · {format(now, "MMM d")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {todayActs.length > 0 ? (
                        todayActs.map((activity) => {
                          const isHost = activity.creator_id === user.id;
                          const joined = !isHost;
                          const isPast = new Date(activity.date_time) < now;
                          return (
                            <div key={activity.id}>
                              <ActivityCard
                                activity={activity}
                                agendaMode={true}
                                isHost={isHost}
                                joined={joined}
                                isPast={isPast}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 rounded-lg border border-gray-200 bg-white text-slate-500 text-center shadow-sm">
                          No activities planned today
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Render all other days except today */}
            {sortedDayKeys
              .filter((dayKey) => dayKey !== getLocalDayKey(now))
              .map((dayKey) => {
                const acts = dayGroups[dayKey].sort(
                  (a, b) => new Date(a.date_time) - new Date(b.date_time)
                );
                const dayPast = isDayPast(dayKey);
                return (
                  <div key={dayKey} className="flex flex-row items-start group">
                    {/* Timeline column: dot and line */}
                    <div className="flex flex-col items-center justify-start w-12 relative z-10 pt-2">
                      <div
                        className={`rounded-full border-4 border-white shadow-md transition-transform bg-coral-500 w-5 h-5 ${
                          dayPast ? "opacity-60" : ""
                        }`}
                      />
                    </div>
                    {/* Card column */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`font-semibold text-lg ${
                            dayPast ? "text-slate-400" : "text-slate-700"
                          }`}
                        >
                          {getDayLabel(dayKey)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {acts.map((activity) => {
                          const isHost = activity.creator_id === user.id;
                          const joined = !isHost;
                          const isPast = new Date(activity.date_time) < now;
                          return (
                            <div
                              key={activity.id}
                              className={dayPast ? "opacity-60" : ""}
                            >
                              <ActivityCard
                                activity={activity}
                                agendaMode={true}
                                isHost={isHost}
                                joined={joined}
                                isPast={isPast}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
