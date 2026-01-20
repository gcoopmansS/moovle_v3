import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Lock,
  Globe,
  User,
  Search,
  X,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import {
  sports,
  visibilityOptions,
  getSportById,
  getSportIconProps,
} from "../config/sports";
import { notifyActivityInvite } from "../lib/notifications";
import LocationInput from "../components/LocationInput";

// Map visibility icons
const visibilityIcons = {
  public: Globe,
  mates: Users,
  invite_only: Lock,
};

export default function CreateActivity() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [selectedSport, setSelectedSport] = useState("running");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [durationType, setDurationType] = useState("duration"); // "duration" or "distance"
  const [duration, setDuration] = useState(60); // Duration in minutes
  const [distance, setDistance] = useState("");
  const [capacity, setCapacity] = useState(2); // Default to 2
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null); // { lat, lng }
  const [locationDetails, setLocationDetails] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Invite-only specific state
  const [mates, setMates] = useState([]);
  const [selectedInvites, setSelectedInvites] = useState([]);
  const [loadingMates, setLoadingMates] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");

  const currentSport = getSportById(selectedSport);
  const supportsDistance = currentSport?.supportsDistance || false;

  // Form validation functions
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "title":
        return !value?.trim() ? "Title is required" : null;
      case "dateTime":
        if (!value) return "Date and time is required";
        if (new Date(value) <= new Date()) return "Date must be in the future";
        return null;
      case "location":
        return !value?.trim() ? "Location is required" : null;
      case "duration":
        if (durationType === "duration" && (!duration || duration < 1)) {
          return "Duration must be at least 1 minute";
        }
        return null;
      case "distance":
        if (
          durationType === "distance" &&
          supportsDistance &&
          (!distance || distance < 1)
        ) {
          return "Distance must be at least 1 km";
        }
        return null;
      case "invites":
        if (visibility === "invite_only" && selectedInvites.length === 0) {
          return "Please select at least one friend to invite";
        }
        return null;
      default:
        return null;
    }
  };

  const validateForm = () => {
    const errors = {};

    // Required field validations
    errors.title = validateField("title", title);
    errors.dateTime = validateField("dateTime", dateTime);
    errors.location = validateField("location", location);
    errors.duration = validateField("duration", duration);
    errors.distance = validateField("distance", distance);
    errors.invites = validateField("invites", selectedInvites);

    // Remove null errors
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
  };

  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldName, value) => {
    // Mark field as touched
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    // Validate field and update errors
    if (hasSubmitted || touchedFields[fieldName]) {
      const fieldError = validateField(fieldName, value);
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    }
  };

  // Update defaults when sport changes
  useEffect(() => {
    if (currentSport) {
      setDuration(currentSport.defaultDuration);
      if (currentSport.supportsDistance) {
        setDistance(String(currentSport.defaultDistance));
      }
      if (currentSport.capacityOptions) {
        setCapacity(currentSport.capacityOptions[0]);
      }
    }
  }, [selectedSport, currentSport]);

  // Fetch user's mates for invite-only activities
  useEffect(() => {
    const fetchMates = async () => {
      if (!user) return;

      setLoadingMates(true);
      try {
        const { data: matesData, error } = await supabase
          .from("mates")
          .select(
            `
            id,
            requester_id,
            receiver_id,
            requester:profiles!requester_id(id, full_name, avatar_url),
            receiver:profiles!receiver_id(id, full_name, avatar_url)
          `,
          )
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (error) throw error;

        // Transform to get the "other" person
        const transformedMates = (matesData || []).map((m) => ({
          ...m,
          mate: m.requester_id === user.id ? m.receiver : m.requester,
        }));
        setMates(transformedMates);
      } catch (err) {
        console.error("Error fetching mates:", err);
      } finally {
        setLoadingMates(false);
      }
    };

    fetchMates();
  }, [user]);

  // Filter mates based on search query
  const filteredMates = mates.filter((mateRelation) => {
    const mate = mateRelation.mate;
    const name = mate.full_name || "";
    const city = mate.city || "";
    const query = inviteSearchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(query) || city.toLowerCase().includes(query)
    );
  });

  // Helper functions for invite management
  const handleSelectAll = () => {
    const allMateIds = filteredMates.map((mr) => mr.mate.id);
    setSelectedInvites(allMateIds);
  };

  const handleDeselectAll = () => {
    setSelectedInvites([]);
  };

  const handleToggleMate = (mateId) => {
    setSelectedInvites((prev) => {
      const newInvites = prev.includes(mateId)
        ? prev.filter((id) => id !== mateId)
        : [...prev, mateId];

      // Trigger validation for invites
      handleFieldChange("invites", newInvites);
      return newInvites;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setHasSubmitted(true);

    // Validate all fields
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fix the errors above before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: activityData, error: insertError } = await supabase
        .from("activities")
        .insert({
          creator_id: user.id,
          sport: selectedSport,
          title,
          description: description || null,
          date_time: new Date(dateTime).toISOString(),
          duration: durationType === "duration" ? duration : null,
          distance:
            supportsDistance && durationType === "distance" && distance
              ? parseInt(distance, 10)
              : null,
          max_participants: capacity,
          location,
          location_lat: locationCoords?.lat || null,
          location_lng: locationCoords?.lng || null,
          location_details: locationDetails || null,
          visibility,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // If invite-only, create invitations and send notifications
      if (visibility === "invite_only" && selectedInvites.length > 0) {
        const invites = selectedInvites.map((mateId) => ({
          activity_id: activityData.id,
          inviter_id: user.id,
          invitee_id: mateId,
          status: "pending",
        }));

        const { error: inviteError } = await supabase
          .from("activity_invites")
          .insert(invites);

        if (inviteError) {
          console.error("Error creating invites:", inviteError);
          // Don't fail the whole activity creation, just log the error
        } else {
          // Send notifications to invited users
          const invitePromises = selectedInvites.map(async (mateId) => {
            // Get the mate's profile for the notification
            const mate = mates.find((m) => m.mate.id === mateId)?.mate;
            const userName =
              profile?.full_name || user.user_metadata?.full_name || "Someone";
            if (mate) {
              await notifyActivityInvite(
                mateId,
                user.id,
                userName,
                activityData.id,
                title,
              );
            }
          });

          await Promise.all(invitePromises);
        }
      }

      showToast({
        type: "success",
        title: "Activity Created!",
        message: `${title} has been created successfully.`,
      });

      navigate("/app/agenda");
    } catch (error) {
      console.error("Error creating activity:", error);
      const errorMessage =
        error?.message || "Failed to create activity. Please try again.";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Failed to Create Activity",
        message: errorMessage,
      });
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  selectedSport === sport.id
                    ? "bg-coral-500 text-white border-coral-500"
                    : "text-slate-600 border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                {(() => {
                  const { IconComponent, size, className } = getSportIconProps(
                    sport.id,
                    {
                      size: 16,
                      className:
                        selectedSport === sport.id
                          ? "text-white"
                          : "text-slate-500",
                    },
                  );
                  return <IconComponent size={size} className={className} />;
                })()}
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
            onChange={(e) => {
              setTitle(e.target.value);
              handleFieldChange("title", e.target.value);
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
          {(hasSubmitted || touchedFields.title) && fieldErrors.title && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
          )}
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
            onChange={(e) => {
              setDateTime(e.target.value);
              handleFieldChange("dateTime", e.target.value);
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
          {(hasSubmitted || touchedFields.dateTime) && fieldErrors.dateTime && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.dateTime}</p>
          )}
        </div>

        {/* Duration or Distance */}
        <div>
          {supportsDistance && (
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setDurationType("duration")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  durationType === "duration"
                    ? "bg-coral-500 text-white"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                Duration
              </button>
              <button
                type="button"
                onClick={() => setDurationType("distance")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  durationType === "distance"
                    ? "bg-coral-500 text-white"
                    : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                }`}
              >
                Distance
              </button>
            </div>
          )}

          {(!supportsDistance || durationType === "duration") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 60"
                  value={duration}
                  onChange={(e) => {
                    setDuration(Number(e.target.value));
                    handleFieldChange("duration", Number(e.target.value));
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <span className="text-slate-500 font-medium">min</span>
              </div>
              {(hasSubmitted || touchedFields.duration) &&
                fieldErrors.duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors.duration}
                  </p>
                )}
            </div>
          )}

          {supportsDistance && durationType === "distance" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Distance (km)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 10"
                  value={distance}
                  onChange={(e) => {
                    setDistance(e.target.value);
                    handleFieldChange("distance", e.target.value);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                />
                <span className="text-slate-500 font-medium">km</span>
              </div>
              {(hasSubmitted || touchedFields.distance) &&
                fieldErrors.distance && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors.distance}
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Starting Location
          </label>
          <LocationInput
            value={location}
            onChange={(address, coords) => {
              setLocation(address);
              setLocationCoords(coords);
              handleFieldChange("location", address);
            }}
            placeholder="Search for a location..."
          />
          {(hasSubmitted || touchedFields.location) && fieldErrors.location && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.location}</p>
          )}
          <input
            type="text"
            placeholder="Additional details (court number, meeting point...)"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum participants (including you)
          </label>
          {currentSport?.capacityOptions &&
          currentSport.capacityOptions.length <= 4 ? (
            <select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            >
              {currentSport.capacityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              min={
                currentSport?.capacityOptions
                  ? Math.min(...currentSport.capacityOptions)
                  : 2
              }
              max={
                currentSport?.capacityOptions
                  ? Math.max(...currentSport.capacityOptions)
                  : 20
              }
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Who can see this activity?
          </label>
          <div className="space-y-3">
            {visibilityOptions.map((option) => {
              const IconComponent = visibilityIcons[option.id];
              return (
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
                    onChange={(e) => {
                      setVisibility(e.target.value);
                      // Clear selected invites and search if switching away from invite_only
                      if (e.target.value !== "invite_only") {
                        setSelectedInvites([]);
                        setInviteSearchQuery("");
                        // Clear invite validation error
                        setFieldErrors((prev) => ({ ...prev, invites: null }));
                      } else {
                        // Trigger validation for invite_only
                        handleFieldChange("invites", selectedInvites);
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      visibility === option.id
                        ? "bg-coral-500 text-white"
                        : "bg-gray-100 text-slate-500"
                    }`}
                  >
                    <IconComponent size={20} />
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
                    <p className="text-sm text-slate-500">
                      {option.description}
                    </p>
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
              );
            })}
          </div>
        </div>

        {/* Invite Friends (only show for invite_only) */}
        {visibility === "invite_only" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Invite Friends
            </label>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              {loadingMates ? (
                <div className="text-center py-4 text-slate-500">
                  Loading your mates...
                </div>
              ) : mates.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  <p>You don't have any mates yet.</p>
                  <p className="text-sm mt-1">
                    Add some mates first to invite them to activities.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Search and Actions Header */}
                  <div className="flex flex-col gap-3 mb-4">
                    {/* Search */}
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        placeholder="Search friends..."
                        value={inviteSearchQuery}
                        onChange={(e) => setInviteSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent text-sm"
                      />
                      {inviteSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setInviteSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Actions and Counter */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          disabled={filteredMates.length === 0}
                          className="px-3 py-1 text-xs font-medium text-coral-600 bg-coral-50 border border-coral-200 rounded-full hover:bg-coral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={handleDeselectAll}
                          disabled={selectedInvites.length === 0}
                          className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="text-sm text-slate-600">
                        {selectedInvites.length} of {mates.length} selected
                        {selectedInvites.length > capacity && (
                          <span className="text-amber-600 ml-1">
                            (first {capacity} can join)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Friends List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredMates.length === 0 ? (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        {inviteSearchQuery
                          ? "No friends found matching your search"
                          : "No friends to show"}
                      </div>
                    ) : (
                      filteredMates.map((mateRelation) => {
                        const mate = mateRelation.mate;
                        const isSelected = selectedInvites.includes(mate.id);
                        return (
                          <label
                            key={mate.id}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-coral-50 border border-coral-200"
                                : "bg-white border border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleMate(mate.id)}
                              className="w-4 h-4 text-coral-500 border-gray-300 rounded focus:ring-coral-500"
                            />
                            <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
                              {mate.avatar_url ? (
                                <img
                                  src={mate.avatar_url}
                                  alt={mate.full_name || "Friend"}
                                  className="w-full h-full object-cover"
                                />
                              ) : mate.full_name ? (
                                mate.full_name.charAt(0)
                              ) : (
                                <User size={16} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-800 truncate">
                                {mate.full_name || "Unknown"}
                              </p>
                              {mate.city && (
                                <p className="text-xs text-slate-500 truncate">
                                  {mate.city}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>

                  {/* Helpful tip */}
                  {selectedInvites.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-start gap-2 text-xs text-slate-600">
                        <Lightbulb
                          size={14}
                          className="text-slate-400 mt-0.5 shrink-0"
                        />
                        <p>
                          <strong>Tip:</strong> You can invite more friends than
                          the maximum participants. The first {capacity - 1} to
                          join will get a spot.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {(hasSubmitted || touchedFields.invites) && fieldErrors.invites && (
              <p className="text-red-500 text-sm mt-2">{fieldErrors.invites}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isSubmitting || !isFormValid()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-coral-500 text-white hover:bg-coral-600 cursor-pointer"
          }`}
        >
          {isSubmitting ? "Creating..." : "Create Activity"}
        </button>
      </form>
    </div>
  );
}
