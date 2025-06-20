import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './hooks/modal-hook'
import { Button } from './ui/button'
import { 
    GitBranch, 
    Star, 
    GitFork, 
    Calendar, 
    Search, 
    Loader2,
    ExternalLink,
    Download,
    RefreshCw,
    AlertCircle,
    Github,
    ChevronLeft,
    ChevronRight,
    Clock,
    Code
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '@/context/AuthContext'
import { GitHubService } from '@/lib/github'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

interface RepoImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (repo: Repository) => void
}

export const RepoImportModal: React.FC<RepoImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [importing, setImporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const reposPerPage = 10 // Increased from 5

  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch repositories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRepositories()
    }
  }, [isOpen])

  // Filter repositories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRepos(repositories)
      setCurrentPage(1)
    } else {
      const filtered = repositories.filter(repo =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRepos(filtered)
      setCurrentPage(1)
    }
  }, [searchTerm, repositories])

  const fetchRepositories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if user is authenticated
      if (!user || !user.username) {
        throw new Error('User not authenticated or GitHub username not found')
      }

      // Get the GitHub access token from the backend
      const accessTokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      })
      
      if (!accessTokenResponse.ok) {
        throw new Error('Failed to get GitHub access token')
      }
      
      const tokenData = await accessTokenResponse.json()
      if (!tokenData.success || !tokenData.access_token) {
        throw new Error('GitHub token not found. Please reconnect your GitHub account.')
      }

      console.log('Token obtained successfully')
      console.log('Fetching all repos for username:', user.username)

      // Create GitHubService instance with the user's token
      const githubService = new GitHubService(tokenData.access_token)
      
      // Fetch ALL repositories using the GitHubService (no filtering)
      const repos = await githubService.getRepositories(user.username)
      
      if (!repos) {
        throw new Error('No repositories data received')
      }
      
      if (!Array.isArray(repos)) {
        console.error('Repos is not an array:', repos)
        throw new Error(`Expected array but got ${typeof repos}. Response: ${JSON.stringify(repos)}`)
      }
      
      // Map the GitHubRepo interface to your Repository interface
      const mappedRepos: Repository[] = repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        private: repo.private,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url
        }
      }))
      
      setRepositories(mappedRepos)
      setFilteredRepos(mappedRepos)
      setCurrentPage(1)
      
      console.log(`Successfully fetched ${mappedRepos.length} repositories`)
    } catch (error) {
      console.error('Error fetching repositories:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRepositories()
  }

  const handleImport = async (repo: Repository) => {
    setSelectedRepo(repo)
    setImporting(true)
    
    try {
      // Navigate to the repository details page
      navigate(`/repository/${repo.owner.login}/${repo.name}`)
      onClose()
    } catch (error) {
      console.error('Error importing repository:', error)
    } finally {
      setImporting(false)
      setSelectedRepo(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-400',
      TypeScript: 'bg-blue-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      'C++': 'bg-pink-500',
      'C#': 'bg-purple-500',
      Go: 'bg-cyan-500',
      Rust: 'bg-orange-600',
      PHP: 'bg-purple-500',
      Ruby: 'bg-red-600',
      Swift: 'bg-orange-500',
      Kotlin: 'bg-purple-600',
      Dart: 'bg-blue-400',
      HTML: 'bg-orange-400',
      CSS: 'bg-blue-600',
      Shell: 'bg-gray-600',
      Vue: 'bg-green-400',
      Svelte: 'bg-red-400',
    }
    return colors[language || ''] || 'bg-gray-400'
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredRepos.length / reposPerPage)
  const indexOfLastRepo = currentPage * reposPerPage
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage
  const currentRepos = filteredRepos.slice(indexOfFirstRepo, indexOfLastRepo)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Repository from GitHub"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header with Search and Refresh */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-400">
              All your repositories from GitHub
            </p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:flex-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading || isRefreshing}
            >
              <RefreshCw 
                className={`mr-2 h-4 w-4 transition-transform duration-500 ${
                  isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'
                }`} 
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && !repositories.length && (
          <div className="flex items-center justify-center py-12">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 flex items-center justify-center">
                <Github size={36} className="text-blue-500" />
              </div>
              <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 dark:text-gray-400">Fetching all your repositories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full p-8 flex flex-col items-center justify-center border border-red-300 dark:border-red-700 bg-red-50/10 dark:bg-red-900/10 rounded-lg">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-500">Error</h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Repositories List */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 max-h-96 overflow-y-auto"
            >
              {currentRepos.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-800/50"
                >
                  <Github size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">
                    No repositories found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {repositories.length === 0 
                      ? 'No repositories found in your GitHub account' 
                      : 'No repositories match your search criteria'}
                  </p>
                </motion.div>
              ) : (
                currentRepos.map((repo) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Repository Header */}
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {repo.name}
                          </h3>
                          {repo.private && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                              Private
                            </span>
                          )}
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Description */}
                        {repo.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {repo.description}
                          </p>
                        )}

                        {/* Repository Stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          {repo.language && (
                            <div className="flex items-center space-x-1">
                              <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                              <span>{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <GitFork className="w-4 h-4" />
                            <span>{repo.forks_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Updated {formatDate(repo.updated_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Import Button */}
                      <div className="ml-4">
                        <Button
                          onClick={() => handleImport(repo)}
                          disabled={importing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {importing && selectedRepo?.id === repo.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Import
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {filteredRepos.length > reposPerPage && (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center gap-2"
            >
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 7) {
                  pageNumber = i + 1;
                } else if (currentPage <= 4) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNumber = totalPages - 6 + i;
                } else {
                  pageNumber = currentPage - 3 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    className={currentPage === pageNumber ? 'bg-blue-500 hover:bg-blue-600' : ''}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min(currentRepos.length, reposPerPage)} of {filteredRepos.length} repositories 
            {repositories.length !== filteredRepos.length ? ` (${repositories.length} total)` : ''}
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}