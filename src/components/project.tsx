import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  FolderOpen,
  GitBranch,
  Calendar,
  ExternalLink,
  Eye
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { RepoImportModal } from './repoModal'
import { getAllUserProjects } from '@/lib/projectService'
import type { Repository } from '@/types/github.interface'
import type { Project } from '@/types/project.interface'

export const Dashboard = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadRecentProjects()
  }, [])

  const loadRecentProjects = async () => {
    try {
      const projects = await getAllUserProjects()
      // Get the 3 most recent projects
      setRecentProjects(projects.slice(0, 3))
    } catch (error) {
      console.error('Failed to load recent projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportRepository = (repo: Repository) => {
    console.log('Importing repository:', repo)
    alert(`Successfully imported ${repo.name}!`)
  }

  const handleCreateProject = () => {
    navigate('/create-project')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Your Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create or import a project to get started
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Project */}
          <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex flex-col items-center space-y-5 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Project
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Start from scratch with AI-assisted setup and lifecycle selection
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                onClick={handleCreateProject}
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Import from GitHub */}
          <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm hover:shadow-md transition duration-300">
            <div className="flex flex-col items-center space-y-5 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Import from GitHub
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                Use your existing codebase with automatic structure analysis
              </p>
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium"
                onClick={() => setIsImportModalOpen(true)}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Import Repository
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
              className="text-sm"
            >
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {project.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {project.visibility}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(project.createdAt)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {project.repoUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(project.repoUrl, '_blank')
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first project to get started
                </p>
                <Button onClick={handleCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      <RepoImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRepository}
      />
    </div>
  )
}
