import React, { useState, useEffect } from "react";
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
  const [supportsBackdropFilter, setSupportsBackdropFilter] = useState(true);
  const { isLoggedIn, profile, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if backdrop-filter is supported (fix for Vercel/Safari)
    const supports = CSS.supports('backdrop-filter', 'blur(8px)') || 
                     CSS.supports('-webkit-backdrop-filter', 'blur(8px)');
    setSupportsBackdropFilter(supports);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Determine header classes based on backdrop-filter support
  const headerClasses = supportsBackdropFilter 
    ? "sticky top-0 z-50 border-b border-white/30 shadow-lg bg-white/70 backdrop-blur-md"
    : "sticky top-0 z-50 border-b border-gray-200 shadow-lg bg-white";

  return (
    <header className={headerClasses}>
      {/* Fallback gradient for browsers with poor backdrop-filter support */}
      {!supportsBackdropFilter && (
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-gray-50 -z-10" />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
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
                    className="flex items-center focus:outline-none transition-transform hover:scale-105"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="User menu"
                  >
                    <UserAvatar user={profile} size="sm" />
                  </button>
                  {isDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <div
                        className="absolute right-0 w-48 bg-white mt-2 rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/my-jobs"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          My Jobs
                        </Link>
                        <button
                          onClick={() => { logout(); setIsDropdownOpen(false); }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
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
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <IoMdClose className="w-6 h-6" /> : <CiMenuBurger className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg animate-slideDown">
          <div className="px-4 py-4 space-y-1">
            <Link 
              to="/" 
              className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/jobs" 
              className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/my-jobs" 
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Jobs
                </Link>
                <Link 
                  to="/applicants" 
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Applicants
                </Link>
                <Link 
                  to="/my-applications" 
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Applications
                </Link>
                <Link 
                  to="/profile" 
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className="block w-full text-left py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/signin" 
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block py-2.5 px-3 rounded-lg text-brand-600 font-semibold hover:bg-brand-50 transition-colors" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;