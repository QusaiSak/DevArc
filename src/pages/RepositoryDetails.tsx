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
import { saveAnalysis, getAnalysis } from '@/lib/analysesService'
import { isFavorite as checkIsFavorite, addFavorite, removeFavorite } from '@/lib/favoritesService'
import type { ComprehensiveDocumentation } from '@/types/codeparser.interface'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FavoriteButton } from '@/components/FavoriteButton'
import { toast } from 'sonner'

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
  documentation?: ComprehensiveDocumentation
  testCases?: {
    testCases: any[]
    coverage: number
    framework: string
  }
}

// Remove unused `GitHubFile` and `repositoryName`
// Removed the `GitHubFile` interface and `repositoryName` variable as they are not used.

export default function RepositoryDetailsPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [repository, setRepository] = useState<RepositoryData | null>(null)
  const [readme, setReadme] = useState<string>('')
  const [commits, setCommits] = useState<Array<{
    sha: string;
    commit: {
      message: string;
      author: {
        name: string;
        date: string;
      };
    };
    html_url: string;
  }>>([])
  const [analysis, setAnalysis] = useState<AnalysisResults>({})
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingDocs, setGeneratingDocs] = useState(false)
  const [generatingTests, setGeneratingTests] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorite, setIsFavorite] = useState(false)

  // Check if project is favorite and load stored analysis
  useEffect(() => {
    if (owner && repo && user && repository) {
      const projectId = `${owner}/${repo}`;
      
      // Check if project is favorite using repository.id
      checkIsFavorite(user.id, repository.id.toString())
        .then(setIsFavorite)
        .catch(console.error);
      
      // Load stored analysis if available
      getAnalysis(user.id, projectId)
        .then(({ analysis }) => {
          if (analysis.structure) {
            setAnalysis(prev => ({ ...prev, structure: JSON.parse(analysis.structure) }));
          }
          if (analysis.codeAnalysis) {
            setAnalysis(prev => ({ ...prev, codeAnalysis: JSON.parse(analysis.codeAnalysis) }));
          }
          if (analysis.documentation) {
            setAnalysis(prev => ({ ...prev, documentation: JSON.parse(analysis.documentation) }));
          }
          if (analysis.testCases) {
            setAnalysis(prev => ({ ...prev, testCases: JSON.parse(analysis.testCases) }));
          }
        })
        .catch(() => {
          // No stored analysis found, that's ok
        });
    }
  }, [owner, repo, user, repository]);

  // Fetch repository data
  useEffect(() => {
    const fetchRepositoryData = async () => {
      if (!owner || !repo) return;

      setLoading(true);
      setError(null);

      try {
        const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
          credentials: 'include',
        });

        const tokenData = await tokenResponse.json();
        const githubService = new GitHubService(tokenData.access_token);

        const repoData = await githubService.fetch(`repos/${owner}/${repo}`);
        setRepository(repoData);

        const readmeContent = await githubService.getReadme(owner, repo);
        setReadme(readmeContent);

        const commitsData = await githubService.fetch(`repos/${owner}/${repo}/commits`);
        setCommits(
          commitsData.map((commit: any) => ({
            sha: commit.sha,
            commit: {
              message: commit.commit.message,
              author: {
                name: commit.commit.author?.name || 'Unknown',
                date: commit.commit.author?.date || 'Unknown',
              },
            },
            html_url: commit.html_url,
          }))
        );
      } catch (error) {
        console.error('Error fetching repository data:', error);
        setError('Failed to fetch repository data');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositoryData();
  }, [owner, repo, user]);

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

      // Note: Analysis is now complete but not stored yet
      console.log('Analysis completed successfully - ready to store')

    } catch (error) {
      console.error('Analysis failed:', error)
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const storeAnalysis = async () => {
    if (!owner || !repo || !user || !analysis) {
      console.error('Missing data for storing analysis')
      toast.error('Missing data for storing analysis')
      return
    }

    try {
      const projectId = `${owner}/${repo}`;
      await saveAnalysis(user.id, {
        projectId,
        projectName: repository?.name || `${owner}/${repo}`,
        structure: JSON.stringify(analysis.structure),
        codeAnalysis:  analysis.codeAnalysis?JSON.stringify(analysis.codeAnalysis):null,
        documentation: analysis.documentation ? JSON.stringify(analysis.documentation) : null,
        testCases: analysis.testCases ? JSON.stringify(analysis.testCases) : null,
      });
      
      console.log('Analysis stored successfully!')
      toast.success('Analysis stored successfully!')
      
    } catch (error) {
      console.error('Failed to store analysis:', error)
      toast.error('Failed to store analysis. Please try again.')
      setError('Failed to store analysis. Please try again.')
    }
  }

  const generateDocumentation = async () => {
    if (!owner || !repo || !user) return;

    setGeneratingDocs(true);
    try {
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      });
      const tokenData = await tokenResponse.json();
      const aiAnalyzer = new AIAnalyzer();
      // Use already-analyzed structure if available
      const structure = analysis.structure || (await new StructureAnalyzer(tokenData.access_token).analyzeRepository(owner, repo));
      const language = repository?.language?.toLowerCase() || 'javascript';
      const documentation = await aiAnalyzer.generateComprehensiveDocumentation(
        structure,
        language,
        repository?.name || 'Repository'
      );
      setAnalysis((prev) => ({
        ...prev,
        documentation,
      }));
      
      // Save documentation to backend
      if (owner && repo && user) {
        const projectId = `${owner}/${repo}`;
        await saveAnalysis(user.id, {
          projectId,
          projectName: repository?.name || `${owner}/${repo}`,
          documentation: JSON.stringify(documentation),
        });
      }
    } catch (error) {
      console.error('Documentation generation failed:', error);
      setError('Documentation generation failed. Please try again.');
    } finally {
      setGeneratingDocs(false);
    }
  };

  // Update the component to use user-specific storage in the generateTestCases function
  const generateTestCases = async () => {
    if (!owner || !repo || !user) return;

    setGeneratingTests(true);
    try {
      const tokenResponse = await fetch('http://localhost:4000/api/github-token', {
        credentials: 'include',
      });

      const tokenData = await tokenResponse.json();
      const aiAnalyzer = new AIAnalyzer();
      
      // Use already-analyzed structure if available
      const structure = analysis.structure || (await new StructureAnalyzer(tokenData.access_token).analyzeRepository(owner, repo));
      const language = repository?.language?.toLowerCase() || 'javascript';

      // Use the new structure-based test generation method
      const testResult = await aiAnalyzer.generateTestCasesFromStructure(
        structure,
        language,
        repository?.name || 'Repository'
      );

      const updatedTestCases = {
        testCases: testResult.testCases,
        coverage: testResult.coverage,
        framework: testResult.framework,
      };

      setAnalysis((prev) => ({
        ...prev,
        testCases: updatedTestCases,
      }));

      // Save test results to backend
      if (user && owner && repo) {
        const projectId = `${owner}/${repo}`;
        await saveAnalysis(user.id, {
          projectId,
          projectName: repository?.name || `${owner}/${repo}`,
          testCases: JSON.stringify(updatedTestCases),
        });
      }
    } catch (error) {
      console.error('Test generation failed:', error);
      setError('Test generation failed. Please try again.');
    } finally {
      setGeneratingTests(false);
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

  // Export documentation to Word format
  const exportToWord = async (documentation: ComprehensiveDocumentation) => {
    try {
      // Create a comprehensive document structure
      const docContent = `
# ${repository?.name || 'Repository'} Documentation

## Project Summary
${documentation.summary}

## Architecture Overview
**Pattern**: ${documentation.architecture.pattern}
**Description**: ${documentation.architecture.description}

### Technologies Used
${documentation.architecture.technologies.map(tech => `- ${tech}`).join('\n')}

### Architecture Layers
${documentation.architecture.layers.map(layer => `
**${layer.name}**
${layer.description}
Components: ${layer.components.join(', ')}
`).join('\n')}

## Folder Structure
\`\`\`
${documentation.folderStructure.tree}
\`\`\`

### Directory Details
${documentation.folderStructure.directories.map(dir => `
**${dir.path}** (${dir.type})
Purpose: ${dir.purpose}
Files: ${dir.fileCount}
${dir.description}
`).join('\n')}

## Code Internals

### Code Flow
${documentation.codeInternals.codeFlow}

### Data Flow
${documentation.codeInternals.dataFlow}

### Key Algorithms
${documentation.codeInternals.keyAlgorithms.map(algo => `
**${algo.name}** (${algo.file})
${algo.description}
Implementation: ${algo.implementation}
Complexity: ${algo.complexity}
`).join('\n')}

### Design Patterns
${documentation.codeInternals.designPatterns.map(pattern => `
**${pattern.pattern}**
Usage: ${pattern.usage}
Files: ${pattern.files.join(', ')}
${pattern.description}
`).join('\n')}

### Business Logic
${documentation.codeInternals.businessLogic.map(logic => `
**${logic.module}**
Purpose: ${logic.purpose}
Workflow: ${logic.workflow}
Files: ${logic.files.join(', ')}
`).join('\n')}

## SDLC Documentation

### Development Workflow
${documentation.sdlc.developmentWorkflow}

### Setup Instructions
${documentation.sdlc.setupInstructions.map(step => `
${step.step}. **${step.title}**
   ${step.description}
   \`\`\`bash
   ${step.commands.join('\n   ')}
   \`\`\`
`).join('\n')}

### Build Process
${documentation.sdlc.buildProcess.description}

**Steps:**
${documentation.sdlc.buildProcess.steps.map(step => `- ${step}`).join('\n')}

**Tools:**
${documentation.sdlc.buildProcess.tools.map(tool => `- ${tool}`).join('\n')}

### Testing Strategy
**Approach:** ${documentation.sdlc.testingStrategy.approach}
**Coverage:** ${documentation.sdlc.testingStrategy.coverage}

**Test Types:**
${documentation.sdlc.testingStrategy.testTypes.map(type => `- ${type}`).join('\n')}

**Frameworks:**
${documentation.sdlc.testingStrategy.frameworks.map(framework => `- ${framework}`).join('\n')}

### Deployment Guide
${documentation.sdlc.deploymentGuide.process}

**Environments:** ${documentation.sdlc.deploymentGuide.environments.join(', ')}

${documentation.sdlc.deploymentGuide.steps.map(envStep => `
**${envStep.environment}:**
${envStep.steps.map(step => `- ${step}`).join('\n')}
`).join('\n')}

### Maintenance
**Guidelines:**
${documentation.sdlc.maintenance.guidelines.map(guide => `- ${guide}`).join('\n')}

**Monitoring:**
${documentation.sdlc.maintenance.monitoring.map(monitor => `- ${monitor}`).join('\n')}

**Troubleshooting:**
${documentation.sdlc.maintenance.troubleshooting.map(trouble => `
**Issue:** ${trouble.issue}
**Solution:** ${trouble.solution}
`).join('\n')}

## System Architecture Diagram (Mermaid)
\`\`\`mermaid
${documentation.mermaidDiagram}
\`\`\`

## Components (${documentation.components.length})
${documentation.components.map(component => `
### ${component.name} (${component.type})
**File**: ${component.file}
**Description**: ${component.description}

**Internals:**
- Purpose: ${component.internals.purpose}
- Key Methods: ${component.internals.keyMethods.join(', ')}
- State Management: ${component.internals.stateManagement}
- Lifecycle: ${component.internals.lifecycle}

**Dependencies**: ${component.dependencies.join(', ')}
**Exports**: ${component.exports.join(', ')}
`).join('\n')}

## API Endpoints (${documentation.apis.length})
${documentation.apis.map(api => `
### ${api.method} ${api.endpoint}
**Description**: ${api.description}

**Parameters**:
${api.parameters.map(param => `- **${param.name}** (${param.type}): ${param.description}`).join('\n')}

**Response**: ${api.response}

**Implementation Details:**
- Implementation: ${api.internals.implementation}
- Validation: ${api.internals.validation}
- Error Handling: ${api.internals.errorHandling}
- Authentication: ${api.internals.authentication}
`).join('\n')}

## Functions & Methods (${documentation.functions.length})
${documentation.functions.map(func => `
### ${func.name} (${func.type})
**File**: ${func.file}
**Description**: ${func.description}

**Parameters**:
${func.parameters.map(param => `- **${param.name}** (${param.type}): ${param.description}`).join('\n')}

**Returns**: ${func.returns.type} - ${func.returns.description}

**Internal Details:**
- Algorithm: ${func.internals.algorithm}
- Complexity: ${func.internals.complexity}
- Side Effects: ${func.internals.sideEffects}
- Dependencies: ${func.internals.dependencies.join(', ')}
`).join('\n')}

## Data Models & Interfaces (${documentation.dataModels.length})
${documentation.dataModels.map(model => `
### ${model.name} (${model.type})
**File**: ${model.file}

**Properties**:
${model.properties.map(prop => `- **${prop.name}** (${prop.type}): ${prop.description}`).join('\n')}

**Relationships**:
${model.relationships.map(rel => `- ${rel.model} (${rel.type}): ${rel.description}`).join('\n')}

**Validation**:
${model.validation.map(rule => `- ${rule}`).join('\n')}
`).join('\n')}

## Usage Examples
${documentation.examples.map(example => `
### ${example.title}
${example.description}

\`\`\`${repository?.language?.toLowerCase() || 'javascript'}
${example.code}
\`\`\`

**Explanation:** ${example.explanation}
`).join('\n')}

