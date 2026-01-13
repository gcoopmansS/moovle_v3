import { Outlet, useNavigate } from "react-router-dom";
import { Bell, User, Calendar } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import Sidebar from "./Sidebar";

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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
      // Get recent notifications with related data
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
          .limit(10);

      if (notificationsError) throw notificationsError;

      setNotifications(notificationsData || []);

      // Count unread notifications
      const unreadNotifications = (notificationsData || []).filter(
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
              onClick={() => setShowDropdown(!showDropdown)}
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
                      className="text-xs text-coral-600 hover:text-coral-700 font-medium"
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
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          if (!notification.is_read) {
                            markAsRead(notification.id);
                          }
                          // Handle navigation based on notification type
                          if (notification.related_activity_id) {
                            navigate("/agenda");
                          } else if (notification.type === "mate_request") {
                            navigate("/mates");
                          }
                          setShowDropdown(false);
                        }}
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
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-coral-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* View All Link */}
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          navigate("/notifications");
                          setShowDropdown(false);
                        }}
                        className="w-full text-center text-sm text-coral-600 hover:text-coral-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
