import { useState } from "react";
import { Calendar, List } from "lucide-react";

const tabs = ["Upcoming", "Past", "Organized"];

export default function Agenda() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [viewMode, setViewMode] = useState("list");

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

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-slate-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          No activities
        </h3>
        <p className="text-slate-500">
          You haven't joined any upcoming activities
        </p>
      </div>
    </div>
  );
}
