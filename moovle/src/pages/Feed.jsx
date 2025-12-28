import { useState, useEffect } from "react";
import { Search, Plus, MapPin, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const dateFilters = ["All", "Today", "Tomorrow", "This Week"];
const sportFilters = [
  { id: "all", label: "All Sports", icon: null, color: "coral" },
  { id: "tennis", label: "Tennis", icon: "🎾", color: null },
  { id: "padel", label: "Padel", icon: "🎾", color: null },
  { id: "running", label: "Running", icon: "🏃", color: null },
  { id: "cycling", label: "Cycling", icon: "🚴", color: null },
  { id: "walking", label: "Walking", icon: "🏃", color: null },
  { id: "gym", label: "Gym", icon: "💪", color: null },
];

export default function Feed() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedSport]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("activities")
        .select(
          `
          *,
          organizer:profiles!organizer_id(id, full_name, avatar_url)
        `
        )
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true });

      // Apply sport filter
      if (selectedSport !== "all") {
        query = query.eq("sport", selectedSport);
      }

      // Apply date filter
      if (selectedDate === "Today") {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte("date_time", today.toISOString())
          .lt("date_time", tomorrow.toISOString());
      } else if (selectedDate === "Tomorrow") {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);
        query = query
          .gte("date_time", tomorrow.toISOString())
          .lt("date_time", dayAfter.toISOString());
      } else if (selectedDate === "This Week") {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query
          .gte("date_time", today.toISOString())
          .lt("date_time", nextWeek.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activities:", error);
      } else {
        setActivities(data || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSportIcon = (sport) => {
    const icons = {
      tennis: "🎾",
      padel: "🎾",
      running: "🏃",
      cycling: "🚴",
      walking: "🚶",
      gym: "💪",
      swimming: "🏊",
      basketball: "🏀",
      football: "⚽",
      yoga: "🧘",
      hiking: "🥾",
    };
    return icons[sport] || "🏃";
  };

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-500">Find activities with your mates</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
      </div>

      {/* Date Filters */}
      <div className="flex gap-2 mb-4">
        {dateFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedDate(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDate === filter
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Sport Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sportFilters.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSport === sport.id
                ? "bg-coral-500 text-white"
                : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sport.icon && <span>{sport.icon}</span>}
            {sport.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      )}

      {/* Activities List */}
      {!loading && filteredActivities.length > 0 && (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Sport Icon */}
                <div className="w-12 h-12 bg-coral-50 rounded-xl flex items-center justify-center text-2xl">
                  {getSportIcon(activity.sport)}
                </div>

                {/* Activity Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-coral-500 uppercase">
                      {activity.sport}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(activity.date_time)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-2 truncate">
                    {activity.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatTime(activity.date_time)} • {activity.duration}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="text-slate-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No activities found
          </h3>
          <p className="text-slate-500 mb-6">
            Try adjusting your filters or create a new activity
          </p>
          <Link
            to="/create-activity"
            className="flex items-center gap-2 bg-coral-500 text-white px-6 py-3 rounded-lg hover:bg-coral-600 transition-colors"
          >
            <Plus size={20} />
            Create Activity
          </Link>
        </div>
      )}
    </div>
  );
}
