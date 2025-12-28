import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";

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
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">Hey, Gil 👋</h1>
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

      {/* Empty State */}
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
    </div>
  );
}
