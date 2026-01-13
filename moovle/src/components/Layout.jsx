import { Outlet } from "react-router-dom";
import { Bell, User, Calendar, Check, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { notifyMateAccepted } from "../lib/notifications";
import Sidebar from "./Sidebar";
import ActivityModal from "./ActivityModal";

export default function Layout() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Global activity modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalLoading, setModalLoading] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications and unread count
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get the 20 most recent notifications with related data
      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("notifications")
          .select(
            `
          *,
          related_user:profiles!related_user_id(id, full_name, avatar_url),
          related_activity:activities!related_activity_id(id, title, sport, date_time)
        `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

      if (notificationsError) throw notificationsError;

      // For mate request notifications, check if they've been handled
      const processedNotifications = await Promise.all(
        (notificationsData || []).map(async (notification) => {
          if (
            notification.type === "mate_request" &&
            notification.related_user_id
          ) {
            // Check if there's still a pending mate request
            const { data: mateRequest } = await supabase
              .from("mates")
              .select("id, status")
              .eq("requester_id", notification.related_user_id)
              .eq("receiver_id", user.id)
              .single();

            if (!mateRequest) {
              // No mate request found = declined
              return { ...notification, mate_request_handled: "declined" };
            } else if (mateRequest.status === "accepted") {
              // Found with accepted status
              return { ...notification, mate_request_handled: "accepted" };
            } else if (mateRequest.status === "pending") {
              // Still pending
              return { ...notification, mate_request_handled: null };
            } else {
              // Any other status (declined, etc.)
              return { ...notification, mate_request_handled: "declined" };
            }
          }
          return notification;
        })
      );

      setNotifications(processedNotifications);

      // Count unread notifications
      const unreadNotifications = processedNotifications.filter(
        (n) => !n.is_read
      );
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  // Listen for activity modal events from notifications
  useEffect(() => {
    const handleOpenActivityModal = async (event) => {
      const { activityId } = event.detail;

      // Fetch the full activity data
      try {
        const { data: activityData, error } = await supabase
          .from("activities")
          .select(
            `
            *,
            profiles:creator_id(full_name, avatar_url)
          `
          )
          .eq("id", activityId)
          .single();

        if (error) {
          console.error("Error fetching activity:", error);
          return;
        }

        if (activityData) {
          setSelectedActivity(activityData);
          setActivityModalOpen(true);
        }
      } catch (err) {
        console.error("Error opening activity modal:", err);
      }
    };

    window.addEventListener("openActivityModal", handleOpenActivityModal);

    return () => {
      window.removeEventListener("openActivityModal", handleOpenActivityModal);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Accept mate request from notification
  const acceptMateRequest = async (requesterId) => {
    try {
      // First, find the mate request ID
      const { data: mateRequest, error: findError } = await supabase
        .from("mates")
        .select("id")
        .eq("requester_id", requesterId)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .single();

      if (findError || !mateRequest) {
        console.error("Could not find mate request:", findError);
        return;
      }

      // Update the mate request status
      const { error } = await supabase
        .from("mates")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", mateRequest.id);

      if (error) throw error;

      // Send acceptance notification to requester
      const userName = user.user_metadata?.full_name || "Someone";
      await notifyMateAccepted(requesterId, user.id, userName);

      // Mark the mate request notification as read and update locally
      const notificationToUpdate = notifications.find(
        (n) => n.type === "mate_request" && n.related_user_id === requesterId
      );

      if (notificationToUpdate && !notificationToUpdate.is_read) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationToUpdate.id);
      }

      // Update local state - mark notification as read and add accepted flag
      setNotifications((prev) =>
        prev.map((n) =>
          n.type === "mate_request" && n.related_user_id === requesterId
            ? { ...n, is_read: true, mate_request_handled: "accepted" }
            : n
        )
      );

      // Update unread count
      if (notificationToUpdate && !notificationToUpdate.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Dispatch custom event to notify other components (like Mates page)
      window.dispatchEvent(
        new CustomEvent("mateRequestUpdated", {
          detail: {
            type: "accepted",
            requesterId,
            mateRequestId: mateRequest.id,
          },
        })
      );
    } catch (error) {
      console.error("Error accepting mate request:", error);
    }
  };

  // Decline mate request from notification
  const declineMateRequest = async (requesterId) => {
    try {
      // First, find the mate request ID
      const { data: mateRequest, error: findError } = await supabase
        .from("mates")
        .select("id")
        .eq("requester_id", requesterId)
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .single();

      if (findError || !mateRequest) {
        console.error("Could not find mate request:", findError);
        return;
      }

      // Delete the mate request
      const { error } = await supabase
        .from("mates")
        .delete()
        .eq("id", mateRequest.id);

      if (error) throw error;

      // Mark the mate request notification as read and update locally
      const notificationToUpdate = notifications.find(
        (n) => n.type === "mate_request" && n.related_user_id === requesterId
      );

      if (notificationToUpdate && !notificationToUpdate.is_read) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notificationToUpdate.id);
      }

      // Update local state - mark notification as read and add declined flag
      setNotifications((prev) =>
        prev.map((n) =>
          n.type === "mate_request" && n.related_user_id === requesterId
            ? { ...n, is_read: true, mate_request_handled: "declined" }
            : n
        )
      );

      // Update unread count
      if (notificationToUpdate && !notificationToUpdate.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Dispatch custom event to notify other components (like Mates page)
      window.dispatchEvent(
        new CustomEvent("mateRequestUpdated", {
          detail: {
            type: "declined",
            requesterId,
            mateRequestId: mateRequest.id,
          },
        })
      );
    } catch (error) {
      console.error("Error declining mate request:", error);
    }
  };

  // Activity join/leave functions for the global modal
  const handleJoinActivity = async (activity) => {
    if (modalLoading[activity.id]) return;

    setModalLoading((prev) => ({ ...prev, [activity.id]: true }));

    try {
      const { error } = await supabase.from("activity_participants").insert({
        activity_id: activity.id,
        user_id: user.id,
      });

      if (error) {
        console.error("Error joining activity:", error);
        return;
      }

      // Close modal after successful join
      setActivityModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error("Error joining activity:", err);
    } finally {
      setModalLoading((prev) => ({ ...prev, [activity.id]: false }));
    }
  };

  const handleLeaveActivity = async (activity) => {
    if (modalLoading[activity.id]) return;

    setModalLoading((prev) => ({ ...prev, [activity.id]: true }));

    try {
      const { error } = await supabase
        .from("activity_participants")
        .delete()
        .eq("activity_id", activity.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error leaving activity:", error);
        return;
      }

      // Close modal after successful leave
      setActivityModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error("Error leaving activity:", err);
    } finally {
      setModalLoading((prev) => ({ ...prev, [activity.id]: false }));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "mate_request":
      case "mate_accepted":
        return <User size={16} className="text-blue-500" />;
      case "activity_invite":
      case "activity_joined":
      case "activity_reminder":
        return <Calendar size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 p-8 flex justify-center">
        <div className="w-full max-w-4xl relative">
          {/* Notification Bell - Fixed Position */}
          <div className="fixed top-8 right-8 z-50" ref={dropdownRef}>
            <button
              onClick={() => {
                const wasClosing = showDropdown;
                setShowDropdown(!showDropdown);

                // Auto-mark all as read when opening the dropdown
                if (!wasClosing && unreadCount > 0) {
                  markAllAsRead();
                }
              }}
              className={`p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                showDropdown ? "bg-coral-50" : ""
              }`}
              aria-label="Notifications"
            >
              <div className="relative">
                <Bell
                  size={24}
                  className={showDropdown ? "text-coral-600" : "text-slate-600"}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-coral-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Notifications Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-coral-600 hover:text-coral-700 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="px-4 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-slate-500">Loading...</p>
                  </div>
                )}

                {/* Empty State */}
                {!loading && notifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      No notifications yet
                    </p>
                  </div>
                )}

                {/* Notifications List */}
                {!loading && notifications.length > 0 && (
                  <div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-gray-50 ${
                          !notification.is_read ? "bg-blue-50" : ""
                        } ${
                          notification.type !== "mate_request"
                            ? "hover:bg-gray-50 cursor-pointer"
                            : ""
                        }`}
                        onClick={
                          notification.type !== "mate_request"
                            ? () => {
                                if (!notification.is_read) {
                                  markAsRead(notification.id);
                                }
                                // Handle navigation based on notification type
                                if (
                                  notification.related_activity_id &&
                                  notification.type !== "mate_request"
                                ) {
                                  // Dispatch event to open activity modal on current page
                                  const activityEvent = new CustomEvent(
                                    "openActivityModal",
                                    {
                                      detail: {
                                        activityId:
                                          notification.related_activity_id,
                                        activityData:
                                          notification.related_activity,
                                      },
                                    }
                                  );
                                  window.dispatchEvent(activityEvent);
                                }
                                setShowDropdown(false);
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>

                            {/* Mate Request Action Buttons */}
                            {notification.type === "mate_request" && (
                              <div className="flex items-center gap-2 mt-3">
                                {notification.mate_request_handled ===
                                "accepted" ? (
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md">
                                    <Check size={12} />
                                    Accepted
                                  </div>
                                ) : notification.mate_request_handled ===
                                  "declined" ? (
                                  <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-md">
                                    <X size={12} />
                                    Declined
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        acceptMateRequest(
                                          notification.related_user_id
                                        );
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                                    >
                                      <Check size={12} />
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        declineMateRequest(
                                          notification.related_user_id
                                        );
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                                    >
                                      <X size={12} />
                                      Decline
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-coral-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Outlet />

          {/* Global Activity Modal */}
          {selectedActivity &&
            (() => {
              const isHost = selectedActivity.creator_id === user.id;
              // For simplicity, assume not joined since we don't fetch this data globally
              // The modal will still show the correct join/leave buttons
              const joined = false;
              const currentCount = 1; // Host counts as 1, simplified for global modal

              return (
                <ActivityModal
                  activity={selectedActivity}
                  open={activityModalOpen}
                  onClose={() => {
                    setActivityModalOpen(false);
                    setSelectedActivity(null);
                  }}
                  joined={joined}
                  isHost={isHost}
                  currentCount={currentCount}
                  onJoin={() => handleJoinActivity(selectedActivity)}
                  onLeave={() => handleLeaveActivity(selectedActivity)}
                  loading={modalLoading[selectedActivity.id] || false}
                />
              );
            })()}
        </div>
      </main>
    </div>
  );
}
