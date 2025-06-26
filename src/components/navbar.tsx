import type { NavbarItem } from "@/types/navbar.interface";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Github,
  LogOut,
  User,
  Settings,
  ChevronDown,
  FolderOpen,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "motion/react";

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
    <motion.nav
      className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo Section */}
          <motion.div
            className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Rocket className="w-4 h-4 sm:w-6 sm:h-6 text-white" />

            <motion.span
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              DevArc
            </motion.span>
          </motion.div>

          {/* Center Navigation Links - Hidden on mobile and tablet, shown on desktop */}
          <div className="hidden xl:flex items-center ml-[28rem] flex-1 space-x-8">
            {navItem.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={item.link || "#"}
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 relative group py-2 px-1"
                >
                  {item.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300 ease-out"
                    layoutId={`underline-${index}`}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="hidden xl:flex items-center space-x-3">
                {/* Projects Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm transition-all duration-200 hover:scale-105 text-sm group"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    <motion.div
                      whileHover={{ rotate: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                    </motion.div>
                    Projects
                  </Button>
                </motion.div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 backdrop-blur-sm group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {user?.avatar_url ? (
                      <motion.img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-7 h-7 rounded-full ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user?.username || "User"}
                    </span>
                    <motion.div
                      animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl py-1 z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user?.name || user?.username}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <motion.button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                            whileHover={{ x: 4 }}
                          >
                            <motion.div
                              whileHover={{ rotate: 90 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                            </motion.div>
                            Profile Settings
                          </motion.button>

                          <div className="border-t border-slate-200/50 dark:border-slate-700/50 my-1"></div>

                          <motion.button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                            whileHover={{ x: 4 }}
                          >
                            <motion.div
                              whileHover={{ x: -4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                            </motion.div>
                            Sign Out
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <motion.div
                className="hidden xl:block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm group"
                  onClick={login}
                >
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Github className="w-4 h-4 mr-2" />
                  </motion.div>
                  Sign Up with Github
                </Button>
              </motion.div>
            )}

            {/* Mobile/Tablet Menu Button */}
            <motion.button
              onClick={toggleMobileMenu}
              className="xl:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 touch-manipulation"
              aria-label="Toggle mobile menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="xl:hidden border-t border-slate-200/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {/* Navigation Links */}
              <div className="space-y-1">
                {navItem.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.link || "#"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium transition-all duration-200 py-3 px-3 rounded-lg text-base touch-manipulation group"
                    >
                      <motion.span
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* Mobile Projects Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start h-12 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 touch-manipulation group"
                        onClick={() => {
                          window.location.href = "/dashboard";
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <motion.div
                          whileHover={{ rotate: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FolderOpen className="w-5 h-5 mr-3" />
                        </motion.div>
                        Projects
                      </Button>
                    </motion.div>

                    {/* User Info */}
                    <motion.div
                      className="flex items-center space-x-3 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {user?.avatar_url ? (
                        <motion.img
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-10 h-10 rounded-full ring-2 ring-blue-500/20"
                          whileHover={{ scale: 1.1 }}
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
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-12 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation group"
                      >
                        <motion.div
                          whileHover={{ x: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                        </motion.div>
                        Sign Out
                      </Button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation group"
                      onClick={() => {
                        login();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Github className="w-5 h-5 mr-3" />
                      </motion.div>
                      Sign Up with Github
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
