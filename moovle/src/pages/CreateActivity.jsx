import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

const sports = [
  {
    id: "tennis",
    label: "Tennis",
    icon: "🎾",
    color: "text-teal-600 border-teal-200 bg-teal-50",
  },
  {
    id: "padel",
    label: "Padel",
    icon: "🎾",
    color: "text-slate-600 border-slate-200 bg-white",
  },
  {
    id: "running",
    label: "Running",
    icon: "🏃",
    color: "text-coral-500 border-coral-200 bg-coral-50",
  },
  {
    id: "cycling",
    label: "Cycling",
    icon: "🚴",
    color: "text-teal-600 border-teal-200 bg-teal-50",
  },
  {
    id: "walking",
    label: "Walking",
    icon: "🚶",
    color: "text-coral-500 border-coral-200 bg-coral-50",
  },
  {
    id: "gym",
    label: "Gym",
    icon: "💪",
    color: "text-coral-500 border-coral-200 bg-coral-50",
  },
  {
    id: "swimming",
    label: "Swimming",
    icon: "🏊",
    color: "text-teal-600 border-teal-200 bg-teal-50",
  },
  {
    id: "basketball",
    label: "Basketball",
    icon: "🏀",
    color: "text-orange-500 border-orange-200 bg-orange-50",
  },
  {
    id: "football",
    label: "Football",
    icon: "⚽",
    color: "text-teal-600 border-teal-200 bg-teal-50",
  },
  {
    id: "yoga",
    label: "Yoga",
    icon: "🧘",
    color: "text-pink-500 border-pink-200 bg-pink-50",
  },
  {
    id: "hiking",
    label: "Hiking",
    icon: "🥾",
    color: "text-slate-600 border-slate-200 bg-white",
  },
  {
    id: "other",
    label: "Other",
    icon: "•••",
    color: "text-slate-600 border-slate-200 bg-white",
  },
];

const durations = [
  "30 min",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
];

export default function CreateActivity() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("tennis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState("1 hour");
  const [location, setLocation] = useState("");
  const [locationDetails, setLocationDetails] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log({
      selectedSport,
      title,
      description,
      dateTime,
      duration,
      location,
      locationDetails,
    });
    navigate("/");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Create Activity</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sport Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Sport
          </label>
          <div className="flex flex-wrap gap-2">
            {sports.map((sport) => (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedSport === sport.id
                    ? sport.color
                    : "text-slate-600 border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <span>{sport.icon}</span>
                {sport.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g., Morning tennis session"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description (optional)
          </label>
          <textarea
            placeholder="Any details your mates should know..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Date/Time and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              When
            </label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            Location
          </label>
          <input
            type="text"
            placeholder="e.g., Central Park Tennis Courts"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent mb-3"
          />
          <input
            type="text"
            placeholder="Additional details (court number, meeting point...)"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-coral-500 text-white py-4 rounded-xl font-semibold hover:bg-coral-600 transition-colors"
        >
          Create Activity
        </button>
      </form>
    </div>
  );
}
