import type { NavbarItem } from '@/types/navbar.interface'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'
import { Github, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
    const { login, logout, isAuthenticated, user } = useAuth()
    const dropdownRef = useRef<HTMLDivElement>(null)
    
    const navItem : NavbarItem[] = [
        { label: 'Home', link: '/' },
        { label: 'About', link: '/about' },
        { label: 'Contact', link: '/contact' },
    ]

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLogout = () => {
        logout()
        setIsProfileDropdownOpen(false)
    }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    DevArc
                </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
                {navItem.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link || '#'}
                        className="relative px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 group"
                    >
                        {item.label}
                        <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                    </Link>
                ))}
                <div className="mx-2">
                    <ModeToggle />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                    <div className="hidden md:flex items-center space-x-2">
                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={toggleProfileDropdown}
                                className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                {user?.avatar_url ? (
                                    <img 
                                        src={user.avatar_url} 
                                        alt={user.username} 
                                        className="w-6 h-6 rounded-full"
                                    />
                                ) : (
                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user?.username || 'User'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                    isProfileDropdownOpen ? 'rotate-180' : ''
                                }`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {user?.name || user?.username}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.email}
                                        </p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                // Add profile navigation here if needed
                                                setIsProfileDropdownOpen(false)
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            Profile Settings
                                        </button>
                                        
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
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
                        className="hidden sm:inline-flex"
                        onClick={login}
                    >
                        <Github className="w-4 h-4 mr-2" />
                        Sign Up with Github
                    </Button>
                )}
                
                {/* Mobile Menu Button */}
                <button 
                    onClick={toggleMobileMenu}
                    className="md:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden mt-3 pb-3 border-t border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
            <div className="flex flex-col space-y-1 pt-3">
                {navItem.map((item, index) => (
                    <Link
                        key={index}
                        to={item.link || '#'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    >
                        {item.label}
                    </Link>
                ))}
                
                {/* Mobile Auth Section */}
                {isAuthenticated ? (
                    <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                        <div className="flex items-center space-x-2 px-3 py-2">
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt={user.username} 
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {user?.name || user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => {
                                handleLogout()
                                setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors mx-3"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Button 
                        size="sm" 
                        className="mx-3 mt-2"
                        onClick={() => {
                            login()
                            setIsMobileMenuOpen(false)
                        }}
                    >
                        <Github className="w-4 h-4 mr-2" />
                        Sign Up with Github
                    </Button>
                )}
            </div>
        </div>
    </nav>
  )
}