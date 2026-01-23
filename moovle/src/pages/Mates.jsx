import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "../components/Modal";
import SuggestedMatesCarousel from "../components/SuggestedMatesCarousel";
import EmptyState from "../components/EmptyState";
import { buildMateSuggestions } from "../lib/mateSuggestions";
import {
  Search,
  UserPlus,
  Users,
  Check,
  X,
  Clock,
  UserMinus,
  Loader2,
  UserSearch,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { notifyMateRequest, notifyMateAccepted } from "../lib/notifications";

export default function Mates() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "discover",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mates, setMates] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [suggestedMates, setSuggestedMates] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const tabs = [
    { id: "discover", label: "Discover" },
    {
      id: "requests",
      label: "Requests",
      count:
        (incomingRequests.length > 0 ? incomingRequests.length : 0) +
        (outgoingRequests.length > 0 ? outgoingRequests.length : 0),
    },
    { id: "mates", label: "Mates", count: mates.length },
  ];

  const fetchMatesData = useCallback(async () => {
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
        `,
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
        `,
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
        `,
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
  }, [user]);

  // Advanced mate suggestion fetching and scoring
  const fetchMateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      // 1. Load current user profile (me)
      const { data: me, error: meErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (meErr) throw meErr;

      // 2. Load all candidate profiles (same country, limit 200, exclude self)
      let countryFilter = me.country ? { country: me.country } : {};
      let { data: candidates, error: candErr } = await supabase
        .from("profiles")
        .select(
          "id, full_name, avatar_url, city, city_lat, city_lng, favorite_sports, country",
        )
        .neq("id", user.id)
        .match(countryFilter)
        .limit(200);
      if (candErr) throw candErr;

      // 3. Load all mate edges (to filter out accepted, pending, declined, both directions)
      const { data: mateEdges, error: mateEdgesErr } = await supabase
        .from("mates")
        .select("id, requester_id, receiver_id, status")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
      if (mateEdgesErr) throw mateEdgesErr;

      // 4. Filter out candidates who are already mates, pending, declined, or self
      const excludeIds = new Set([user.id]);
      mateEdges.forEach((edge) => {
        if (["accepted", "pending", "declined"].includes(edge.status)) {
          excludeIds.add(edge.requester_id);
          excludeIds.add(edge.receiver_id);
        }
      });
      const filteredCandidates = candidates.filter(
        (c) => !excludeIds.has(c.id),
      );

      // 5. User’s recent sports (favorite_sports or recent activities)
      let myRecentSports =
        Array.isArray(me.favorite_sports) && me.favorite_sports.length > 0
          ? [...me.favorite_sports]
          : [];
      if (myRecentSports.length === 0) {
        // fallback: last 30 days activities
        const since = new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const { data: myActs } = await supabase
          .from("activity_participants")
          .select("activity_id, activities(sport)")
          .eq("user_id", user.id)
          .gte("joined_at", since);
        if (myActs) {
          myRecentSports = [
            ...new Set(myActs.map((a) => a.activities?.sport).filter(Boolean)),
          ];
        }
      }

      // 6. Mutual mates: fetch accepted mates of my accepted mates
      const myMateIds = mateEdges
        .filter((e) => e.status === "accepted")
        .map((e) =>
          e.requester_id === user.id ? e.receiver_id : e.requester_id,
        );
      let mutualMap = {};
      if (myMateIds.length > 0) {
        const { data: matesOfMates } = await supabase
          .from("mates")
          .select("requester_id, receiver_id, status")
          .or(
            myMateIds
              .map((id) => `requester_id.eq.${id},receiver_id.eq.${id}`)
              .join(","),
          )
          .eq("status", "accepted");
        if (matesOfMates) {
          matesOfMates.forEach((edge) => {
            const otherId = myMateIds.includes(edge.requester_id)
              ? edge.receiver_id
              : edge.requester_id;
            if (!excludeIds.has(otherId)) {
              mutualMap[otherId] = (mutualMap[otherId] || 0) + 1;
            }
          });
        }
      }

      // 7. Candidate activity stats (recent sports, venues, last active)
      // Batch fetch: get recent activities for all candidates in last 90 days
      const candidateIds = filteredCandidates.map((c) => c.id);
      let candidateStats = {};
      if (candidateIds.length > 0) {
        const since = new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000,
        ).toISOString();
        // Fetch activities created by candidates
        const { data: actsCreated } = await supabase
          .from("activities")
          .select(
            "id, creator_id, sport, date_time, location_lat, location_lng",
          )
          .in("creator_id", candidateIds)
          .gte("date_time", since);
        // Fetch activities joined by candidates
        const { data: actsJoined } = await supabase
          .from("activity_participants")
          .select(
            "user_id, activity_id, status, activities(sport, date_time, location_lat, location_lng)",
          )
          .in("user_id", candidateIds)
          .eq("status", "joined")
          .gte("joined_at", since);
        // Build stats per candidate
        candidateIds.forEach((cid) => {
          const created = (actsCreated || []).filter(
            (a) => a.creator_id === cid,
          );
          const joined = (actsJoined || []).filter((a) => a.user_id === cid);
          const recentSports = [
            ...new Set(
              [
                ...created.map((a) => a.sport),
                ...joined.map((a) => a.activities?.sport),
              ].filter(Boolean),
            ),
          ];
          // Venues near me
          let venuesNearby = [];
          if (me.city_lat && me.city_lng) {
            const allActs = [
              ...created.map((a) => ({
                lat: a.location_lat,
                lng: a.location_lng,
              })),
              ...joined.map((a) => ({
                lat: a.activities?.location_lat,
                lng: a.activities?.location_lng,
              })),
            ];
            venuesNearby = allActs
              .filter(
                (v) =>
                  v.lat &&
                  v.lng &&
                  Math.abs(v.lat - me.city_lat) < 1 &&
                  Math.abs(v.lng - me.city_lng) < 1, // quick filter
              )
              .filter((v) => {
                // precise filter
                const d = buildMateSuggestions.haversineKm
                  ? buildMateSuggestions.haversineKm(
                      me.city_lat,
                      me.city_lng,
                      v.lat,
                      v.lng,
                    )
                  : 0;
                return d <= 15;
              });
          }
          // Last active
          let lastActive = null;
          const allDates = [
            ...created.map((a) => a.date_time),
            ...joined.map((a) => a.activities?.date_time),
          ]
            .filter(Boolean)
            .sort()
            .reverse();
          if (allDates.length > 0) lastActive = allDates[0];
          candidateStats[cid] = { recentSports, venuesNearby, lastActive };
        });
      }

      // 8. Build suggestions
      const suggestions = buildMateSuggestions({
        me,
        candidates: filteredCandidates,
        myMates: [],
        myRecentSports,
        mutualMap,
        candidateStats,
      });
      setSuggestedMates(suggestions);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setSuggestedMates([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMatesData();
      fetchMateSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Listen for mate request updates from other components (like notifications)
  useEffect(() => {
    const handleMateRequestUpdate = () => {
      // Refresh mates data when mate requests are accepted/declined elsewhere
      fetchMatesData();
    };

    window.addEventListener("mateRequestUpdated", handleMateRequestUpdate);

    return () => {
      window.removeEventListener("mateRequestUpdated", handleMateRequestUpdate);
    };
  }, [fetchMatesData]);

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
          (u) => !existingIds.includes(u.id),
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

      showToast({
        type: "success",
        title: "Mate Request Sent!",
        message: "Your mate request has been sent successfully.",
      });

      // Send notification to receiver
      const userName = user.user_metadata?.full_name || "Someone";
      await notifyMateRequest(receiverId, user.id, userName);

      // Refresh data
      await fetchMatesData();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error sending mate request:", error);
      showToast({
        type: "error",
        title: "Failed to Send Request",
        message: "Could not send mate request. Please try again.",
      });
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

      // Get the mate request to find the requester_id
      const { data: mateData } = await supabase
        .from("mates")
        .select("requester_id")
        .eq("id", requestId)
        .single();

      if (mateData) {
        const userName = user.user_metadata?.full_name || "Someone";
        await notifyMateAccepted(mateData.requester_id, user.id, userName);
      }

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
      await fetchMateSuggestions();
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
    m.mate.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mates</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-200 cursor-pointer relative ${
              activeTab === tab.id
                ? "text-teal-700 border-b-2 border-teal-500"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? "bg-teal-100 text-teal-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "discover" && (
        <div className="mb-8">
          {/* Suggested Mates Header with Trust Building */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-700">
                Suggested mates
              </h3>
              <button
                onClick={() => navigate("/app/profile")}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
              >
                Improve suggestions
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Based on your location and favorite sports
            </p>
          </div>

          <SuggestedMatesCarousel
            items={suggestedMates.map((sugg) => ({
              ...sugg,
              requested:
                actionLoading === null &&
                outgoingRequests.some((r) => r.receiver.id === sugg.profile.id),
              loading: actionLoading === sugg.profile.id,
            }))}
            onAddMate={sendMateRequest}
            isLoading={loadingSuggestions}
          />
        </div>
      )}

      {/* Search (only in Discover and Mates tab) */}
      {(activeTab === "discover" || activeTab === "mates") && (
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
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
          />
          {isSearching && (
            <Loader2
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
              size={20}
            />
          )}
        </div>
      )}

      {/* Discover Tab: Search Results (when searching for new people) */}
      {activeTab === "discover" &&
        searchQuery.length >= 2 &&
        searchResults.length > 0 && (
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
                  <div className="w-12 h-12 bg-slate-400 rounded-full flex items-center justify-center text-white font-semibold">
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
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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

      {/* Discover Tab: No search results */}
      {activeTab === "discover" &&
        searchQuery.length >= 2 &&
        searchResults.length === 0 &&
        !isSearching && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center text-slate-500">
            No users found matching "{searchQuery}"
          </div>
        )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-teal-500" size={32} />
        </div>
      )}

      {/* Content based on active tab */}
      {!loading && (
        <>
          {/* Discover Tab: show nothing if no search, or search results above */}
          {activeTab === "discover" && searchQuery.length < 2 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="text-slate-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Find new mates
              </h3>
              <p className="text-slate-500 text-center">
                Search for people to send mate requests
              </p>
            </div>
          )}

          {/* Requests Tab: incoming and outgoing requests */}
          {activeTab === "requests" && (
            <>
              {/* Incoming Requests */}
              <h3 className="text-base font-semibold text-slate-700 mb-2">
                Incoming requests
              </h3>
              {incomingRequests.length > 0 ? (
                <div className="space-y-2 mb-6">
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
                          className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 cursor-pointer"
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
                          className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-slate-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <X size={16} />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-6 flex flex-col items-center justify-center py-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <Clock className="text-slate-500" size={20} />
                  </div>
                  <p className="text-slate-500">No incoming requests</p>
                </div>
              )}

              {/* Outgoing Requests */}
              <h3 className="text-base font-semibold text-slate-700 mb-2">
                Pending requests
              </h3>
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
                        className="px-3 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <UserPlus className="text-slate-500" size={20} />
                  </div>
                  <p className="text-slate-500">No pending requests</p>
                </div>
              )}
            </>
          )}

          {/* Mates Tab */}
          {activeTab === "mates" && (
            <>
              {filteredMates.length > 0 ? (
                <div className="space-y-2">
                  {filteredMates.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
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
                        onClick={() => setConfirmRemove(connection)}
                        disabled={actionLoading === connection.id}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove mate"
                      >
                        {actionLoading === connection.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <UserMinus size={18} />
                        )}
                      </button>
                      {/* Remove Mate Modal */}
                      <Modal
                        open={!!confirmRemove}
                        onClose={() => setConfirmRemove(null)}
                        title="Remove mate?"
                        confirmLabel="Remove"
                        loading={actionLoading === confirmRemove?.id}
                        onConfirm={() => {
                          if (confirmRemove) removeMate(confirmRemove.id);
                          setConfirmRemove(null);
                        }}
                      >
                        Are you sure you want to remove{" "}
                        <b>{confirmRemove?.mate?.full_name || "this mate"}</b>{" "}
                        from your mates?
                        <br />
                        This action cannot be undone.
                      </Modal>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="text-slate-500" size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No mates yet
                  </h3>
                  <p className="text-slate-500 text-center">
                    Search for people in Discover to add your first mate
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
