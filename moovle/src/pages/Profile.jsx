import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Mail, MapPin } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const stats = [
    { label: "Organized", value: 1 },
    { label: "Joined", value: 1 },
    { label: "Mates", value: 0 },
  ];

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
        <h1 className="text-2xl font-bold text-slate-800">Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-24 h-24 bg-coral-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            G
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200">
            <Camera size={16} className="text-slate-600" />
          </button>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Gil Coopmans</h2>
        <p className="flex items-center gap-1 text-slate-500">
          <Mail size={14} />
          gcoopmans@gmail.com
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
          <button className="text-coral-500 text-sm font-medium hover:underline">
            Edit
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Name</p>
            <p className="text-slate-800">Gil Coopmans</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
              <MapPin size={14} />
              City
            </p>
            <p className="text-slate-400">Not set</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Bio</p>
            <p className="text-slate-400">Not set</p>
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">Favorite Sports</p>
            <p className="text-slate-400">No sports selected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
