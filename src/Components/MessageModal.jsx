import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiSend, FiEdit2, FiMoreVertical } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { UserAvatar } from "./UserAvatar";
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  updateMessage,
} from "../lib/messages";
import { notifyNewMessage } from "../lib/notifications";
import { formatRelativeTime } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

export const MessageModal = ({
  isOpen,
  onClose,
  conversation,
  currentUserId,
  otherUser,
  jobTitle,
  applicantName,
}) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !conversation?.id) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(conversation.id);
        setMessages(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const unsubscribe = subscribeToMessages(conversation.id, (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) {
          // Update existing message (handles edits)
          return prev.map((m) => (m.id === msg.id ? msg : m));
        }
        // Add new message
        return [...prev, msg];
      });
    });

    return unsubscribe;
  }, [isOpen, conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);

      if (editingMessageId) {
        // Update existing message
        const updatedMsg = await updateMessage(editingMessageId, newMessage.trim());
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessageId ? updatedMsg : m))
        );
        toast.success("Message updated");
        setEditingMessageId(null);
      } else {
        // Send new message
        const msg = await sendMessage({
          conversationId: conversation.id,
          senderId: currentUserId,
          content: newMessage.trim(),
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        
        // Send notification async (don't block on failure)
        if (otherUser?.id && jobTitle) {
          // console.log(" Sending notification:", {
          //   recipientId: otherUser.id,
          //   senderName: profile?.username,
          //   jobTitle,
          //   senderId: currentUserId,
          // });
          notifyNewMessage({
            recipientId: otherUser.id,
            senderName: profile?.username,
            jobTitle,
            senderId: currentUserId,
            jobId: conversation?.job_id,
          }).catch((err) => console.error("Notification error:", err));
        }
      }
      
      setNewMessage("");
    } catch (error) {
      console.error(error);
      toast.error(editingMessageId ? "Failed to update message" : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col" style={{ height: "80vh", maxHeight: "600px" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <UserAvatar user={otherUser} size="md" />
            <div>
              <p className="font-semibold text-gray-900">{applicantName || otherUser?.username}</p>
              <p className="text-xs text-gray-500">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IoMdClose className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 pt-2 pb-2">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4 group`}
                    >
                      <div className="flex flex-col gap-1 relative">
                        <div
                          className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                            isOwn
                              ? "bg-brand-500 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-800 rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-2">
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(msg.updated_at || msg.created_at)}
                            {msg.updated_at && msg.updated_at !== msg.created_at && (
                              <span className="ml-1">(edited)</span>
                            )}
                          </p>
                          {isOwn && (
                            <div className="relative">
                              <button
                                onClick={() => setShowMenuId(showMenuId === msg.id ? null : msg.id)}
                                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-gray-200 rounded transition-all"
                                title="Message options"
                              >
                                <FiMoreVertical className="w-4 h-4" />
                              </button>
                              {showMenuId === msg.id && (
                                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setNewMessage(msg.content);
                                      setShowMenuId(null);
                                      setTimeout(() => inputRef.current?.focus(), 0);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 rounded-lg"
                                  >
                                    <FiEdit2 className="w-4 h-4" />
                                    Edit Message
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSend} className="border-t border-gray-100 shrink-0">
          {editingMessageId && (
            <div className="px-6 py-2 bg-green-50 border-b border-green-200 flex items-center justify-between">
              <p className="text-xs font-medium text-green-700">Editing message...</p>
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(null);
                  setNewMessage("");
                }}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2 px-6 py-4">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {editingMessageId ? (
                <>
                  <FiEdit2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Update</span>
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};