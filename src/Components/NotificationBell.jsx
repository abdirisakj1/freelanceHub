import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiBell, FiCheck, FiTrash2, FiBriefcase, FiMessageSquare, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications,
} from "../lib/notifications";
import { getConversationsByJobId } from "../lib/messages";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../lib/constants";

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        const data = await getNotifications(user.id);
        // console.log("✅ Loaded notifications:", data);
        setNotifications(data);
        const count = data.filter((n) => !n.is_read).length;
        setUnreadCount(count);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error loading notifications:", error);
        setLoading(false);
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(user.id, (payload) => {
      // console.log("📬 Realtime notification payload:", payload);
      
      // Check for INSERT event
      if (payload.eventType === "INSERT" || payload.event === "INSERT") {
        // console.log("✨ New notification received:", payload.new);
        setNotifications((prev) => [payload.new, ...prev]);
        setUnreadCount((prev) => prev + 1);
      } 
      // Check for UPDATE event
      else if (payload.eventType === "UPDATE" || payload.event === "UPDATE") {
        // console.log("📝 Updated notification:", payload.new);
        setNotifications((prev) =>
          prev.map((n) => (n.id === payload.new.id ? payload.new : n))
        );
        if (!payload.new.is_read && payload.old?.is_read) {
          setUnreadCount((prev) => prev + 1);
        } else if (payload.new.is_read && !payload.old?.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } 
      // Check for DELETE event
      else if (payload.eventType === "DELETE" || payload.event === "DELETE") {
        // console.log("🗑️ Deleted notification:", payload.old);
        setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        if (!payload.old?.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    });

    // Fallback: Poll for notifications every 10 seconds if real-time isn't working
    const pollInterval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      unsubscribe();
    };
  }, [user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId, isRead) => {
    try {
      if (!isRead) {
        await markNotificationAsRead(notificationId);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notification");
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    await handleMarkAsRead(notification.id, notification.is_read);
    
    // Navigate based on notification type
    if (notification.type === "application") {
      // Employer viewing new applications
      navigate("/applicants");
    } else if (notification.type === "acceptance") {
      // Applicant viewing accepted notifications
      navigate("/my-applications");
    } else if (notification.type === "message" && notification.job_id) {
      // Intelligent routing for message notifications based on user role
      try {
        const conversations = await getConversationsByJobId(notification.job_id);
        if (conversations && conversations.length > 0) {
          const conversation = conversations[0];
          // Check if current user is the employer (job owner)
          if (user.id === conversation.employer_id) {
            navigate("/applicants");
          } else if (user.id === conversation.applicant_id) {
            navigate("/my-applications");
          }
        }
      } catch (error) {
        console.error("Error determining user role for message notification:", error);
        // Fallback to my-applications
        navigate("/my-applications");
      }
    } else {
      // Fallback for message notifications without job_id
      navigate("/my-applications");
    }
    
    setIsOpen(false);
  };

  const handleRefreshNotifications = async () => {
    try {
      const data = await getNotifications(user.id);
      // console.log(" Refreshed notifications:", data);
      setNotifications(data);
      const count = data.filter((n) => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error("❌ Error refreshing notifications:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = "w-5 h-5";
    switch (type) {
      case "application":
        return <FiBriefcase className={iconProps} />;
      case "message":
        return <FiMessageSquare className={iconProps} />;
      case "acceptance":
        return <FiCheckCircle className={iconProps} />;
      default:
        return <FiBell className={iconProps} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) handleRefreshNotifications();
        }}
        className="relative p-2 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        title="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl z-40 overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">
                Notifications {unreadCount > 0 && <span className="text-brand-600 text-sm">({unreadCount})</span>}
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No notifications yet</p>
              </div>
            ) : (
               <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      !notification.is_read ? "bg-brand-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3 flex-1 min-w-0">
                      <span className="text-brand-600 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
