import React from "react";
import { Link, useNavigate } from "react-router";
import { FiCalendar, FiDollarSign, FiUser } from "react-icons/fi";
import {
  DEFAULT_JOB_IMAGE,
  formatBudget,
  formatDate,
} from "../lib/constants";

export const JobCard = ({ job, showDescription = false, showPostedBy = true }) => {
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (job.users?.id) {
      navigate(`/profile/${job.users.id}`);
    }
  };

  return (
    <Link to={`/jobs/${job.id}`} className="block group">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card-hover">
        <div className="relative h-48 overflow-hidden">
          <img
            src={job.image_url || DEFAULT_JOB_IMAGE}
            alt={job.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="badge">{job.category}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {job.title}
          </h3>
          {showDescription && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {job.description}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 font-semibold text-brand-600">
              <FiDollarSign className="w-4 h-4" />
              {formatBudget(job.budget)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              {formatDate(job.deadline)}
            </span>
          </div>
          {showPostedBy && job.users && (
            <div 
              onClick={handleProfileClick}
              className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <img
                src={job.users.avatar_url || "https://i.pinimg.com/736x/a9/c8/16/a9c81656b65b925d4326d5cb89339126.jpg"}
                alt={job.users.username}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <FiUser className="w-3.5 h-3.5" />
                {job.users.username}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
