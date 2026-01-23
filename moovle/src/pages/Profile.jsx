import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Mail,
  MapPin,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { sports, getSportIconProps } from "../config/sports";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [stats, setStats] = useState({
    organized: 0,
    joined: 0,
    mates: 0,
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    city: "",
    bio: "",
    favorite_sports: [],
  });
  const [showSportsSelector, setShowSportsSelector] = useState(false);

  // Fetch user statistics
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Get organized activities count
        const { count: organizedCount } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .eq("creator_id", user.id);

        // Get joined activities count (excluding own activities)
        const { count: joinedCount } = await supabase
          .from("activity_participants")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Get mates count
        const { count: matesCount } = await supabase
          .from("mates")
          .select("*", { count: "exact", head: true })
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq("status", "accepted");

        setStats({
          organized: organizedCount || 0,
          joined: joinedCount || 0,
          mates: matesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statsData = [
    { label: "Organized", value: stats.organized },
    { label: "Joined", value: stats.joined },
    { label: "Mates", value: stats.mates },
  ];

  const getInitial = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const handleEdit = () => {
    // Ensure favorite_sports is always an array
    const favoriteSports = Array.isArray(profile?.favorite_sports)
      ? profile.favorite_sports
      : [];

    setEditForm({
      full_name: profile?.full_name || "",
      city: profile?.city || "",
      bio: profile?.bio || "",
      favorite_sports: favoriteSports,
    });
    setIsEditing(true);
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!editForm.full_name.trim()) {
      showToast({
        type: "error",
        title: "Name Required",
        message: "Please enter your full name.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateProfile(editForm);
      if (error) {
        console.error("Error updating profile:", error);
        showToast({
          type: "error",
          title: "Failed to Update",
          message: "Could not update your profile. Please try again.",
        });
      } else {
        showToast({
          type: "success",
          title: "Profile Updated!",
          message: "Your profile has been updated successfully.",
        });
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowSportsSelector(false);
    setSuccess(false);
  };

  const addSport = (sportId) => {
    // Check if sport already exists (case-insensitive)
    const alreadyExists = editForm.favorite_sports.some(
      (existingSport) => existingSport.toLowerCase() === sportId.toLowerCase(),
    );

    if (!alreadyExists) {
      setEditForm({
        ...editForm,
        favorite_sports: [...editForm.favorite_sports, sportId],
      });
    }
    setShowSportsSelector(false);
  };

  const removeSport = (sportId) => {
    setEditForm({
      ...editForm,
      favorite_sports: editForm.favorite_sports.filter((id) => id !== sportId),
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 transform hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-slate-400 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {getInitial()}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all duration-200 transform hover:scale-110 active:scale-95">
            <Camera size={16} className="text-slate-600" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {profile?.full_name || "User"}
        </h2>
        <p className="flex items-center gap-1 text-slate-500">
          <Mail size={14} />
          {user?.email || "No email"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statsLoading
          ? // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-slate-100 text-center"
              >
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))
          : // Actual stats
            statsData.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-4 border border-slate-100 text-center"
              >
                <p className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Profile Details</h3>
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check size={16} />
              <span>Profile updated!</span>
            </div>
          )}
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-teal-600 text-sm font-medium hover:underline cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin"></div>
                ) : (
                  <Check size={18} />
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Name</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
              />
            ) : (
              <p className="text-slate-800">
                {profile?.full_name || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
              <MapPin size={14} />
              City
            </p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.city}
                onChange={(e) =>
                  setEditForm({ ...editForm, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500"
              />
            ) : (
              <p
                className={profile?.city ? "text-slate-800" : "text-slate-400"}
              >
                {profile?.city || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Bio</p>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            ) : (
              <p className={profile?.bio ? "text-slate-800" : "text-slate-400"}>
                {profile?.bio || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Favorite Sports</p>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editForm.favorite_sports.map((sportId) => {
                    // Case-insensitive matching
                    const sport = sports.find(
                      (s) => s.id.toLowerCase() === sportId.toLowerCase(),
                    );

                    return (
                      <div
                        key={sportId}
                        className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {sport && sport.icon ? (
                            <>
                              {(() => {
                                const { IconComponent, size, className } =
                                  getSportIconProps(sportId.toLowerCase(), {
                                    size: 16,
                                    className: "text-teal-700",
                                  });
                                return (
                                  <IconComponent
                                    size={size}
                                    className={className}
                                  />
                                );
                              })()}
                              <span>{sport.label}</span>
                            </>
                          ) : sport ? (
                            <span>{sport.label}</span>
                          ) : (
                            <span>Unknown sport: {sportId}</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeSport(sportId)}
                          className="text-teal-500 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setShowSportsSelector(!showSportsSelector)}
                    className="flex items-center gap-1 px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Sport
                  </button>
                </div>

                {showSportsSelector && (
                  <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                    {sports
                      .filter(
                        (sport) =>
                          !editForm.favorite_sports.some(
                            (existingSport) =>
                              existingSport.toLowerCase() ===
                              sport.id.toLowerCase(),
                          ),
                      )
                      .map((sport) => (
                        <button
                          key={sport.id}
                          onClick={() => addSport(sport.id)}
                          className="flex items-center gap-2 p-2 text-left hover:bg-white rounded-lg transition-colors cursor-pointer"
                        >
                          {sport.icon &&
                            (() => {
                              const { IconComponent, size, className } =
                                getSportIconProps(sport.id, {
                                  size: 20,
                                  className: "text-slate-600",
                                });
                              return (
                                <IconComponent
                                  size={size}
                                  className={className}
                                />
                              );
                            })()}
                          <span className="text-sm">{sport.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {profile?.favorite_sports &&
                Array.isArray(profile.favorite_sports) &&
                profile.favorite_sports.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_sports
                      .filter(
                        (sportId) => sportId && typeof sportId === "string",
                      )
                      .map((sportId) => {
                        // Case-insensitive matching
                        const sport = sports.find(
                          (s) => s.id.toLowerCase() === sportId.toLowerCase(),
                        );

                        return (
                          <div
                            key={sportId}
                            className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                          >
                            {sport && sport.icon ? (
                              <>
                                {(() => {
                                  const { IconComponent, size, className } =
                                    getSportIconProps(sportId.toLowerCase(), {
                                      size: 14,
                                      className: "text-teal-700",
                                    });
                                  return (
                                    <IconComponent
                                      size={size}
                                      className={className}
                                    />
                                  );
                                })()}
                                <span>{sport.label}</span>
                              </>
                            ) : sport ? (
                              <span>{sport.label}</span>
                            ) : (
                              <span>Unknown: {sportId}</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-slate-400">No sports selected</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
