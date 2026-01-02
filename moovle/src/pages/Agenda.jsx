import { useState, useEffect } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import ActivityCard from "../components/ActivityCard";

import Modal from "../components/Modal";

export default function Agenda() {
  const [showPast, setShowPast] = useState(false);
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]); // [activityId]
  const [joining, setJoining] = useState({}); // { [activityId]: boolean }
  const [participantCounts, setParticipantCounts] = useState({}); // { [activityId]: count }
  const [loading, setLoading] = useState(true);

  // Modal state for leave confirmation
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [activityToLeave, setActivityToLeave] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch participant counts for all activities
  useEffect(() => {
    if (activities.length === 0) return;
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("activity_participants")
        .select("activity_id, user_id")
        .in(
          "activity_id",
          activities.map((a) => a.id)
        );
      if (!error && data) {
        // Aggregate counts in JS
        const counts = {};
        data.forEach((row) => {
          counts[row.activity_id] = (counts[row.activity_id] || 0) + 1;
        });
        setParticipantCounts(counts);
      }
    };
    fetchCounts();
  }, [activities]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Fetch activities organized by the user
      const { data: organized } = await supabase
        .from("activities")
        .select(
          `*, organizer:profiles!creator_id(id, full_name, avatar_url), participants:activity_participants(user_id, profiles(id, full_name, avatar_url))`
        )
        .eq("creator_id", user.id);

      // Fetch activities joined by the user
      const { data: joinedLinks } = await supabase
        .from("activity_participants")
        .select("activity_id")
        .eq("user_id", user.id);

      const joinedIds = (joinedLinks || []).map((a) => a.activity_id);
      setJoinedIds(joinedIds);
      let joined = [];
      if (joinedIds.length > 0) {
        const { data: joinedActs } = await supabase
          .from("activities")
          .select(
            `*, organizer:profiles!creator_id(id, full_name, avatar_url), participants:activity_participants(user_id, profiles(id, full_name, avatar_url))`
          )
          .in("id", joinedIds);
        joined = joinedActs || [];
      }

      // Merge and deduplicate activities
      const all = [...(organized || []), ...joined].filter(
        (a, i, arr) => arr.findIndex((b) => b.id === a.id) === i
      );

      // Map participants to flat array of {id, full_name, avatar_url}, always include organizer
      const activitiesWithParticipants = (all || []).map((activity) => {
        let participants = [];
        if (Array.isArray(activity.participants)) {
          participants = activity.participants
            .map((p) => p.profiles || p)
            .filter((p) => p && p.full_name && p.full_name.trim().length > 0);
        }
        if (
          activity.organizer &&
          typeof activity.organizer.full_name === "string" &&
          activity.organizer.full_name.trim().length > 0
        ) {
          const alreadyIncluded = participants.some(
            (p) => p.id === activity.organizer.id
          );
          if (!alreadyIncluded) {
            participants = [activity.organizer, ...participants];
          }
        }
        return { ...activity, participants };
      });
      setActivities(activitiesWithParticipants);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic leave handler (moved outside fetchActivities)
  const handleLeave = async (activity) => {
    if (!user) return;
    setJoining((j) => ({ ...j, [activity.id]: true }));
    // Optimistically update local state
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              participants: a.participants
                ? a.participants.filter((p) => p.id !== user.id)
                : [],
            }
          : a
      )
    );
    setParticipantCounts((prev) => ({
      ...prev,
      [activity.id]: Math.max((prev[activity.id] || 1) - 1, 0),
    }));
    setJoinedIds((ids) => ids.filter((id) => id !== activity.id));
    // Make the API call
    const { error } = await supabase
      .from("activity_participants")
      .delete()
      .eq("activity_id", activity.id)
      .eq("user_id", user.id);
    if (error) {
      // Rollback on error
      await fetchActivities();
    }
    setJoining((j) => ({ ...j, [activity.id]: false }));
  };

  const now = new Date();
  const filtered = activities
    .filter((a) => {
      const date = new Date(a.date_time);
      if (showPast) return true;
      return date >= now;
    })
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  function getLocalDayKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const dayGroups = {};
  filtered.forEach((activity) => {
    const dayKey = getLocalDayKey(activity.date_time);
    if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
    dayGroups[dayKey].push(activity);
  });

  const sortedDayKeys = Object.keys(dayGroups).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  function getDayLabel(dayKey) {
    const d = new Date(dayKey);
    if (isToday(d)) return `Today · ${format(d, "MMM d")}`;
    if (isTomorrow(d)) return `Tomorrow · ${format(d, "MMM d")}`;
    return `${format(d, "EEE")} · ${format(d, "MMM d")}`;
  }

  function renderEmptyState() {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] py-12">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-coral-500 border-4 border-white shadow-md flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">+</span>
          </div>
        </div>
        <div className="text-2xl font-semibold text-slate-700 mb-3 text-center">
          No activities yet
        </div>
        <div className="text-slate-500 mb-8 text-center">
          Start by creating your first activity or join one from the feed!
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => (window.location.href = "/create-activity")}
            className="px-6 py-3 rounded-full bg-coral-500 text-white font-semibold shadow hover:bg-coral-600 transition-colors cursor-pointer"
          >
            + New Activity
          </button>
          <button
            onClick={() => (window.location.href = "/feed")}
            className="px-6 py-3 rounded-full bg-white border border-coral-500 text-coral-500 font-semibold shadow hover:bg-coral-50 transition-colors cursor-pointer"
          >
            Find one to join
          </button>
        </div>
      </div>
    );
  }

  function renderOnlyPastState() {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] py-12">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-coral-500 border-4 border-white shadow-md flex items-center justify-center mx-auto">
            <span className="text-white text-3xl">+</span>
          </div>
        </div>
        <div className="text-2xl font-semibold text-slate-700 mb-3 text-center">
          No upcoming activities
        </div>
        <div className="text-slate-500 mb-8 text-center">
          You have no activities planned. Create a new one or join an activity
          from the feed!
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => (window.location.href = "/create-activity")}
            className="px-6 py-3 rounded-full bg-coral-500 text-white font-semibold shadow hover:bg-coral-600 transition-colors cursor-pointer"
          >
            + New Activity
          </button>
          <button
            onClick={() => (window.location.href = "/feed")}
            className="px-6 py-3 rounded-full bg-white border border-coral-500 text-coral-500 font-semibold shadow hover:bg-coral-50 transition-colors cursor-pointer"
          >
            Find one to join
          </button>
        </div>
      </div>
    );
  }

  function renderTimeline() {
    const todayKey = getLocalDayKey(now);
    const pastDayKeys = sortedDayKeys
      .filter((dayKey) => dayKey < todayKey)
      .sort((a, b) => new Date(b) - new Date(a));
    const futureDayKeys = sortedDayKeys
      .filter((dayKey) => dayKey > todayKey)
      .sort((a, b) => new Date(a) - new Date(b));

    return (
      <div className="relative">
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
          {/* Past days above today */}
          {showPast &&
            pastDayKeys.map((dayKey) => {
              const acts = dayGroups[dayKey].sort(
                (a, b) => new Date(a.date_time) - new Date(b.date_time)
              );
              return (
                <div key={dayKey} className="flex flex-row items-start group">
                  <div className="flex flex-col items-center justify-start w-12 relative z-10 pt-2">
                    <div className="rounded-full border-4 border-white shadow-md transition-transform bg-coral-500 w-5 h-5 opacity-60" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-slate-400">
                        {getDayLabel(dayKey)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4">
                      {acts.map((activity) => {
                        const isHost = activity.creator_id === user.id;
                        const joined = joinedIds.includes(activity.id);
                        const isPast = new Date(activity.date_time) < now;
                        return (
                          <div key={activity.id} className="opacity-60">
                            <ActivityCard
                              activity={activity}
                              agendaMode={true}
                              isHost={isHost}
                              joined={joined}
                              isPast={isPast}
                              loading={joining[activity.id]}
                              onLeave={() => {
                                setLeaveModalOpen(true);
                                setActivityToLeave(activity);
                              }}
                              currentCount={
                                (participantCounts[activity.id] || 0) + 1
                              }
                              capacity={
                                activity.max_participants ||
                                activity.capacity ||
                                "∞"
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          {/* Today */}
          {(() => {
            const todayActs =
              dayGroups[todayKey]?.sort(
                (a, b) => new Date(a.date_time) - new Date(b.date_time)
              ) || [];
            return (
              <div key={todayKey} className="flex flex-row items-start group">
                <div className="flex flex-col items-center justify-start w-12 relative z-10 pt-2">
                  <div className="rounded-full border-4 border-white shadow-md transition-transform bg-green-500 w-6 h-6" />
                </div>
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
                        const joined = joinedIds.includes(activity.id);
                        const isPast = new Date(activity.date_time) < now;
                        return (
                          <div key={activity.id}>
                            <ActivityCard
                              activity={activity}
                              agendaMode={true}
                              isHost={isHost}
                              joined={joined}
                              isPast={isPast}
                              loading={joining[activity.id]}
                              onLeave={() => {
                                setLeaveModalOpen(true);
                                setActivityToLeave(activity);
                              }}
                              currentCount={
                                (participantCounts[activity.id] || 0) + 1
                              }
                              capacity={
                                activity.max_participants ||
                                activity.capacity ||
                                "∞"
                              }
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 rounded-xl border border-gray-100 bg-white text-slate-500 text-center">
                        No activities planned today
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Future days below today */}
          {futureDayKeys.map((dayKey) => {
            const acts = dayGroups[dayKey].sort(
              (a, b) => new Date(a.date_time) - new Date(b.date_time)
            );
            return (
              <div key={dayKey} className="flex flex-row items-start group">
                <div className="flex flex-col items-center justify-start w-12 relative z-10 pt-2">
                  <div className="rounded-full border-4 border-white shadow-md transition-transform bg-coral-500 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg text-slate-700">
                      {getDayLabel(dayKey)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {acts.map((activity) => {
                      const isHost = activity.creator_id === user.id;
                      const joined = joinedIds.includes(activity.id);
                      const isPast = new Date(activity.date_time) < now;
                      return (
                        <div key={activity.id}>
                          <ActivityCard
                            activity={activity}
                            agendaMode={true}
                            isHost={isHost}
                            joined={joined}
                            isPast={isPast}
                            loading={joining[activity.id]}
                            onLeave={() => {
                              setLeaveModalOpen(true);
                              setActivityToLeave(activity);
                            }}
                            currentCount={
                              (participantCounts[activity.id] || 0) + 1
                            }
                            capacity={
                              activity.max_participants ||
                              activity.capacity ||
                              "∞"
                            }
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
    );
  }

  // Main render
  const hasUpcoming = activities.some((a) => new Date(a.date_time) >= now);
  const hasPast = activities.some((a) => new Date(a.date_time) < now);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Agenda</h1>
      </div>
      {activities.length > 0 && hasPast && (
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setShowPast((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              showPast
                ? "bg-slate-200 border-slate-300 text-slate-700 cursor-pointer"
                : "bg-white border-gray-200 text-slate-500 hover:bg-gray-50 cursor-pointer"
            }`}
            title={showPast ? "Hide past activities" : "Show past activities"}
          >
            <MoreHorizontal size={18} />
            {showPast ? "Hide past" : "Show past"}
          </button>
        </div>
      )}
      {/* Leave Confirmation Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setActivityToLeave(null);
        }}
        title="Leave Activity?"
        confirmLabel="Leave"
        loading={activityToLeave ? joining[activityToLeave.id] : false}
        onConfirm={async () => {
          if (activityToLeave) {
            await handleLeave(activityToLeave);
            setLeaveModalOpen(false);
            setActivityToLeave(null);
          }
        }}
      >
        Are you sure you want to leave this activity?
      </Modal>
      {!loading &&
        (activities.length === 0
          ? renderEmptyState()
          : !hasUpcoming && hasPast && !showPast
          ? renderOnlyPastState()
          : renderTimeline())}
    </div>
  );
}
