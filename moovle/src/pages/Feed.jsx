import { useState, useEffect } from "react";
import { Search, Plus, Activity, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { supabase } from "../lib/supabase";
import { sports } from "../config/sports";
import { notifyActivityJoined, notifyActivityLeft } from "../lib/notifications";
import ActivityCard from "../components/ActivityCard";
import EmptyState from "../components/EmptyState";
import NudgeCard from "../components/NudgeCard";
import Modal from "../components/Modal";

const dateFilters = ["All", "Today", "Tomorrow", "This Week"];

// Build sport filters from config (add "All Sports" option)
const sportFilters = [
  { id: "all", label: "All Sports", icon: null },
  ...sports.map((sport) => ({
    id: sport.id,
    label: sport.label,
    icon: sport.icon,
  })),
];

export default function Feed() {
  const { profile, user } = useAuth();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({}); // { [activityId]: count }
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState({}); // { [activityId]: boolean }
  const [joinedIds, setJoinedIds] = useState([]); // [activityId]
  const [invitedActivityIds, setInvitedActivityIds] = useState([]); // [activityId]
  const [matesCount, setMatesCount] = useState(0);
  const [createdActivitiesCount, setCreatedActivitiesCount] = useState(0);

  // Modal state for leave confirmation
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [activityToLeave, setActivityToLeave] = useState(null);

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    fetchActivities();
    fetchJoinedActivities();
    fetchNudgeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedSport]);

  // Fetch participant counts for all activities
  useEffect(() => {
    if (activities.length === 0) return;
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("activity_participants")
        .select("activity_id")
        .in(
          "activity_id",
          activities.map((a) => a.id),
        );
      if (!error && data) {
        // data: [{ activity_id, count }]
        const counts = {};
        data.forEach((row) => {
          counts[row.activity_id] = (counts[row.activity_id] || 0) + 1;
        });
        setParticipantCounts(counts);
      }
    };
    fetchCounts();
  }, [activities]);

  // Fetch activities user has joined (for button state)
  const fetchJoinedActivities = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("activity_participants")
      .select("activity_id")
      .eq("user_id", user.id);
    if (!error && data) {
      setJoinedIds(data.map((a) => a.activity_id));
    }
  };
  // Join activity handler
  const handleJoin = async (activity) => {
    if (!user) return;
    setJoining((j) => ({ ...j, [activity.id]: true }));

    // Make the API call
    const { error } = await supabase
      .from("activity_participants")
      .insert({ activity_id: activity.id, user_id: user.id });

    if (error) {
      console.error("Error joining activity:", error);
      showToast({
        type: "error",
        title: "Failed to Join",
        message: "Could not join the activity. Please try again.",
      });
    } else {
      showToast({
        type: "success",
        title: "Joined Activity!",
        message: `You've successfully joined ${activity.title}.`,
      });

      // Send notification to activity creator if join was successful
      if (activity.creator_id !== user.id) {
        const userName =
          profile?.full_name || user.user_metadata?.full_name || "Someone";
        await notifyActivityJoined(
          activity.creator_id,
          user.id,
          userName,
          activity.id,
          activity.title,
        );
      }

      // Refetch only this activity to ensure consistency
      await refetchActivity(activity.id);
    }

    setJoining((j) => ({ ...j, [activity.id]: false }));
  };

  // Leave activity handler
  const handleLeave = async (activity) => {
    if (!user) return;
    setJoining((j) => ({ ...j, [activity.id]: true }));

    // Make the API call
    const { error } = await supabase
      .from("activity_participants")
      .delete()
      .eq("activity_id", activity.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error leaving activity:", error);
      showToast({
        type: "error",
        title: "Failed to Leave",
        message: "Could not leave the activity. Please try again.",
      });
    } else {
      showToast({
        type: "success",
        title: "Left Activity",
        message: `You've left ${activity.title}.`,
      });

      // Send notification to activity creator if leave was successful
      if (activity.creator_id !== user.id) {
        const userName =
          profile?.full_name || user.user_metadata?.full_name || "Someone";
        await notifyActivityLeft(
          activity.creator_id,
          user.id,
          userName,
          activity.id,
          activity.title,
        );
      }

      // Refetch only this activity to ensure consistency
      await refetchActivity(activity.id);
    }

    setJoining((j) => ({ ...j, [activity.id]: false }));
  };

  // Refetch specific activity data
  const refetchActivity = async (activityId) => {
    try {
      // Fetch updated activity data
      const { data: activityData, error: activityError } = await supabase
        .from("activities")
        .select(
          `
          *,
          organizer:profiles!creator_id(id, full_name, avatar_url),
          participants:activity_participants(user_id, profiles(id, full_name, avatar_url))
        `,
        )
        .eq("id", activityId)
        .single();

      if (activityError) {
        console.error("Error refetching activity:", activityError);
        return;
      }

      console.log("Refetched activity data:", activityData);
      console.log("Participants structure:", activityData.participants);

      // Transform participants data to match expected structure (same as fetchActivities)
      let participants = [];
      if (Array.isArray(activityData.participants)) {
        // Only include valid profiles with a non-empty full_name
        participants = activityData.participants
          .map((p) => p.profiles || p)
          // Only include valid profiles with a non-empty full_name
          .filter((p) => p && p.full_name && p.full_name.trim().length > 0);
      }

      // Always include organizer as a participant if not already in the list
      if (
        activityData.organizer &&
        typeof activityData.organizer.full_name === "string" &&
        activityData.organizer.full_name.trim().length > 0
      ) {
        const alreadyIncluded = participants.some(
          (p) => p.id === activityData.organizer.id,
        );
        if (!alreadyIncluded) {
          participants = [activityData.organizer, ...participants];
        }
      }

      // Update activity with transformed participants
      activityData.participants = participants;

      console.log("Transformed participants:", activityData.participants);

      // Update the specific activity in state
      setActivities((prev) =>
        prev.map((a) => (a.id === activityId ? activityData : a)),
      );

      // Update participant count for this activity (exclude organizer since they're always included)
      const participantCount = participants.length - 1; // Subtract 1 for organizer
      setParticipantCounts((prev) => ({
        ...prev,
        [activityId]: Math.max(0, participantCount),
      }));

      // Update joined status
      const isJoined = participants.some((p) => p.id === user.id) || false;
      setJoinedIds((prev) => {
        const filtered = prev.filter((id) => id !== activityId);
        return isJoined ? [...filtered, activityId] : filtered;
      });
    } catch (error) {
      console.error("Error refetching activity:", error);
    }
  };

  // Handle opening activity details modal
  const handleActivityClick = (activity) => {
    console.log("Activity clicked:", activity);
    // Dispatch event to open global activity modal
    const activityEvent = new CustomEvent("openActivityModal", {
      detail: {
        activityId: activity.id,
        activityData: activity,
      },
    });
    window.dispatchEvent(activityEvent);
  };

  // Fetch data needed for nudge decisions
  const fetchNudgeData = async () => {
    if (!user) return;

    try {
      // Fetch mates count
      const { data: matesData } = await supabase
        .from("mates")
        .select("id", { count: "exact" })
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

      setMatesCount(matesData?.length || 0);

      // Fetch created activities count
      const { data: activitiesData } = await supabase
        .from("activities")
        .select("id", { count: "exact" })
        .eq("creator_id", user.id);

      setCreatedActivitiesCount(activitiesData?.length || 0);
    } catch (error) {
      console.error("Error fetching nudge data:", error);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // First, get user's mate IDs for visibility filtering
      let mateIds = [];
      let userInvitedActivityIds = [];

      if (user) {
        // Fetch mates
        const { data: matesData } = await supabase
          .from("mates")
          .select("requester_id, receiver_id")
          .eq("status", "accepted")
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

        if (matesData) {
          mateIds = matesData.map((m) =>
            m.requester_id === user.id ? m.receiver_id : m.requester_id,
          );
        }

        // Fetch activity invitations for the user
        const { data: invitesData } = await supabase
          .from("activity_invites")
          .select("activity_id")
          .eq("invitee_id", user.id)
          .in("status", ["pending", "accepted"]);

        if (invitesData) {
          userInvitedActivityIds = invitesData.map(
            (invite) => invite.activity_id,
          );
        }
      }

      // Store invited activity IDs in state for use in rendering
      setInvitedActivityIds(userInvitedActivityIds);

      let query = supabase
        .from("activities")
        .select(
          `
          *,
          organizer:profiles!creator_id(id, full_name, avatar_url),
          participants:activity_participants(user_id, profiles(id, full_name, avatar_url))
        `,
        )
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true });

      // Apply sport filter
      if (selectedSport !== "all") {
        query = query.eq("sport", selectedSport);
      }

      // Apply date filter
      if (selectedDate === "Today") {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte("date_time", today.toISOString())
          .lt("date_time", tomorrow.toISOString());
      } else if (selectedDate === "This Week") {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query
          .gte("date_time", today.toISOString())
          .lt("date_time", nextWeek.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activities:", error);
      } else {
        // Filter activities based on visibility permissions
        const visibleActivities = (data || []).filter((activity) => {
          // User can always see their own activities
          if (activity.creator_id === user?.id) {
            return true;
          }

          // Apply visibility rules
          switch (activity.visibility) {
            case "public":
              return true; // Everyone can see public activities
            case "mates":
              // Only mates can see mates-only activities
              return mateIds.includes(activity.creator_id);
            case "invite_only":
              // For invite-only activities, check if user was invited
              return userInvitedActivityIds.includes(activity.id);
            default:
              return true; // Default to public if visibility is not set
          }
        });

        // Map participants to flat array of {id, full_name, avatar_url}
        const activitiesWithParticipants = visibleActivities.map((activity) => {
          let participants = [];
          if (Array.isArray(activity.participants)) {
            // Only include valid profiles with a non-empty full_name
            participants = activity.participants
              .map((p) => p.profiles || p)
              // Only include valid profiles with a non-empty full_name
              .filter((p) => p && p.full_name && p.full_name.trim().length > 0);
          }
          // Always include organizer as a participant if not already in the list
          if (
            activity.organizer &&
            typeof activity.organizer.full_name === "string" &&
            activity.organizer.full_name.trim().length > 0
          ) {
            const alreadyIncluded = participants.some(
              (p) => p.id === activity.organizer.id,
            );
            if (!alreadyIncluded) {
              participants = [activity.organizer, ...participants];
            }
          }
          return { ...activity, participants };
        });
        setActivities(activitiesWithParticipants);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Determine which nudge to show (priority order)
  const getNudgeToShow = () => {
    if (!user || !profile) return null;

    // 1. Check if profile.favorite_sports is empty
    if (!profile.favorite_sports || profile.favorite_sports.length === 0) {
      return {
        nudgeKey: "favorite_sports",
        title: "Add your favorite sports",
        description:
          "Tell us what sports you love to get better activity suggestions tailored for you.",
        ctaText: "Add favorite sports",
        ctaTo: "/app/profile",
      };
    }

    // 2. Check if user has 0 mates
    if (matesCount === 0) {
      return {
        nudgeKey: "find_mates",
        title: "Find mates near you",
        description:
          "Connect with other sports enthusiasts in your area to join activities together.",
        ctaText: "Find mates",
        ctaTo: "/app/mates",
      };
    }

    // 3. Check if user has created 0 activities
    if (createdActivitiesCount === 0) {
      return {
        nudgeKey: "create_activity",
        title: "Create your first activity",
        description:
          "Be the host! Create an activity and invite others to join you.",
        ctaText: "Create activity",
        ctaTo: "/app/create-activity",
      };
    }

    return null;
  };

  const currentNudge = getNudgeToShow();

  return (
    <div className="w-full">
      {/* Leave Confirmation Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setActivityToLeave(null);
        }}
        title="Leave Activity?"
        confirmLabel="Leave"
        loading={activityToLeave ? joining[activityToLeave.id] : false}
        onConfirm={async () => {
          if (activityToLeave) {
            await handleLeave(activityToLeave);
            setLeaveModalOpen(false);
            setActivityToLeave(null);
          }
        }}
      >
        Are you sure you want to leave this activity?
      </Modal>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          Hey, {firstName} 👋
        </h1>
        <p className="text-slate-500">Find activities with your mates</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
      </div>

      {/* Date Filters */}
      <div className="flex gap-2 mb-4">
        {dateFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedDate(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              selectedDate === filter
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Sport Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sportFilters.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedSport === sport.id
                ? "bg-coral-500 text-white"
                : "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {sport.icon && <span>{sport.icon}</span>}
            {sport.label}
          </button>
        ))}
      </div>

      {/* Nudge Component */}
      {currentNudge && (
        <NudgeCard
          title={currentNudge.title}
          description={currentNudge.description}
          ctaText={currentNudge.ctaText}
          ctaTo={currentNudge.ctaTo}
          nudgeKey={currentNudge.nudgeKey}
          userId={user?.id}
        />
      )}

      {/* Conditional Rendering */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-500"></div>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const isHost = activity.creator_id === user.id;
            const joined = joinedIds.includes(activity.id);
            // Get participant count (excluding host) and add host count
            const participantCount = participantCounts[activity.id] ?? 0;
            const currentCount =
              participantCount + (activity.creator_id ? 1 : 0);
            const capacity =
              activity.max_participants || activity.capacity || "∞";

            // Check if user is invited to this invite-only activity
            const isInvited = invitedActivityIds.includes(activity.id);

            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity)}
                isHost={isHost}
                joined={joined}
                loading={joining[activity.id]}
                onJoin={() => handleJoin(activity)}
                onLeave={() => {
                  setLeaveModalOpen(true);
                  setActivityToLeave(activity);
                }}
                currentCount={currentCount}
                capacity={capacity}
                isInvited={isInvited}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-8">
          <EmptyState
            title="No activities found"
            description="No activities match your current filters. Try adjusting your search or be the first to create one!"
            icon={Activity}
            primaryAction={{
              label: "Create Activity",
              to: "/app/create-activity",
            }}
            secondaryAction={{
              label: "Find Mates",
              to: "/app/mates",
            }}
          />
        </div>
      )}
    </div>
  );
}
