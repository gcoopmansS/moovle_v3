import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { sports } from "../config/sports";
import ActivityCard from "../components/ActivityCard";

const dateFilters = ["All", "Today", "Tomorrow", "This Week"];

// Build sport filters from config (add "All Sports" option)
const sportFilters = [
  { id: "all", label: "All Sports", icon: null },
  ...sports.map((sport) => ({
    id: sport.id,
    label: sport.label,
    icon: sport.icon,
  })),
];

export default function Feed() {
  const { profile, user } = useAuth();
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
          organizer:profiles!creator_id(id, full_name, avatar_url)
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

      {/* Conditional Rendering */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isHost={activity.creator_id === user.id}
            />
          ))}
        </div>
      ) : (
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