---
*Generated on ${new Date().toLocaleDateString()} for ${repository?.full_name || 'Repository'}*
      `;

      // Create a Blob with the content
      const blob = new Blob([docContent], { type: 'text/markdown' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${repository?.name || 'repository'}-documentation.md`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success message (you could add a toast notification here)
      console.log('Documentation exported successfully!');
      
    } catch (error) {
      console.error('Failed to export documentation:', error);
      // Show error message (you could add a toast notification here)
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (owner && repo && user && repository) {
      try {
        if (isFavorite) {
          // Use the same repoId format as when adding
          await removeFavorite(user.id, repository.id.toString());
          setIsFavorite(false);
          toast.success('Removed from Favorites', {
            description: `${repository.name} has been removed from your favorites.`,
          });
        } else {
          await addFavorite(user.id, repository);
          setIsFavorite(true);
          toast.success('Added to Favorites', {
            description: `${repository.name} has been added to your favorites.`,
          });
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        toast.error('Error', {
          description: 'Failed to update favorites. Please try again.',
        });
      }
    }
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
                onClick={toggleFavorite}
                className={isFavorite ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : ''}
              >
                <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
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
            {analysis && (
              <Button 
                onClick={storeAnalysis} 
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}
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
                      <p className="text-2xl font-bold text-orange-600">{analysis.structure.complexity.average.toFixed(2)}</p>
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
                        code({ className, children }: { className?: string; children?: React.ReactNode }) {
                          const match = /language-(\w+)/.exec(className || '')
                          const inline = !match
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className}>
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
                    {analysis && (
                      <Button 
                        onClick={storeAnalysis} 
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white border-green-600 ml-2"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Store Analysis
                      </Button>
                    )}
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
                    <CardTitle className="flex items-center justify-between">
                      <span>Enhanced Documentation</span>
                      <Button 
                        onClick={() => exportToWord(analysis.documentation!)} 
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive documentation with code internals, SDLC guide, and architecture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Project Summary</h3>
                        <p className="text-gray-600 dark:text-gray-400">{analysis.documentation.summary}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Architecture Overview</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium">Pattern: {analysis.documentation.architecture.pattern}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{analysis.documentation.architecture.description}</p>
                          <div className="mt-2">
                            <span className="text-sm font-medium">Technologies: </span>
                            {analysis.documentation.architecture.technologies.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="mr-1">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {analysis.documentation.folderStructure?.tree && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Folder Structure</h3>
                          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                            {analysis.documentation.folderStructure.tree}
                          </pre>
                        </div>
                      )}

                      {analysis.documentation.codeInternals && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Code Internals</h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            <div>
                              <span className="font-medium">Code Flow: </span>
                              <span className="text-sm">{analysis.documentation.codeInternals.codeFlow}</span>
                            </div>
                            <div>
                              <span className="font-medium">Data Flow: </span>
                              <span className="text-sm">{analysis.documentation.codeInternals.dataFlow}</span>
                            </div>
                            {analysis.documentation.codeInternals.keyAlgorithms.length > 0 && (
                              <div>
                                <span className="font-medium">Key Algorithms: </span>
                                <span className="text-sm">{analysis.documentation.codeInternals.keyAlgorithms.length} documented</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {analysis.documentation.sdlc && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">SDLC Documentation</h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            <div>
                              <span className="font-medium">Development Workflow: </span>
                              <span className="text-sm">{analysis.documentation.sdlc.developmentWorkflow}</span>
                            </div>
                            <div>
                              <span className="font-medium">Setup Instructions: </span>
                              <span className="text-sm">{analysis.documentation.sdlc.setupInstructions.length} steps documented</span>
                            </div>
                            <div>
                              <span className="font-medium">Testing Strategy: </span>
                              <span className="text-sm">{analysis.documentation.sdlc.testingStrategy.approach}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis.documentation.functions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Functions ({analysis.documentation.functions.length})</h3>
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {analysis.documentation.functions.slice(0, 5).map((func, index) => (
                              <Card key={index}>
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-2">{func.name}</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{func.description}</p>
                                  
                                  {func.parameters?.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="text-sm font-semibold mb-2">Parameters:</h5>
                                      <ul className="list-disc list-inside space-y-1">
                                        {func.parameters.map((param: { name: string; type: string; description: string }, paramIndex: number) => (
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
                            {analysis.documentation.functions.length > 5 && (
                              <p className="text-sm text-gray-500 text-center">
                                And {analysis.documentation.functions.length - 5} more functions...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {analysis.documentation.mermaidDiagram && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Architecture Diagram</h3>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                            <pre className="text-sm">{analysis.documentation.mermaidDiagram}</pre>
                            <p className="text-xs text-gray-500 mt-2">
                              View at{' '}
                              <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                mermaid.live
                              </a>
                            </p>
                          </div>
                        </div>
                      )}

                      {analysis.documentation.examples.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                          <div className="space-y-4">
                            {analysis.documentation.examples.map((example, index) => (
                              <div key={index}>
                                <h4 className="font-medium mb-2">{example.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{example.description}</p>
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={repository.language?.toLowerCase() || 'javascript'}
                                  PreTag="div"
                                >
                                  {example.code}
                                </SyntaxHighlighter>
                                {example.explanation && (
                                  <p className="text-sm text-gray-500 mt-2">{example.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold mb-2">Components: {analysis.documentation.components.length}</h4>
                          <p className="text-sm text-gray-600">React/UI components documented</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">APIs: {analysis.documentation.apis.length}</h4>
                          <p className="text-sm text-gray-600">API endpoints documented</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Data Models: {analysis.documentation.dataModels.length}</h4>
                          <p className="text-sm text-gray-600">Data structures documented</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">SDLC Guide</h4>
                          <p className="text-sm text-gray-600">Complete development lifecycle</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Enhanced Documentation Ready</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate comprehensive documentation with code internals, SDLC guide, and folder structure
                    </p>
                    <Button onClick={generateDocumentation} disabled={generatingDocs}>
                      {generatingDocs ? 'Generating...' : 'Generate Enhanced Documentation'}
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
                <CardTitle>Recent Git History</CardTitle>
                <CardDescription>
                  Latest commits and changes to this repository
                </CardDescription>
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
                          <a 
                            href={commit.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View on GitHub
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  {commits.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <GitCommit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No commits found</p>
                      <p className="text-sm">Unable to fetch commit history for this repository.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
