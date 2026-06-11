import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FiCalendar,
  FiDollarSign,
  FiMessageCircle,
  FiCheck,
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
import { EmptyState } from "../Components/EmptyState";
import { MessageModal } from "../Components/MessageModal";
import { UserAvatar } from "../Components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { getApplicationsByApplicant } from "../lib/applications";
import { formatBudget, formatDate } from "../lib/constants";
import { getOrCreateConversation } from "../lib/messages";

export const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageModal, setMessageModal] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await getApplicationsByApplicant(user.id);
        setApplications(apps);
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
        employerId: app.jobs?.created_by,
        applicantId: user.id,
      });
      setMessageModal({
        conversation,
        otherUser: app.jobs?.users,
        jobTitle: app.jobs?.title,
      });
    } catch (error) {
      console.error(error);
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
      
      // Handle nested properties like "jobs.title"
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
      pending: { bg: "bg-green-50", text: "text-green-700", label: "Pending" },
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
          <div className="mb-10">
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse mb-2" />
            <div className="h-4 bg-gray-100 rounded w-80 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-gray-100" />
            ))}
          </div>
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
            message="You haven't applied to any jobs yet. Browse available jobs and submit your first application."
            actionLabel="Browse Jobs"
            actionTo="/jobs"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-2 text-gray-500">Jobs you have applied to</p>
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
                      onClick={() => handleSort("jobs.title")}>
                    <div className="flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" />
                      Job Title <SortIcon column="jobs.title" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Employer
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" />
                      Budget & Deadline
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
                    <td colSpan="6" className="px-6 py-16 text-center">
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
                        <Link
                          to={`/jobs/${app.jobs?.id}`}
                          className="font-semibold text-sm text-gray-900 hover:text-brand-600 transition-colors block truncate"
                        >
                          {app.jobs?.title}
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {app.jobs?.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar
                            user={app.jobs?.users}
                            size="sm"
                            linkTo={`/profile/${app.jobs?.users?.id}`}
                          />
                          <Link
                            to={`/profile/${app.jobs?.users?.id}`}
                            className="font-semibold text-sm text-brand-600 hover:underline truncate transition-colors"
                          >
                            {app.jobs?.users?.username}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-sm text-brand-600 whitespace-nowrap">
                            <FiDollarSign className="w-3 h-3" />
                            {formatBudget(app.jobs?.budget)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(app.jobs?.deadline)}
                          </span>
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
                        {app.status === "accepted" && (
                          <button
                            onClick={() => handleMessage(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-all font-medium text-xs"
                            title="Message employer"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Message</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
<div className="mt-8">
  <div className="border-t border-gray-200" />
</div>
<div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
  {/* Total */}
  <div className="group flex gap-4 items-start">
    <div className="p-2.5 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors shrink-0">
      <FiBriefcase className="w-5 h-5 text-brand-600" />
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Total</span>
      <p className="text-3xl font-bold text-gray-900 mb-2">{applications.length}</p>
      <div className="h-0.5 w-12 bg-brand-200 group-hover:w-full transition-all duration-300" />
    </div>
  </div>

  {/* Pending */}
  <div className="group flex gap-4 items-start">
    <div className="p-2.5 rounded-xl bg-green-50 group-hover:bg-amber-100 transition-colors shrink-0">
      <FiClock className="w-5 h-5 text-green-600" />
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pending</span>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {applications.filter(a => a.status === "pending").length}
      </p>
    </div>
  </div>

  {/* Accepted */}
  <div className="group flex gap-4 items-start">
    <div className="p-2.5 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors shrink-0">
      <FiCheckCircle className="w-5 h-5 text-brand-600" />
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Accepted</span>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {applications.filter(a => a.status === "accepted").length}
      </p>
      <div className="h-0.5 w-12 bg-brand-200 group-hover:w-full transition-all duration-300" />
    </div>
  </div>

  {/* Completed */}
  <div className="group flex gap-4 items-start">
    <div className="p-2.5 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors shrink-0">
      <FiAward className="w-5 h-5 text-brand-600" />
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Completed</span>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {applications.filter(a => a.status === "completed").length}
      </p>
      <div className="h-0.5 w-12 bg-brand-200 group-hover:w-full transition-all duration-300" />
    </div>
  </div>
</div>

<div className="mt-8">
  <div className="border-t border-gray-200" />
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
        />
      )}
    </div>
  );
};