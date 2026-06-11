import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiEye,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiUsers,
} from "react-icons/fi"
import { useAuth } from "../context/AuthContext";
import { getApplicationsByJob } from "../lib/applications";
import { CATEGORIES, DEFAULT_JOB_IMAGE, formatBudget, formatDate } from "../lib/constants";
import { createJob, deleteJob, getJobsByUser, updateJob } from "../lib/jobs";
import { uploadJobImage } from "../lib/storage";

const emptyForm = {
  title: "",
  description: "",
  budget: "",
  category: CATEGORIES[0],
  deadline: "",
  image: null,
};

const JobForm = ({
  form,
  setForm,
  imagePreview,
  onImageChange,
  submitting,
  onSubmit,
  submitLabel,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        required
        placeholder="e.g. Build a React Dashboard"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[120px] resize-none"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        required
        placeholder="Describe the job requirements, skills needed, deliverables..."
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Budget ($)</label>
        <input
          type="number"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          value={form.budget}
          onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
          required
          min="1"
          placeholder="500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline</label>
        <input
          type="date"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          required
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image</label>
      <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-brand-300 rounded-md cursor-pointer hover:bg-brand-50 transition-colors overflow-hidden">
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <FiUpload className="w-8 h-8 text-brand-500 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Click to upload image</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
      </label>
    </div>

    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-md font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-md font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
    </div>
  </form>
);

export const MyJobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [viewApplicants, setViewApplicants] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchJobs = async () => {
    try {
      const data = await getJobsByUser(user.id);
      setJobs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview(null);
  };

  const closeCreateForm = () => {
    setShowCreateForm(false);
    resetForm();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((f) => ({ ...f, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let imageUrl = null;
      if (form.image) {
        imageUrl = await uploadJobImage(form.image, user.id);
      }
      await createJob({
        title: form.title,
        description: form.description,
        budget: parseFloat(form.budget),
        category: form.category,
        deadline: form.deadline,
        image_url: imageUrl,
        created_by: user.id,
      });
      toast.success("Job created successfully!");
      closeCreateForm();
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      let imageUrl = editJob.image_url;
      if (form.image) {
        imageUrl = await uploadJobImage(form.image, user.id);
      }
      await updateJob(editJob.id, {
        title: form.title,
        description: form.description,
        budget: parseFloat(form.budget),
        category: form.category,
        deadline: form.deadline,
        image_url: imageUrl,
      });
      toast.success("Job updated successfully!");
      setEditJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteJob(id);
      toast.success("Job deleted");
      fetchJobs();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete job");
    }
  };

  const openEdit = (job) => {
    setEditJob(job);
    setForm({
      title: job.title,
      description: job.description,
      budget: job.budget.toString(),
      category: job.category,
      deadline: job.deadline,
      image: null,
    });
    setImagePreview(job.image_url);
  };

  const openView = async (job) => {
    setViewJob(job);
    try {
      const apps = await getApplicationsByJob(job.id);
      setViewApplicants(apps);
    } catch (error) {
      console.error(error);
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={closeCreateForm}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to My Jobs
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-brand-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Create New Job</h1>
              <p className="text-brand-100 text-sm mt-1">Fill in the details to post your job</p>
            </div>
            <div className="p-6 sm:p-8">
              <JobForm
                form={form}
                setForm={setForm}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                submitting={submitting}
                onSubmit={handleCreate}
                submitLabel="Create Job"
                onCancel={closeCreateForm}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editJob) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => { setEditJob(null); resetForm(); }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to My Jobs
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-brand-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Edit Job</h1>
              <p className="text-brand-100 text-sm mt-1">Update your job posting details</p>
            </div>
            <div className="p-6 sm:p-8">
              <JobForm
                form={form}
                setForm={setForm}
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
                submitting={submitting}
                onSubmit={handleUpdate}
                submitLabel="Update Job"
                onCancel={() => { setEditJob(null); resetForm(); }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewJob) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => { setViewJob(null); setViewApplicants([]); }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to My Jobs
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={viewJob.image_url || DEFAULT_JOB_IMAGE}
              alt={viewJob.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="badge">{viewJob.category}</span>
                  <span className="text-brand-600 font-bold text-lg">{formatBudget(viewJob.budget)}</span>
                  <span className="text-gray-500">Deadline: {formatDate(viewJob.deadline)}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{viewJob.title}</h1>
                <p className="text-gray-600 leading-relaxed text-lg">{viewJob.description}</p>
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4 text-lg">
                    <FiUsers className="w-5 h-5 text-brand-500" />
                    Applicants ({viewApplicants.length})
                  </h4>
                  {viewApplicants.length === 0 ? (
                    <p className="text-gray-500 text-sm">No applications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {viewApplicants.map((app) => (
                        <div key={app.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="font-medium text-gray-900">{app.full_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{app.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Jobs</h1>
            <p className="mt-2 text-gray-500">Create and manage your job postings</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <FiPlus className="w-5 h-5" />
            Create Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-6">You haven&apos;t created any jobs yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex gap-3 card-hover"
              >
                <img
                  src={job.image_url || DEFAULT_JOB_IMAGE}
                  alt={job.title}
                  className="w-24 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="badge text-xs">{job.category}</span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1">{job.title}</h3>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openView(job)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="View"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(job)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-semibold text-brand-600">
                      <FiDollarSign className="w-3 h-3" />
                      {formatBudget(job.budget)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(job.deadline)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
