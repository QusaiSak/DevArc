import type { NavbarItem } from "@/types/navbar.interface";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import {
  Github,
  LogOut,
  User,
  Settings,
  ChevronDown,
  FolderOpen,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { login, logout, isAuthenticated, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItem: NavbarItem[] = [
    { label: "Home", link: "/" },
    { label: "Pricing", link: "/pricing" },
    // Only show Favorites link if user is authenticated
    ...(isAuthenticated ? [{ label: "Favorites", link: "/search" }] : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold">DevArc</span>
          </div>

          {/* Center Navigation Links - Hidden on mobile and tablet, shown on desktop */}
          <div className="hidden xl:flex items-center ml-[28rem] flex-1 space-x-8">
            {navItem.map((item, index) => (
              <Link
                key={index}
                to={item.link || "#"}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 relative group py-2 px-1"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Mode Toggle - Hidden on mobile and tablet */}
            <div className="hidden xl:block">
              <ModeToggle />
            </div>

            {isAuthenticated ? (
              <div className="hidden xl:flex items-center space-x-3">
                {/* Projects Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-sm"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  <FolderOpen className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-3" />
                  Projects
                </Button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 backdrop-blur-sm group"
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-7 h-7 rounded-full ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-200"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user?.username || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-all duration-300 ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {user?.name || user?.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                        >
                          <Settings className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform duration-200" />
                          Profile Settings
                        </button>

                        <div className="border-t border-slate-200/50 dark:border-slate-700/50 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                        >
                          <LogOut className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="hidden xl:inline-flex bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm"
                onClick={login}
              >
                <Github className="w-4 h-4 mr-2" />
                Sign Up with Github
              </Button>
            )}

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="xl:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 touch-manipulation"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
          <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
            {/* Navigation Links */}
            <div className="space-y-1">
              {navItem.map((item, index) => (
                <Link
                  key={index}
                  to={item.link || "#"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium transition-all duration-200 py-3 px-3 rounded-lg text-base touch-manipulation"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between py-3 px-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Theme
                </span>
                <ModeToggle />
              </div>

              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* Mobile Projects Button */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 touch-manipulation"
                    onClick={() => {
                      window.location.href = "/dashboard";
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <FolderOpen className="w-5 h-5 mr-3" />
                    Projects
                  </Button>

                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-10 h-10 rounded-full ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {user?.name || user?.username}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start h-12 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                  onClick={() => {
                    login();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Github className="w-5 h-5 mr-3" />
                  Sign Up with Github
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
