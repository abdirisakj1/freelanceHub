import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { JobCard } from "../Components/JobCard";
import { CATEGORIES } from "../lib/constants";
import { getAllJobs } from "../lib/jobs";

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    getAllJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || job.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Find your next freelance opportunity from hundreds of available projects
          </p>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6 border border-white shadow-lg mb-10">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search jobs by title or description..."
                className="input-field !pl-12 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field w-full sm:w-64"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No jobs match your search criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing {filtered.length} job{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} showDescription />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
