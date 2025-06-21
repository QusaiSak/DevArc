import type { NavbarItem } from '@/types/navbar.interface'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { ModeToggle } from './mode-toggle'
import { Button } from './ui/button'
import { Github, LogOut, User, Settings, ChevronDown, FolderOpen } from 'lucide-react'
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
        // Only show Favorites link if user is authenticated
        ...(isAuthenticated ? [{ label: 'Favorites', link: '/search' }] : []),
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
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        DevArc
                    </span>
                </div>

                {/* Center Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItem.map((item, index) => (
                        <Link
                            key={index}
                            to={item.link || '#'}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    <div className="hidden md:block">
                        <ModeToggle />
                    </div>

                    {isAuthenticated ? (
                        <div className="hidden md:flex items-center space-x-3">
                            {/* Projects Button */}
                            <Button 
                                variant="outline"
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Projects
                            </Button>

                            {/* User Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.username} 
                                            className="w-7 h-7 rounded-full"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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
                                                    setIsProfileDropdownOpen(false)
                                                }}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 mr-3" />
                                                Profile Settings
                                            </button>
                                            
                                            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                            
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Button 
                            className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={login}
                        >
                            <Github className="w-4 h-4 mr-2" />
                            Sign Up with Github
                        </Button>
                    )}
                    
                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="px-6 py-4 space-y-3">
                    {navItem.map((item, index) => (
                        <Link
                            key={index}
                            to={item.link || '#'}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                    
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                {/* Mobile Projects Button */}
                                <Button 
                                    variant="outline"
                                    className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                    onClick={() => {
                                        window.location.href = '/dashboard'
                                        setIsMobileMenuOpen(false)
                                    }}
                                >
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    Projects
                                </Button>

                                <div className="flex items-center space-x-3">
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user.username} 
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                                    className="flex items-center text-red-600 dark:text-red-400 font-medium"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
            </div>
        )}
    </nav>
  )
}