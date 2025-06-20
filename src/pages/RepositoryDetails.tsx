import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Calendar, 
  FileText, 
  Code, 
  TestTube, 
  BookOpen,
  Download,
  Activity,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle,
  Github,
  Eye,
  GitCommit,
  Users,
  Clock,
  Zap,
  Target,
  FileCode,
  Bug
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/context/AuthContext'
import { GitHubService } from '@/lib/github'
import { StructureAnalyzer } from '@/lib/structure'
import { AIAnalyzer } from '@/lib/aiService'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface RepositoryData {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  clone_url: string
  language: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

interface AnalysisResults {
  structure?: any
  codeAnalysis?: {
    qualityScore: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    maintainabilityIndex: number
  }
  documentation?: {
    summary: string
    functions: any[]
    examples: string[]
  }
  testCases?: {
    testCases: any[]
    coverage: number
    framework: string
  }
}

export default function RepositoryDetailsPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [repository, setRepository] = useState<RepositoryData | null>(null)
  const [readme, setReadme] = useState<string>('')
  const [commits, setCommits] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResults>({})
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingDocs, setGeneratingDocs] = useState(false)
  const [generatingTests, setGeneratingTests] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (owner && repo && user) {
      fetchRepositoryData()
    }
  }, [owner, repo, user])

  const fetchRepositoryData = async () => {
    if (!owner || !repo) return
    
    setLoading(true)
    setError(null)

    try {
      // Get GitHub token
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      })
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get GitHub access token')
      }
      
      const tokenData = await tokenResponse.json()
      if (!tokenData.success) {
        throw new Error('GitHub token not found')
      }

      const githubService = new GitHubService(tokenData.access_token)

      // Fetch repository details
      const repoData = await githubService.fetch(`repos/${owner}/${repo}`)
      setRepository(repoData as any)

      // Fetch README using the dedicated method
      try {
        const readmeContent = await githubService.getReadme(owner, repo)
        setReadme(readmeContent)
        console.log('README fetched successfully')
      } catch (error) {
        console.log('No README file found in repository')
        setReadme('')
      }

      // Fetch recent commits
      const commitsData = await githubService.fetch(`repos/${owner}/${repo}/commits`)
      setCommits(commitsData)

    } catch (error) {
      console.error('Error fetching repository data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch repository data')
    } finally {
      setLoading(false
      )
    }
  }

  const runAnalysis = async () => {
    if (!owner || !repo || !user) return

    setAnalyzing(true)
    try {
      // Get GitHub token
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      })
      
      const tokenData = await tokenResponse.json()
      if (!tokenData.success) {
        throw new Error('GitHub token not found')
      }

      // Run structure analysis
      const structureAnalyzer = new StructureAnalyzer(tokenData.access_token)
      const structure = await structureAnalyzer.analyzeRepository(owner, repo)

      // Run AI analysis
      const aiAnalyzer = new AIAnalyzer()
      const codeAnalysis = await aiAnalyzer.analyzeCodeStructure(structure)

      setAnalysis({
        structure,
        codeAnalysis
      })

    } catch (error) {
      console.error('Analysis failed:', error)
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const generateDocumentation = async () => {
    if (!owner || !repo || !user) return

    setGeneratingDocs(true)
    try {
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      })
      
      const tokenData = await tokenResponse.json()
      const githubService = new GitHubService(tokenData.access_token)
      const aiAnalyzer = new AIAnalyzer()

      // Get main files for documentation
      const files = await githubService.getRepositoryStructure(owner, repo)
      console.log('All files for documentation:', files.length)
      console.log('Sample files:', files.slice(0, 5).map(f => ({ path: f.path, type: f.type })))
      
      // First try to find main/important files using the helper function
      let mainFiles = files.filter(file => 
        (file.type === 'blob' || file.type === 'file') && 
        file.path &&
        isCodeFile(file.path) &&
        !file.path.toLowerCase().includes('.css') &&
        !file.path.toLowerCase().includes('.scss') &&
        !file.path.toLowerCase().includes('style') &&
        (file.path.includes('index') || file.path.includes('main') || file.path.includes('app'))
      )
      
      console.log('Main files found:', mainFiles.length, mainFiles.map(f => f.path))

      // If no main files found, get any code files from the root or src directory (excluding styles)
      if (mainFiles.length === 0) {
        mainFiles = files.filter(file => 
          (file.type === 'blob' || file.type === 'file') && 
          file.path &&
          isCodeFile(file.path) &&
          !file.path.toLowerCase().includes('.css') &&
          !file.path.toLowerCase().includes('.scss') &&
          !file.path.toLowerCase().includes('style') &&
          (file.path.startsWith('src/') || !file.path.includes('/') || file.path.startsWith('lib/'))
        )
      }
      
      console.log('Filtered files found:', mainFiles.length, mainFiles.map(f => f.path))

      // If still no files, try any code file but exclude styling files
      if (mainFiles.length === 0) {
        mainFiles = files.filter(file => 
          (file.type === 'blob' || file.type === 'file') && 
          file.path &&
          isCodeFile(file.path) &&
          !file.path.toLowerCase().includes('.css') &&
          !file.path.toLowerCase().includes('.scss') &&
          !file.path.toLowerCase().includes('style')
        )
      }

      // Prioritize and limit files to top 8 for documentation
      mainFiles = prioritizeCodeFiles(mainFiles).slice(0, 8);

      // Use more files for comprehensive analysis - up to 10 files
      console.log('Selected files for comprehensive documentation:', mainFiles.map(f => f.path))

      let documentation: {
        summary: string;
        functions: any[];
        examples: string[];
      } = {
        summary: 'Generated documentation',
        functions: [],
        examples: []
      }

      if (mainFiles.length > 0) {
        try {
          // Fetch content for all selected files
          const filesWithContent = []
          
          for (const file of mainFiles) {
            if (file.path) {
              try {
                const fileContent = await githubService.getFileContent(owner, repo, file.path)
                if (fileContent && fileContent.trim().length > 10) {
                  filesWithContent.push({
                    path: file.path,
                    content: fileContent
                  })
                  console.log(`Added file for documentation: ${file.path}, content length: ${fileContent.length}`)
                } else {
                  console.log(`Skipped empty file: ${file.path}`)
                }
              } catch (error) {
                console.warn(`Failed to get content for ${file.path}:`, error)
              }
            }
          }

          const language = repository?.language?.toLowerCase() || 'javascript'
          const repositoryName = repository?.name || 'Unknown Repository'
          
          console.log(`Generating comprehensive documentation for ${filesWithContent.length} files`)
          
          if (filesWithContent.length > 0) {
            // Use the new comprehensive documentation method
            documentation = await aiAnalyzer.generateComprehensiveDocumentation(
              filesWithContent, 
              language, 
              repositoryName
            )
          } else {
            throw new Error('No valid file content found')
          }
        } catch (error) {
          console.warn('Failed to generate comprehensive documentation:', error)
          // Use fallback with single file method
          const language = repository?.language?.toLowerCase() || 'javascript'
          if (mainFiles.length > 0 && mainFiles[0].path) {
            try {
              const fileContent = await githubService.getFileContent(owner, repo, mainFiles[0].path)
              documentation = await aiAnalyzer.generateCodeDocumentation(fileContent, mainFiles[0].path, language)
            } catch (fallbackError) {
              documentation = await aiAnalyzer.generateCodeDocumentation('', mainFiles[0].path || 'README.md', language)
            }
          } else {
            documentation = await aiAnalyzer.generateCodeDocumentation('', 'README.md', language)
          }
        }
      } else {
        console.log('No suitable files found for documentation, using fallback')
        // Fallback: use the repository language to generate basic documentation
        const language = repository?.language?.toLowerCase() || 'javascript'
        documentation = await aiAnalyzer.generateCodeDocumentation('', 'README.md', language)
      }

      setAnalysis(prev => ({
        ...prev,
        documentation
      }))

    } catch (error) {
      console.error('Documentation generation failed:', error)
      setError('Documentation generation failed. Please try again.')
    } finally {
      setGeneratingDocs(false)
    }
  }

  const generateTestCases = async () => {
    if (!owner || !repo || !user) return

    setGeneratingTests(true)
    try {
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      })
      
      const tokenData = await tokenResponse.json()
      const githubService = new GitHubService(tokenData.access_token)
      const aiAnalyzer = new AIAnalyzer()

      // Get main files for test generation
      const files = await githubService.getRepositoryStructure(owner, repo)
      console.log('All files for test generation:', files.length)
      console.log('Sample files:', files.slice(0, 5).map(f => ({ path: f.path, type: f.type })))
      
      // Look for actual code files (not test files) with functions and APIs
      let codeFiles = files.filter(file => 
        (file.type === 'blob' || file.type === 'file') && 
        file.path &&
        isCodeFile(file.path) &&
        !file.path.includes('test') && 
        !file.path.includes('spec') &&
        !file.path.includes('__tests__') &&
        !file.path.includes('.test.') &&
        !file.path.includes('.spec.') &&
        // Focus on files likely to contain business logic
        (file.path.toLowerCase().includes('service') || 
         file.path.toLowerCase().includes('api') ||
         file.path.toLowerCase().includes('util') || 
         file.path.toLowerCase().includes('helper') ||
         file.path.toLowerCase().includes('lib/') || 
         file.path.toLowerCase().includes('controller') ||
         file.path.toLowerCase().includes('route') ||
         file.path.toLowerCase().includes('handler') ||
         (!file.path.toLowerCase().includes('component') && !file.path.toLowerCase().includes('ui/')))
      )

      console.log('Code files found (before priority filter):', codeFiles.length, codeFiles.map(f => f.path))

      // Prioritize files from src/, lib/, or root directory
      const priorityFiles = codeFiles.filter(file => 
        file.path?.startsWith('src/') || file.path?.startsWith('lib/') || !file.path?.includes('/')
      )
      
      if (priorityFiles.length > 0) {
        codeFiles = priorityFiles
      }

      // Use prioritization helper and limit files to top 6 for tests
      codeFiles = prioritizeCodeFiles(codeFiles).slice(0, 6);
      console.log('Selected files for comprehensive test generation:', codeFiles.map(f => f.path))

      let testCases: {
        testCases: any[];
        coverage: number;
        framework: string;
      } = {
        testCases: [],
        coverage: 0,
        framework: 'Jest'
      }

      if (codeFiles.length > 0) {
        try {
          // Fetch content for all selected files
          const filesWithContent = []
          
          for (const file of codeFiles) {
            if (file.path) {
              try {
                const fileContent = await githubService.getFileContent(owner, repo, file.path)
                if (fileContent && fileContent.trim().length > 10) {
                  filesWithContent.push({
                    path: file.path,
                    content: fileContent
                  })
                  console.log(`Added file for test generation: ${file.path}, content length: ${fileContent.length}`)
                } else {
                  console.log(`Skipped empty file: ${file.path}`)
                }
              } catch (error) {
                console.warn(`Failed to get content for ${file.path}:`, error)
              }
            }
          }

          const language = repository?.language?.toLowerCase() || 'javascript'
          const repositoryName = repository?.name || 'Unknown Repository'
          
          console.log(`Generating comprehensive test cases for ${filesWithContent.length} files`)
          
          if (filesWithContent.length > 0) {
            // Use the new comprehensive test generation method
            testCases = await aiAnalyzer.generateComprehensiveTestCases(
              filesWithContent, 
              language, 
              repositoryName
            )
          } else {
            throw new Error('No valid file content found')
          }
        } catch (error) {
          console.warn('Failed to generate comprehensive test cases:', error)
          // Use fallback with single file method
          const language = repository?.language?.toLowerCase() || 'javascript'
          if (codeFiles.length > 0 && codeFiles[0].path) {
            try {
              const fileContent = await githubService.getFileContent(owner, repo, codeFiles[0].path)
              testCases = await aiAnalyzer.generateTestCases(fileContent, codeFiles[0].path, language)
            } catch {
              testCases = await aiAnalyzer.generateTestCases('', codeFiles[0].path || 'main.js', language)
            }
          } else {
            testCases = await aiAnalyzer.generateTestCases('', 'main.js', language)
          }
        }
      } else {
        console.log('No suitable files found for test generation, using fallback')
        // Fallback: generate basic test cases based on repository language
        const language = repository?.language?.toLowerCase() || 'javascript'
        testCases = await aiAnalyzer.generateTestCases('', 'main.js', language)
      }

      setAnalysis(prev => ({
        ...prev,
        testCases
      }))

    } catch (error) {
      console.error('Test generation failed:', error)
      setError('Test generation failed. Please try again.')
    } finally {
      setGeneratingTests(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper function to filter out non-code files
  const isCodeFile = (filePath: string): boolean => {
    if (!filePath) return false;

    // Define file extensions that should be excluded (non-code files)
    const excludedExtensions = [
      // Images
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.webp', '.tiff', '.tif',
      // Videos
      '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v',
      // Audio
      '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a',
      // Documents
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf',
      // Archives
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
      // Fonts
      '.ttf', '.otf', '.woff', '.woff2', '.eot',
      // Binary/executables
      '.exe', '.dll', '.so', '.dylib', '.bin', '.deb', '.rpm',
      // Database
      '.db', '.sqlite', '.sqlite3', '.mdb',
      // Logs
      '.log', '.logs',
      // Temporary files
      '.tmp', '.temp', '.bak', '.swp', '.cache',
      // Lock files
      '.lock', 
      // Map files
      '.map'
    ];

    // Define directories that should be excluded
    const excludedDirectories = [
      'node_modules/', 'dist/', 'build/', 'target/', 'bin/', 'obj/', 
      '.git/', '.svn/', '.hg/', '.vscode/', '.idea/', 
      '__pycache__/', '.pytest_cache/', 'coverage/', 
      'vendor/', 'public/assets/', 'assets/images/', 'static/images/',
      'images/', 'img/', 'pics/', 'pictures/', 'media/', 'uploads/'
    ];

    // Define code file extensions
    const codeExtensions = [
      // Web technologies
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
      '.html', '.htm', '.css', '.scss', '.sass', '.less', '.styl',
      // Backend languages
      '.py', '.java', '.c', '.cpp', '.cxx', '.cc', '.h', '.hpp',
      '.cs', '.vb', '.php', '.rb', '.go', '.rs', '.kt', '.scala',
      '.swift', '.m', '.mm', '.pl', '.pm', '.r', '.jl', '.lua',
      // Functional languages
      '.hs', '.elm', '.clj', '.cljs', '.fs', '.fsx', '.ml', '.mli',
      // Scripts and configs (that contain code logic)
      '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
      '.dockerfile', '.makefile', '.cmake', '.gradle', '.sbt',
      // Data/Config files that might contain logic
      '.json', '.yaml', '.yml', '.toml', '.xml', '.plist',
      '.env', '.ini', '.cfg', '.conf', '.properties',
      // Documentation that might contain code
      '.md', '.rst', '.txt', '.adoc'
    ];

    const lowerPath = filePath.toLowerCase();

    // Check if file is in excluded directory
    for (const dir of excludedDirectories) {
      if (lowerPath.includes(dir)) {
        return false;
      }
    }

    // Check if file has excluded extension
    for (const ext of excludedExtensions) {
      if (lowerPath.endsWith(ext)) {
        return false;
      }
    }

    // Check if file has code extension
    for (const ext of codeExtensions) {
      if (lowerPath.endsWith(ext)) {
        return true;
      }
    }

    // If no extension matches, exclude by default
    return false;
  };

  // Helper function to prioritize code files for analysis
  const prioritizeCodeFiles = (files: any[]): any[] => {
    // Priority order: main source files > config files > documentation
    const highPriority = files.filter(file => {
      const path = file.path?.toLowerCase() || '';
      return path.includes('src/') || path.includes('lib/') || 
             path.endsWith('.ts') || path.endsWith('.js') || 
             path.endsWith('.tsx') || path.endsWith('.jsx') ||
             path.endsWith('.py') || path.endsWith('.java') ||
             path.endsWith('.cpp') || path.endsWith('.c');
    });

    const mediumPriority = files.filter(file => {
      const path = file.path?.toLowerCase() || '';
      return !highPriority.includes(file) && (
             path.endsWith('.cs') || path.endsWith('.php') || 
             path.endsWith('.rb') || path.endsWith('.go') ||
             path.endsWith('.rs') || path.endsWith('.kt') ||
             path.endsWith('.swift') || path.endsWith('.scala')
      );
    });

    const lowPriority = files.filter(file => 
      !highPriority.includes(file) && !mediumPriority.includes(file)
    );

    return [...highPriority, ...mediumPriority, ...lowPriority];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading repository details...</p>
        </div>
      </div>
    )
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Repository</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Repository not found'}</p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {repository.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {repository.description || 'No description available'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{repository.stargazers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="w-4 h-4" />
                  <span>{repository.forks_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{repository.watchers_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bug className="w-4 h-4" />
                  <span>{repository.open_issues_count} issues</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(repository.updated_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => window.open(repository.html_url, '_blank')}
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={runAnalysis} 
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
            <Button 
              onClick={generateDocumentation} 
              disabled={generatingDocs}
              variant="outline"
            >
              {generatingDocs ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Generate Docs
                </>
              )}
            </Button>
            <Button 
              onClick={generateTestCases} 
              disabled={generatingTests}
              variant="outline"
            >
              {generatingTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Generate Tests
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="readme">README</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
            <TabsTrigger value="commits">Git History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Language</p>
                      <p className="text-2xl font-bold">{repository.language || 'Mixed'}</p>
                    </div>
                    <Code className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</p>
                      <p className="text-2xl font-bold">{formatBytes(repository.size * 1024)}</p>
                    </div>
                    <FileCode className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                      <p className="text-2xl font-bold">{formatDate(repository.created_at)}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Push</p>
                      <p className="text-2xl font-bold">{formatDate(repository.pushed_at)}</p>
                    </div>
                    <Activity className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {analysis.structure && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Structure Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{analysis.structure.totalFiles}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{analysis.structure.totalLines}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lines of Code</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{analysis.structure.testCoverage}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Test Coverage</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{analysis.structure.complexity.average}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg Complexity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="readme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>README</span>
                </CardTitle>
                <CardDescription>
                  Repository documentation and setup instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {readme ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {readme}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No README found</p>
                    <p className="text-sm">This repository doesn't have a README file.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            {analysis.codeAnalysis ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Code Quality Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Quality Score</span>
                            <span className="text-sm font-bold">{analysis.codeAnalysis.qualityScore}/100</span>
                          </div>
                          <Progress value={analysis.codeAnalysis.qualityScore} />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Maintainability Index</span>
                            <span className="text-sm font-bold">{analysis.codeAnalysis.maintainabilityIndex}/100</span>
                          </div>
                          <Progress value={analysis.codeAnalysis.maintainabilityIndex} />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                          {analysis.codeAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                        <h4 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.codeAnalysis.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.codeAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Run analysis to get detailed insights about this repository
                    </p>
                    <Button onClick={runAnalysis} disabled={analyzing}>
                      {analyzing ? 'Analyzing...' : 'Run Analysis'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documentation">
            {analysis.documentation ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysis.documentation.summary}</p>
                      </div>

                      {analysis.documentation.functions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Functions</h3>
                          <div className="space-y-4">
                            {analysis.documentation.functions.map((func, index) => (
                              <Card key={index}>
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-2">{func.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{func.description}</p>
                                  
                                  {func.parameters?.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="text-sm font-semibold mb-2">Parameters:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {func.parameters.map((param: any, paramIndex: number) => (
                                          <li key={paramIndex} className="text-sm">
                                            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{param.name}</code>
                                            <span className="text-gray-500"> ({param.type}): {param.description}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {func.returns && (
                                    <div>
                                      <h5 className="text-sm font-semibold mb-1">Returns:</h5>
                                      <p className="text-sm">
                                        <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{func.returns.type}</code>
                                        <span className="text-gray-500"> - {func.returns.description}</span>
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.documentation.examples.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                          <div className="space-y-4">
                            {analysis.documentation.examples.map((example, index) => (
                              <div key={index}>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={repository.language?.toLowerCase() || 'javascript'}
                                  PreTag="div"
                                >
                                  {example}
                                </SyntaxHighlighter>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Documentation Generated</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate AI-powered documentation for this repository
                    </p>
                    <Button onClick={generateDocumentation} disabled={generatingDocs}>
                      {generatingDocs ? 'Generating...' : 'Generate Documentation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tests">
            {analysis.testCases ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Test Cases</CardTitle>
                    <CardDescription>
                      Generated using {analysis.testCases.framework} - Estimated Coverage: {analysis.testCases.coverage}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Progress value={analysis.testCases.coverage} />
                    </div>
                    <div className="space-y-4">
                      {analysis.testCases.testCases.map((testCase, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{testCase.name}</h4>
                              <div className="flex space-x-2">
                                <Badge variant={testCase.type === 'unit' ? 'default' : testCase.type === 'integration' ? 'secondary' : 'outline'}>
                                  {testCase.type}
                                </Badge>
                                <Badge variant={testCase.priority === 'high' ? 'destructive' : testCase.priority === 'medium' ? 'default' : 'secondary'}>
                                  {testCase.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{testCase.description}</p>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={repository.language?.toLowerCase() || 'javascript'}
                              PreTag="div"
                            >
                              {testCase.code}
                            </SyntaxHighlighter>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Test Cases Generated</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate AI-powered test cases for this repository
                    </p>
                    <Button onClick={generateTestCases} disabled={generatingTests}>
                      {generatingTests ? 'Generating...' : 'Generate Test Cases'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="commits">
            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commits.map((commit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <GitCommit className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {commit.commit.message.split('\n')[0]}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {commit.commit.author.name}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(commit.commit.author.date)}
                          </span>
                          <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
