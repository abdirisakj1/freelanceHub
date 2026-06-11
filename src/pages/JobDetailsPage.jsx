import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  FiCalendar,
  FiDollarSign,
  FiMessageCircle,
} from "react-icons/fi";
import { ApplyModal } from "../Components/ApplyModal";
import { MessageModal } from "../Components/MessageModal";
import { UserAvatar } from "../Components/UserAvatar";
import { useAuth } from "../context/AuthContext";
import { getApplicationsByJob, hasApplied } from "../lib/applications";
import {
  DEFAULT_JOB_IMAGE,
  formatBudget,
  formatDate,
} from "../lib/constants";
import { getJobById } from "../lib/jobs";
import { getOrCreateConversation } from "../lib/messages";

export const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [messageModal, setMessageModal] = useState(null);

  const isOwner = user?.id === job?.created_by;

  useEffect(() => {
    const load = async () => {
      try {
        const jobData = await getJobById(id);
        setJob(jobData);

        if (user?.id === jobData.created_by) {
          const apps = await getApplicationsByJob(id);
          setApplications(apps);
        }

        if (user) {
          const applied = await hasApplied(id, user.id);
          setAlreadyApplied(applied);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const handleMessageApplicant = async (app) => {
    try {
      const conversation = await getOrCreateConversation({
        jobId: id,
        employerId: user.id,
        applicantId: app.applicant_id,
      });
      setMessageModal({
        conversation,
        otherUser: app.users,
        jobTitle: job?.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Job not found</h2>
          <Link to="/jobs" className="btn-primary mt-4 inline-flex">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          <div className="relative h-64 sm:h-80">
            <img
              src={job.image_url || DEFAULT_JOB_IMAGE}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="badge !bg-white/90">{job.category}</span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
                {job.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
                <FiDollarSign className="w-6 h-6" />
                {formatBudget(job.budget)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar className="w-5 h-5 text-gray-400" />
                Deadline: {formatDate(job.deadline)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-gray-500">Posted by</span>
                <UserAvatar
                  user={job.users}
                  size="sm"
                  linkTo={`/profile/${job.users?.id}`}
                />
                <Link
                  to={`/profile/${job.users?.id}`}
                  className="text-brand-600 font-medium hover:underline"
                >
                  {job.users?.username}
                </Link>
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {!isLoggedIn && (
              <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-brand-50 to-brand-100/50 border border-brand-200 text-center">
                <p className="text-brand-900 font-medium">
                  Create an account or login to apply for this job.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link to="/signin" className="btn-primary">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-secondary">
                    Register
                  </Link>
                </div>
              </div>
            )}

            {isLoggedIn && !isOwner && (
              <div className="mt-10">
                {alreadyApplied ? (
                  <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 text-center">
                    <p className="text-brand-700 font-medium">
                      You have applied for this job
                    </p>
                    <Link
                      to="/my-applications"
                      className="inline-block mt-2 text-sm text-brand-600 font-semibold hover:underline"
                    >
                      View in My Applications →
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-primary w-full sm:w-auto"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            )}

            {isOwner && applications.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Applicants ({applications.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors"
                    >
                      <UserAvatar
                        user={app.users}
                        size="lg"
                        linkTo={`/profile/${app.users?.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${app.users?.id}`}
                          className="font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                        >
                          {app.full_name}
                        </Link>
                        <p className="text-sm text-gray-500 truncate">{app.message}</p>
                      </div>
                      <button
                        onClick={() => handleMessageApplicant(app)}
                        className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-all shrink-0"
                        title="Message applicant"
                      >
                        <FiMessageCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={showApplyModal}
        onClose={(submitted) => {
          setShowApplyModal(false);
          if (submitted) setAlreadyApplied(true);
        }}
        jobId={id}
        userId={user?.id}
        job={job}
      />

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
