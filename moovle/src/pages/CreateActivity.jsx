import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Users, Lock, Globe } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const sports = [
  { id: "tennis", label: "Tennis", icon: "🎾", usesDistance: false },
  { id: "padel", label: "Padel", icon: "🎾", usesDistance: false },
  { id: "running", label: "Running", icon: "🏃", usesDistance: true },
  { id: "cycling", label: "Cycling", icon: "🚴", usesDistance: true },
  { id: "walking", label: "Walking", icon: "🚶", usesDistance: true },
  { id: "gym", label: "Gym", icon: "💪", usesDistance: false },
  { id: "swimming", label: "Swimming", icon: "🏊", usesDistance: true },
  { id: "basketball", label: "Basketball", icon: "🏀", usesDistance: false },
  { id: "football", label: "Football", icon: "⚽", usesDistance: false },
  { id: "yoga", label: "Yoga", icon: "🧘", usesDistance: false },
  { id: "hiking", label: "Hiking", icon: "🥾", usesDistance: true },
  { id: "other", label: "Other", icon: "•••", usesDistance: false },
];

const durations = [
  "30 min",
  "45 min",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
  "4 hours",
  "Half day",
  "Full day",
];

const distances = [
  "5 km",
  "10 km",
  "15 km",
  "20 km",
  "25 km",
  "30 km",
  "40 km",
  "50 km",
  "75 km",
  "100 km",
  "100+ km",
];

const visibilityOptions = [
  {
    id: "public",
    label: "Public",
    description: "Anyone can see and join",
    icon: Globe,
  },
  {
    id: "mates",
    label: "Mates Only",
    description: "Only your mates can see and join",
    icon: Users,
  },
  {
    id: "invite_only",
    label: "Invite Only",
    description: "Only people you invite can join",
    icon: Lock,
  },
];

export default function CreateActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSport, setSelectedSport] = useState("tennis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState("1 hour");
  const [distance, setDistance] = useState("");
  const [location, setLocation] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentSport = sports.find((s) => s.id === selectedSport);
  const showDistance = currentSport?.usesDistance || false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title || !dateTime || !location) {
      setError("Please fill in title, date/time, and location");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase.from("activities").insert({
        creator_id: user.id,
        sport: selectedSport,
        title,
        description: description || null,
        date_time: new Date(dateTime).toISOString(),
        duration,
        distance: showDistance ? distance : null,
        location,
        location_details: locationDetails || null,
        visibility,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      navigate("/");
    } catch {
      setError("Failed to create activity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                    ? "bg-coral-500 text-white border-coral-500"
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

        {/* Date/Time */}
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

        {/* Duration and Distance */}
        <div className={`grid gap-4 ${showDistance ? "grid-cols-2" : "grid-cols-1"}`}>
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
          {showDistance && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Distance
              </label>
              <select
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
              >
                <option value="">Select distance</option>
                {distances.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            Starting Location
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

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Who can see this activity?
          </label>
          <div className="space-y-3">
            {visibilityOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                  visibility === option.id
                    ? "border-coral-500 bg-coral-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.id}
                  checked={visibility === option.id}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    visibility === option.id
                      ? "bg-coral-500 text-white"
                      : "bg-gray-100 text-slate-500"
                  }`}
                >
                  <option.icon size={20} />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      visibility === option.id
                        ? "text-coral-600"
                        : "text-slate-800"
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="text-sm text-slate-500">{option.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    visibility === option.id
                      ? "border-coral-500"
                      : "border-gray-300"
                  }`}
                >
                  {visibility === option.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-coral-500"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-coral-500 text-white py-4 rounded-xl font-semibold hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Activity"}
        </button>
      </form>
    </div>
  );
}
