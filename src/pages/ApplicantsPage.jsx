import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FiCalendar,
  FiDollarSign,
  FiMessageCircle,
  FiCheck,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiAward,
  FiSearch,
  FiUser,
  FiFileText,
  FiAlertCircle,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { EmptyState } from "../Components/EmptyState";
import { MessageModal } from "../Components/MessageModal";
import { UserAvatar } from "../Components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { getEmployerApplications, updateApplicationStatus } from "../lib/applications";
import { notifyApplicationAccepted } from "../lib/notifications";
import { formatBudget, formatDate } from "../lib/constants";
import { getJobsByUser } from "../lib/jobs";
import { getOrCreateConversation } from "../lib/messages";

export const ApplicantsPage = () => {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hasJobs, setHasJobs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const jobs = await getJobsByUser(user.id);
        setHasJobs(jobs.length > 0);

        if (jobs.length > 0) {
          const apps = await getEmployerApplications(user.id);
          setApplications(apps);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const handleMessage = async (app) => {
    try {
      const conversation = await getOrCreateConversation({
        jobId: app.job_id,
        employerId: user.id,
        applicantId: app.applicant_id,
      });
      setMessageModal({
        conversation,
        otherUser: app.users,
        jobTitle: app.jobs?.title,
        applicantName: app.full_name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (app) => {
    try {
      setAcceptingId(app.id);
      await updateApplicationStatus(app.id, "accepted");
      
      // Update local state to mark as accepted
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, status: "accepted" } : a
        )
      );

      toast.success("Application accepted!");
      
      // Send notification async (don't block on failure)
      // console.log("📢 Sending acceptance notification:", {
      //   applicantId: app.applicant_id,
      //   jobTitle: app.jobs?.title,
      //   employerName: profile?.username,
      //   senderId: user.id,
      // });
      notifyApplicationAccepted({
        applicantId: app.applicant_id,
        jobTitle: app.jobs?.title,
        employerName: profile?.username,
        senderId: user.id,
        jobId: app.job_id,
      }).catch((err) => console.error("❌ Acceptance notification error:", err));
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept application");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDecline = async (app) => {
    try {
      setDecliningId(app.id);
      await updateApplicationStatus(app.id, "rejected");
      
      // Update local state to mark as rejected
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, status: "rejected" } : a
        )
      );

      toast.success("Application declined!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to decline application");
    } finally {
      setDecliningId(null);
    }
  };

  const handleComplete = async (app) => {
    try {
      setAcceptingId(app.id);
      await updateApplicationStatus(app.id, "completed");
      
      // Update local state to mark as completed
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, status: "completed" } : a
        )
      );

      toast.success("Task marked as complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete task");
    } finally {
      setAcceptingId(null);
    }
  };

  const sortedApplications = React.useMemo(() => {
    let filtered = applications;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    return [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle nested properties like "jobs.title" or "full_name"
      if (sortConfig.key.includes(".")) {
        const keys = sortConfig.key.split(".");
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [applications, sortConfig, filterStatus]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <FiArrowUp className="w-3 h-3 text-gray-300" />;
    return sortConfig.direction === "asc" ? (
      <FiArrowUp className="w-3 h-3" />
    ) : (
      <FiArrowDown className="w-3 h-3" />
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
      accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
      rejected: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
      completed: { bg: "bg-green-50", text: "text-green-700", label: "Completed" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bg} ${config.text} text-xs font-semibold`}>
        <FiCheck className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasJobs) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <EmptyState
            type="noJobs"
            title="You haven't created any jobs yet"
            message="Create your first job and start receiving applications from talented freelancers."
            actionLabel="Create Job"
            actionTo="/my-jobs"
          />
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <EmptyState
            type="noApplications"
            title="No applications yet"
            message="Your job is live and waiting for talented freelancers to apply."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Applicants</h1>
          <p className="mt-2 text-gray-500">
            People who applied to your job postings...
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["all", "pending", "accepted", "completed", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filterStatus === status
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-brand-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="ml-2 inline-block bg-gray-200 rounded-full w-5 h-5 text-center text-xs">
                  {applications.filter((a) => a.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Responsive Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("full_name")}>
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Applicant <SortIcon column="full_name" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("jobs.title")}>
                    <div className="flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Job <SortIcon column="jobs.title" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-4 h-4" />
                      Proposal
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4" />
                      Status <SortIcon column="status" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <FiSettings className="w-4 h-4" />
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedApplications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="inline-flex flex-col items-center">
                        <FiSearch className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-600 text-lg font-semibold">No applications found</p>
                        
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={app.users}
                            size="sm"
                            linkTo={`/profile/${app.users?.id}`}
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/profile/${app.users?.id}`}
                              className="font-semibold text-sm text-gray-900 hover:text-brand-600 transition-colors block truncate"
                            >
                              {app.full_name}
                            </Link>
                            <p className="text-xs text-gray-500 truncate">{app.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <Link
                            to={`/jobs/${app.jobs?.id}`}
                            className="font-semibold text-sm text-gray-900 hover:text-brand-600 transition-colors block truncate"
                          >
                            {app.jobs?.title}
                          </Link>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-brand-600 whitespace-nowrap">
                              <FiDollarSign className="w-3 h-3" />
                              {formatBudget(app.jobs?.budget)}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <FiCalendar className="w-3 h-3" />
                              {formatDate(app.jobs?.deadline)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {app.message || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {app.status === "accepted" && (
                            <button
                              onClick={() => handleMessage(app)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-all font-medium text-xs"
                              title="Send Message"
                            >
                              <FiMessageCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Message</span>
                            </button>
                          )}
                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(app)}
                                disabled={acceptingId === app.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all font-medium text-xs disabled:opacity-50"
                                title="Accept Application"
                              >
                                <FiCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">{acceptingId === app.id ? "..." : "Accept"}</span>
                              </button>
                              <button
                                onClick={() => handleDecline(app)}
                                disabled={decliningId === app.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all font-medium text-xs disabled:opacity-50"
                                title="Decline Application"
                              >
                                <FiX className="w-4 h-4" />
                                <span className="hidden sm:inline">{decliningId === app.id ? "..." : "Decline"}</span>
                              </button>
                            </>
                          )}
                          {app.status === "accepted" && app.status !== "completed" && (
                            <button
                              onClick={() => handleComplete(app)}
                              disabled={acceptingId === app.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all font-medium text-xs disabled:opacity-50"
                              title="Mark task as complete"
                            >
                              <FiCheck className="w-4 h-4" />
                              <span className="hidden sm:inline">{acceptingId === app.id ? "..." : "Complete"}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {messageModal && (
        <MessageModal
          isOpen={!!messageModal}
          onClose={() => setMessageModal(null)}
          conversation={messageModal.conversation}
          currentUserId={user.id}
          otherUser={messageModal.otherUser}
          jobTitle={messageModal.jobTitle}
          applicantName={messageModal.applicantName}
        />
      )}
    </div>
  );
};