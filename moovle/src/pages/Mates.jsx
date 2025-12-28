import { useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";

const tabs = [
  { id: "mates", label: "Mates", count: 0 },
  { id: "requests", label: "Requests", count: null },
  { id: "pending", label: "Pending", count: 0 },
];

export default function Mates() {
  const [activeTab, setActiveTab] = useState("mates");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Mates</h1>
        <button className="flex items-center gap-2 bg-coral-500 text-white px-4 py-2 rounded-lg hover:bg-coral-600 transition-colors">
          <UserPlus size={20} />
          Add Mate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.count !== null && ` (${tab.count})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search mates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Users className="text-slate-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          No mates yet
        </h3>
        <p className="text-slate-500">
          Add mates to see their activities in your feed
        </p>
      </div>
    </div>
  );
}
