import React, { useState } from 'react'
import {
  Plus,
  FolderOpen,
  GitBranch
} from 'lucide-react'
import { Button } from './ui/button'
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

  const handleImportRepository = (repo: Repository) => {
    console.log('Importing repository:', repo)
    alert(`Successfully imported ${repo.name}!`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

        {/* Actions */}
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
                onClick={() => console.log('Create new project')}
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
