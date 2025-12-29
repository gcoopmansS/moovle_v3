import { useState, useEffect } from "react";
import { Calendar, List, MoreHorizontal } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import ActivityCard from "../components/ActivityCard";

const tabs = ["Upcoming", "Organized"];

export default function Agenda() {
  const [showPast, setShowPast] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [viewMode, setViewMode] = useState("list");
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

  // Tab filtering
  const now = new Date();
  const filtered = activities
    .filter((a) => {
      const date = new Date(a.date_time);
      if (activeTab === "Upcoming" && !showPast) return date >= now;
      if (activeTab === "Organized") return a.creator_id === user.id;
      return true;
    })
    .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Agenda</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <List size={20} className="text-slate-600" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              viewMode === "calendar" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <Calendar size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Tabs & Show Past Button */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-coral-500 text-white"
                  : "text-slate-600 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Upcoming" && (
          <button
            onClick={() => setShowPast((v) => !v)}
            className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
              showPast
                ? "bg-slate-200 border-slate-300 text-slate-700"
                : "bg-white border-gray-200 text-slate-500 hover:bg-gray-50"
            }`}
            title={showPast ? "Hide past activities" : "Show past activities"}
          >
            <MoreHorizontal size={18} />
            {showPast ? "Hide past" : "Show past"}
          </button>
        )}
      </div>

      {/* Activities Timeline List */}
      {!loading && filtered.length > 0 && (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute top-0 left-6 w-0.5 h-full bg-gray-200 z-0" />
          <div className="flex flex-col gap-12">
            {filtered.map((activity) => {
              const isHost = activity.creator_id === user.id;
              const joined = !isHost;
              const isPast = new Date(activity.date_time) < now;
              return (
                <div
                  key={activity.id}
                  className="flex flex-row items-center min-h-28 group"
                >
                  {/* Timeline column: dot and line */}
                  <div className="flex flex-col items-center justify-center w-12 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-coral-500 border-4 border-white shadow-md group-hover:scale-110 transition-transform" />
                  </div>
                  {/* Card column */}
                  <div className="flex-1">
                    <ActivityCard
                      activity={activity}
                      agendaMode={true}
                      isHost={isHost}
                      joined={joined}
                      isPast={isPast}
                    />
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
