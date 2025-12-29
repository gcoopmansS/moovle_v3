import { useState, useEffect } from "react";
import { Calendar, List } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import ActivityCard from "../components/ActivityCard";

const tabs = ["Upcoming", "Past", "Organized"];

export default function Agenda() {
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
      if (activeTab === "Upcoming") return date >= now;
      if (activeTab === "Past") return date < now;
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
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <List size={20} className="text-slate-600" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "calendar" ? "bg-slate-200" : "hover:bg-slate-100"
            }`}
          >
            <Calendar size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activities List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="text-slate-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No activities
          </h3>
          <p className="text-slate-500">
            You haven't joined any {activeTab.toLowerCase()} activities
          </p>
        </div>
      )}
    </div>
  );
}
