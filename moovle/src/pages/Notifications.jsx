import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <div className="w-full">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Notifications</h1>

      {/* Empty State Card */}
      <div className="bg-white rounded-xl p-12 border border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Bell className="text-slate-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            All caught up!
          </h3>
          <p className="text-slate-500">
            You'll see notifications here when something happens
          </p>
        </div>
      </div>
    </div>
  );
}
