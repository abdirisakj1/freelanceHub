import React from "react";
import { Link } from "react-router";
import { FiBriefcase, FiInbox } from "react-icons/fi";

const illustrations = {
  noJobs: (
    <div className="relative w-48 h-48 mx-auto">
      <div className="absolute inset-0 bg-brand-100 rounded-full opacity-50 animate-pulse" />
      <div className="absolute inset-4 bg-brand-50 rounded-full flex items-center justify-center">
        <FiBriefcase className="w-20 h-20 text-brand-500" />
      </div>
    </div>
  ),
  noApplications: (
    <div className="relative w-48 h-48 mx-auto">
      <div className="absolute inset-0 bg-brand-100 rounded-full opacity-50 animate-pulse" />
      <div className="absolute inset-4 bg-brand-50 rounded-full flex items-center justify-center">
        <FiInbox className="w-20 h-20 text-brand-500" />
      </div>
    </div>
  ),
};

export const EmptyState = ({ type, title, message, actionLabel, actionTo }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {illustrations[type]}
      <h3 className="mt-8 text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-500 max-w-md leading-relaxed">{message}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-8">
          {actionLabel}
        </Link>
      )}
    </div>
  );
};
