import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { createApplication } from "../lib/applications";
import { notifyJobApplication } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";

export const ApplyModal = ({ isOpen, onClose, jobId, userId, job }) => {
  const { profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill full name when modal opens
  useEffect(() => {
    if (isOpen && profile?.username) {
      setFullName(profile.username);
    }
  }, [isOpen, profile?.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const application = await createApplication({
        job_id: jobId,
        applicant_id: userId,
        full_name: fullName,
        phone,
        message,
      });
      
      toast.success("Application submitted successfully!");
      onClose(true);
      setFullName("");
      setPhone("");
      setMessage("");
      
      // Send notification async 
      if (job?.created_by && job?.title) {
        // console.log(" Sending application notification:", {
        //   employerId: job.created_by,
        //   applicantName: fullName || profile?.username,
        //   jobTitle: job.title,
        //   senderId: userId,
        // });
        notifyJobApplication({
          employerId: job.created_by,
          applicantName: fullName || profile?.username,
          jobTitle: job.title,
          senderId: userId,
          jobId,
        }).catch((err) => console.error(" Application notification error:", err));
      }
    } catch (error) {
      console.error(error);
      if (error.code === "23505") {
        toast.error("You have already applied for this job");
      } else {
        toast.error("Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Apply for this Job</h3>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <IoMdClose className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message / Proposal
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all min-h-[120px] resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Tell the employer why you're the perfect fit..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
