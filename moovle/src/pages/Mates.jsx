import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Users,
  Check,
  X,
  Clock,
  UserMinus,
  Loader2,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Mates() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("mates");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mates, setMates] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const tabs = [
    { id: "mates", label: "Mates", count: mates.length },
    {
      id: "requests",
      label: "Requests",
      count: incomingRequests.length > 0 ? incomingRequests.length : null,
    },
    { id: "pending", label: "Pending", count: outgoingRequests.length },
  ];

  useEffect(() => {
    if (user) {
      fetchMatesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMatesData = async () => {
    setLoading(true);
    try {
      // Fetch accepted mates (where current user is either requester or receiver)
      const { data: matesData, error: matesError } = await supabase
        .from("mates")
        .select(
          `
          id,
          requester_id,
          receiver_id,
          status,
          created_at,
          requester:profiles!requester_id(id, full_name, avatar_url, city),
          receiver:profiles!receiver_id(id, full_name, avatar_url, city)
        `
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (matesError) throw matesError;

      // Transform to get the "other" person
      const transformedMates = (matesData || []).map((m) => ({
        ...m,
        mate: m.requester_id === user.id ? m.receiver : m.requester,
      }));
      setMates(transformedMates);

      // Fetch incoming requests (where current user is receiver)
      const { data: incomingData, error: incomingError } = await supabase
        .from("mates")
        .select(
          `
          id,
          requester_id,
          created_at,
          requester:profiles!requester_id(id, full_name, avatar_url, city)
        `
        )
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (incomingError) throw incomingError;
      setIncomingRequests(incomingData || []);

      // Fetch outgoing requests (where current user is requester)
      const { data: outgoingData, error: outgoingError } = await supabase
        .from("mates")
        .select(
          `
          id,
          receiver_id,
          created_at,
          receiver:profiles!receiver_id(id, full_name, avatar_url, city)
        `
        )
        .eq("requester_id", user.id)
        .eq("status", "pending");

      if (outgoingError) throw outgoingError;
      setOutgoingRequests(outgoingData || []);
    } catch (error) {
      console.error("Error fetching mates data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search for users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, city")
          .neq("id", user.id)
          .ilike("full_name", `%${searchQuery}%`)
          .limit(10);

        if (error) throw error;

        // Filter out existing mates and pending requests
        const existingIds = [
          ...mates.map((m) => m.mate.id),
          ...incomingRequests.map((r) => r.requester.id),
          ...outgoingRequests.map((r) => r.receiver.id),
        ];

        const filtered = (data || []).filter(
          (u) => !existingIds.includes(u.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user, mates, incomingRequests, outgoingRequests]);

  const sendMateRequest = async (receiverId) => {
    setActionLoading(receiverId);
    try {
      const { error } = await supabase.from("mates").insert({
        requester_id: user.id,
        receiver_id: receiverId,
        status: "pending",
      });

      if (error) throw error;

      // Refresh data
      await fetchMatesData();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error sending mate request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const acceptRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from("mates")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;
      await fetchMatesData();
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const declineRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from("mates")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
      await fetchMatesData();
    } catch (error) {
      console.error("Error declining request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const cancelRequest = async (requestId) => {
    setActionLoading(requestId);
    try {
      const { error } = await supabase
        .from("mates")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
      await fetchMatesData();
    } catch (error) {
      console.error("Error canceling request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const removeMate = async (mateConnectionId) => {
    setActionLoading(mateConnectionId);
    try {
      const { error } = await supabase
        .from("mates")
        .delete()
        .eq("id", mateConnectionId);

      if (error) throw error;
      await fetchMatesData();
    } catch (error) {
      console.error("Error removing mate:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Filter mates based on search
  const filteredMates = mates.filter((m) =>
    m.mate.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Mates</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "bg-coral-500 text-white"
                : "text-slate-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-white text-coral-500"
                    : "bg-coral-500 text-white"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder={
            activeTab === "mates" ? "Search mates..." : "Search for people..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
        {isSearching && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
            size={20}
          />
        )}
      </div>

      {/* Search Results (when searching for new people) */}
      {searchQuery.length >= 2 && searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-500 mb-3">
            Add new mates
          </h3>
          <div className="space-y-2">
            {searchResults.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
              >
                <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitial(person.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">
                    {person.full_name || "Unknown"}
                  </p>
                  {person.city && (
                    <p className="text-sm text-slate-500">{person.city}</p>
                  )}
                </div>
                <button
                  onClick={() => sendMateRequest(person.id)}
                  disabled={actionLoading === person.id}
                  className="flex items-center gap-2 px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading === person.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No search results */}
      {searchQuery.length >= 2 &&
        searchResults.length === 0 &&
        !isSearching && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center text-slate-500">
            No users found matching "{searchQuery}"
          </div>
        )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-coral-500" size={32} />
        </div>
      )}

      {/* Content based on active tab */}
      {!loading && (
        <>
          {/* Mates Tab */}
          {activeTab === "mates" && (
            <>
              {filteredMates.length > 0 ? (
                <div className="space-y-2">
                  {filteredMates.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitial(connection.mate.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {connection.mate.full_name || "Unknown"}
                        </p>
                        {connection.mate.city && (
                          <p className="text-sm text-slate-500">
                            {connection.mate.city}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeMate(connection.id)}
                        disabled={actionLoading === connection.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove mate"
                      >
                        {actionLoading === connection.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-slate-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No mates yet
                  </h3>
                  <p className="text-slate-500 text-center">
                    Search for people above to add your first mate
                  </p>
                </div>
              )}
            </>
          )}

          {/* Incoming Requests Tab */}
          {activeTab === "requests" && (
            <>
              {incomingRequests.length > 0 ? (
                <div className="space-y-2">
                  {incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-coral-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitial(request.requester.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {request.requester.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500">
                          Sent {formatDate(request.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === request.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => declineRequest(request.id)}
                          disabled={actionLoading === request.id}
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-slate-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="text-slate-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No pending requests
                  </h3>
                  <p className="text-slate-500">
                    You don't have any mate requests to review
                  </p>
                </div>
              )}
            </>
          )}

          {/* Outgoing/Pending Requests Tab */}
          {activeTab === "pending" && (
            <>
              {outgoingRequests.length > 0 ? (
                <div className="space-y-2">
                  {outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
                    >
                      <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitial(request.receiver.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">
                          {request.receiver.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          Pending • Sent {formatDate(request.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={() => cancelRequest(request.id)}
                        disabled={actionLoading === request.id}
                        className="px-3 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <UserPlus className="text-slate-400" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No pending requests
                  </h3>
                  <p className="text-slate-500">
                    Search for people to send mate requests
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
