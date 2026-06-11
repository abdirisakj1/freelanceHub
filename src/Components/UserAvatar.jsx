import React from "react";
import { Link } from "react-router";
import { FaUser } from "react-icons/fa";
import { DEFAULT_AVATAR } from "../lib/constants";

export const UserAvatar = ({ user, size = "md", linkTo, onClick }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const avatar = (
    <div
      className={`${sizes[size]} rounded-full overflow-hidden bg-brand-50 border-2 border-brand-100 flex items-center justify-center shrink-0 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.username || "User"}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={DEFAULT_AVATAR}
          alt={user?.username || "User"}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{avatar}</Link>;
  }

  return avatar;
};

export const UserAvatarPlaceholder = ({ size = "md" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gray-100 flex items-center justify-center`}
    >
      <FaUser className="text-gray-400" />
    </div>
  );
};
