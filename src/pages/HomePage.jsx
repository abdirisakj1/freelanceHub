import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FiArrowRight,
  FiCode,
  FiSmartphone,
  FiPenTool,
  FiImage,
  FiTrendingUp,
  FiEdit3,
} from "react-icons/fi";
import { JobCard } from "../Components/JobCard";
import { CATEGORIES } from "../lib/constants";
import { getAllJobs } from "../lib/jobs";
import { useAuth } from "../context/AuthContext";

const categoryIcons = {
  "Web Development": FiCode,
  "Mobile Development": FiSmartphone,
  "UI/UX Design": FiPenTool,
  "Graphic Design": FiImage,
  Marketing: FiTrendingUp,
  Writing: FiEdit3,
};

export const HomePage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    getAllJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs =
    activeCategory === "All"
      ? jobs
      : jobs.filter((j) => j.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-brand-100 text-sm font-medium mb-6 border border-white/20">
              The #1 Freelance Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Find Work. Hire Talent.{" "}
              <span className="text-brand-200">Build Success.</span>
            </h1>
            <p className="mt-6 text-lg text-brand-100/80 max-w-xl leading-relaxed">
              Connect with top freelancers and clients worldwide. Post jobs,
              find projects, and grow your career on our premium platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/jobs" className="btn-primary !bg-white !text-brand-600 hover:!bg-brand-50">
                Browse Jobs
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to={isLoggedIn ? "/my-jobs" : "/signup"}
                className="btn-secondary !bg-white/30 !text-white hover:!bg-white/10"
              >
                Create Job
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-3 text-gray-500">Find opportunities in your field of expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = categoryIcons[cat] || FiCode;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="group p-6 rounded-2xl bg-brand-50/50 border border-brand-100 hover:bg-brand-500 hover:border-brand-500 transition-all duration-300 text-center card-hover"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-brand-100 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Icon className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">
                    {cat}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Jobs</h2>
              <p className="mt-2 text-gray-500">Discover the newest opportunities</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "All"
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                    : "bg-white text-gray-600 hover:bg-brand-50"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                      : "bg-white text-gray-600 hover:bg-brand-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No jobs found in this category yet.</p>
              <Link to={isLoggedIn ? "/my-jobs" : "/signup"} className="btn-primary mt-4 inline-flex">
                Post the First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
