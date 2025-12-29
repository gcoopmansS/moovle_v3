import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Mail, MapPin, Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    city: "",
    bio: "",
  });

  const stats = [
    { label: "Organized", value: profile?.activities_organized || 0 },
    { label: "Joined", value: profile?.activities_joined || 0 },
    { label: "Mates", value: profile?.mates_count || 0 },
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
    setEditForm({
      full_name: profile?.full_name || "",
      city: profile?.city || "",
      bio: profile?.bio || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-coral-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {getInitial()}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 cursor-pointer">
            <Camera size={16} className="text-slate-600" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {profile?.full_name || "User"}
        </h2>
        <p className="flex items-center gap-1 text-slate-500">
          <Mail size={14} />
          {user?.email || "No email"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-100 text-center"
          >
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-800">Profile Details</h3>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="text-coral-500 text-sm font-medium hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check size={18} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coral-500 resize-none"
              />
            ) : (
              <p className={profile?.bio ? "text-slate-800" : "text-slate-400"}>
                {profile?.bio || "Not set"}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Favorite Sports</p>
            {profile?.favorite_sports && profile.favorite_sports.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.favorite_sports.map((sport) => (
                  <span
                    key={sport}
                    className="px-3 py-1 bg-coral-100 text-coral-600 rounded-full text-sm"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No sports selected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
