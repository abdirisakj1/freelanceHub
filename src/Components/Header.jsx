import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { UserAvatar } from "./UserAvatar";
import { NotificationBell } from "./NotificationBell";

const navLinkClass = (active) =>
  `inline-flex items-center px-2 pt-1 text-xs md:text-sm font-medium transition-colors ${
    active
      ? "text-brand-600 border-b-2 border-brand-500"
      : "text-gray-600 hover:text-brand-600 border-b-2 border-transparent"
  }`;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isLoggedIn, profile, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass sticky top-0 z-40 border-b border-white/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FM</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900">
                Freelance<span className="text-brand-500">Hub</span>
              </span>
            </Link>

            <nav className="hidden md:ml-6 md:flex md:space-x-3 lg:ml-8 lg:space-x-6">
              <Link to="/" className={navLinkClass(isActive("/"))}>
                Home
              </Link>
              <Link to="/jobs" className={navLinkClass(isActive("/jobs"))}>
                Jobs
              </Link>
              {isLoggedIn && (
                <>
                  <Link to="/my-jobs" className={navLinkClass(isActive("/my-jobs"))}>
                    My Jobs
                  </Link>
                  <Link to="/applicants" className={navLinkClass(isActive("/applicants"))}>
                    Applicants
                  </Link>
                  <Link to="/my-applications" className={navLinkClass(isActive("/my-applications"))}>
                    My Applications
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications */}
            {isLoggedIn && <NotificationBell />}

            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:inline text-xs md:text-sm text-gray-600 hover:text-brand-600 transition-colors whitespace-nowrap"
                >
                  Hello, <span className="font-semibold text-brand-600">{profile?.username}</span>
                </Link>
                <div className="relative">
                  <button
                    className="flex items-center focus:outline-none"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <UserAvatar user={profile} size="sm" />
                  </button>
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 w-48 bg-white mt-2 rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/my-jobs"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Jobs
                      </Link>
                      <button
                        onClick={() => { logout(); setIsDropdownOpen(false); }}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 md:gap-3">
                <Link to="/signin" className="btn-ghost text-xs md:text-sm !py-2 !px-3 md:!px-4">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary !py-2 !px-3 md:!px-5 !text-xs md:!text-sm">
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <IoMdClose className="w-6 h-6" /> : <CiMenuBurger className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-1">
            <Link to="/" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/jobs" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Jobs</Link>
            {isLoggedIn ? (
              <>
                <Link to="/my-jobs" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>My Jobs</Link>
                <Link to="/applicants" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Applicants</Link>
                <Link to="/my-applications" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>My Applications</Link>
                <Link to="/profile" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="block py-2.5 px-3 rounded-lg text-brand-600 font-semibold hover:bg-brand-50" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
