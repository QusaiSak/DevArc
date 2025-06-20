import React, { useState } from 'react'
import { Plus, FolderOpen, GitBranch, Clock, TestTube, Eye, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Navbar } from './navbar'
import { RepoImportModal } from './repoModal'

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

export const Dashboard = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Mock data for projects
  const recentProjects = [
    {
      id: 1,
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React and Node.js",
      status: "Active",
      methodology: "Agile",
      repository: "user/ecommerce-platform",
      lastUpdated: "2 hours ago",
      testCoverage: "85%",
      coverageColor: "text-green-600"
    },
    {
      id: 2,
      name: "Mobile Banking App",
      description: "Secure mobile banking application with React Native",
      status: "In Review",
      methodology: "Scrum",
      repository: "user/banking-app",
      lastUpdated: "1 day ago",
      testCoverage: "92%",
      coverageColor: "text-green-600"
    }
  ]

  const handleImportRepository = (repo: Repository) => {
    console.log('Importing repository:', repo)
    // Here you would typically:
    // 1. Send the repo data to your backend
    // 2. Create a new project entry
    // 3. Analyze the repository structure
    // 4. Update the projects list
    
    // For now, just show a success message
    alert(`Successfully imported ${repo.name}!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Create New Project Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Project
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                  Start a new project with AI-guided setup and SDLC model selection
                </p>
              </div>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-2 rounded-lg font-medium"
                onClick={() => {
                  // Handle create new project
                  console.log('Create new project')
                }}
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Import from GitHub Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Import from GitHub
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                  Import an existing repository and let AI analyze your project structure
                </p>
              </div>
              <Button 
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium"
                onClick={() => setIsImportModalOpen(true)}
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Import Repository
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Projects
            </h2>
            <Button 
              variant="ghost" 
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              View All
            </Button>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div 
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Project Header */}
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                        {project.methodology}
                      </span>
                    </div>

                    {/* Project Description */}
                    <p className="text-gray-600 dark:text-gray-400">
                      {project.description}
                    </p>

                    {/* Project Metadata */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{project.repository}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{project.lastUpdated}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TestTube className="w-4 h-4" />
                        <span className={project.coverageColor}>
                          {project.testCoverage} Test Coverage
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-6">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Project
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Repository Import Modal */}
      <RepoImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRepository}
      />
    </div>
  )
}