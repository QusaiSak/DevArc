import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
  Github,
  Eye,
  GitCommit,
  Users,
  Clock,
  Target,
  FileCode,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { GitHubService } from "@/lib/github";
import { StructureAnalyzer } from "@/lib/structure";
import { AIAnalyzer } from "@/lib/aiService";
import { saveAnalysis, getAnalysis } from "@/lib/analysesService";
import {
  isFavorite as checkIsFavorite,
  addFavorite,
  removeFavorite,
} from "@/lib/favoritesService";
import type { ComprehensiveDocumentation } from "@/types/codeparser.interface";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import MermaidDiagram from "@/components/MermaidDiagram";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface RepositoryData {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface AnalysisResults {
  structure?: {
    totalFiles: number;
    totalLines: number;
    testCoverage: number;
    complexity: {
      average: number;
    };
  };
  codeAnalysis?: {
    qualityScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    maintainabilityIndex: number;
  };
  documentation?: ComprehensiveDocumentation;
  testCases?: {
    testCases: {
      name: string;
      type: string;
      priority: string;
      description: string;
      code: string;
    }[];
    coverage: number;
    framework: string;
  };
}

// Remove unused `GitHubFile` and `repositoryName`
// Removed the `GitHubFile` interface and `repositoryName` variable as they are not used.

export default function RepositoryDetailsPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [readme, setReadme] = useState<string>("");
  const [commits, setCommits] = useState<
    Array<{
      sha: string;
      commit: {
        message: string;
        author: {
          name: string;
          date: string;
        };
      };
      html_url: string;
    }>
  >([]);
  const [analysis, setAnalysis] = useState<AnalysisResults>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [generatingTests, setGeneratingTests] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorite, setIsFavorite] = useState(false);

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
            setAnalysis((prev) => ({
              ...prev,
              structure:
                typeof analysis.structure === "string"
                  ? JSON.parse(analysis.structure)
                  : analysis.structure,
            }));
          }
          if (analysis.codeAnalysis) {
            setAnalysis((prev) => ({
              ...prev,
              codeAnalysis:
                typeof analysis.codeAnalysis === "string"
                  ? JSON.parse(analysis.codeAnalysis)
                  : analysis.codeAnalysis,
            }));
          }
          if (analysis.documentation) {
            setAnalysis((prev) => ({
              ...prev,
              documentation:
                typeof analysis.documentation === "string"
                  ? JSON.parse(analysis.documentation)
                  : analysis.documentation,
            }));
          }
          if (analysis.testCases) {
            setAnalysis((prev) => ({
              ...prev,
              testCases:
                typeof analysis.testCases === "string"
                  ? JSON.parse(analysis.testCases)
                  : analysis.testCases,
            }));
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
        const tokenResponse = await fetch(
          "http://localhost:4000/api/github-token",
          {
            credentials: "include",
          }
        );

        const tokenData = await tokenResponse.json();
        const githubService = new GitHubService(tokenData.access_token);

        const repoData = (await githubService.fetch(
          `repos/${owner}/${repo}`
        )) as RepositoryData;
        setRepository(repoData);

        const readmeContent = await githubService.getReadme(owner, repo);
        setReadme(readmeContent);

        const commitsData = (await githubService.fetch(
          `repos/${owner}/${repo}/commits`
        )) as Array<{
          sha: string;
          commit: {
            message: string;
            author: {
              name: string;
              date: string;
            };
          };
          html_url: string;
        }>;
        if (Array.isArray(commitsData)) {
          setCommits(
            commitsData.map((commit) => ({
              sha: commit.sha,
              commit: {
                message: commit.commit.message,
                author: {
                  name: commit.commit.author?.name || "Unknown",
                  date: commit.commit.author?.date || "Unknown",
                },
              },
              html_url: commit.html_url,
            }))
          );
        } else {
          setCommits([]);
        }
      } catch (error) {
        console.error("Error fetching repository data:", error);
        setError("Failed to fetch repository data");
      } finally {
        setLoading(false);
      }
    };

    fetchRepositoryData();
  }, [owner, repo, user]);

  const runAnalysis = async () => {
    if (!owner || !repo || !user) return;

    setAnalyzing(true);
    try {
      // Get GitHub token
      const tokenResponse = await fetch(
        "http://localhost:4000/api/github-token",
        {
          credentials: "include",
        }
      );

      const tokenData = await tokenResponse.json();
      if (!tokenData.success) {
        throw new Error("GitHub token not found");
      }

      // Run structure analysis
      const structureAnalyzer = new StructureAnalyzer(tokenData.access_token);
      const structure = await structureAnalyzer.analyzeRepository(owner, repo);

      // Run AI analysis
      const aiAnalyzer = new AIAnalyzer();
      const codeAnalysis = await aiAnalyzer.analyzeCodeStructure(structure);

      setAnalysis({
        structure,
        codeAnalysis,
      });

      // Note: Analysis is now complete but not stored yet
      console.log("Analysis completed successfully - ready to store");
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const storeAnalysis = async () => {
    if (!owner || !repo || !user) {
      console.error("Missing data for storing analysis");
      toast.error("Missing data for storing analysis");
      return;
    }

    // Check what analysis data is available
    if (
      !analysis.structure &&
      !analysis.codeAnalysis &&
      !analysis.documentation &&
      !analysis.testCases
    ) {
      toast.error("No analysis data to store. Please run analysis first.");
      return;
    }

    try {
      const projectId = `${owner}/${repo}`;
      await saveAnalysis(user.id, {
        projectId,
        projectName: repository?.name || `${owner}/${repo}`,
        structure: analysis.structure
          ? JSON.stringify(analysis.structure)
          : null,
        codeAnalysis: analysis.codeAnalysis
          ? JSON.stringify(analysis.codeAnalysis)
          : null,
        documentation: analysis.documentation
          ? JSON.stringify(analysis.documentation)
          : null,
        testCases: analysis.testCases
          ? JSON.stringify(analysis.testCases)
          : null,
      });

      console.log("Analysis stored successfully!");
      toast.success("Analysis stored successfully!");
    } catch (error) {
      console.error("Failed to store analysis:", error);
      toast.error("Failed to store analysis. Please try again.");
    }
  };

  const generateDocumentation = async () => {
    if (!owner || !repo || !user) return;

    setGeneratingDocs(true);
    try {
      const tokenResponse = await fetch(
        "http://localhost:4000/api/github-token",
        {
          credentials: "include",
        }
      );
      const tokenData = await tokenResponse.json();
      const aiAnalyzer = new AIAnalyzer();
      // Always do fresh analysis for comprehensive documentation
      const structure = await new StructureAnalyzer(
        tokenData.access_token
      ).analyzeRepository(owner, repo);
      const language = repository?.language?.toLowerCase() || "javascript";
      const documentation = await aiAnalyzer.generateComprehensiveDocumentation(
        structure,
        language,
        repository?.name || "Repository"
      );
      setAnalysis((prev) => ({
        ...prev,
        documentation,
      }));

      // DON'T automatically save - only update local state
      console.log("Documentation generated successfully - ready to store");
    } catch (error) {
      console.error("Documentation generation failed:", error);
      setError("Documentation generation failed. Please try again.");
    } finally {
      setGeneratingDocs(false);
    }
  };

  const generateTestCases = async () => {
    if (!owner || !repo || !user) return;

    setGeneratingTests(true);
    try {
      const tokenResponse = await fetch(
        "http://localhost:4000/api/github-token",
        {
          credentials: "include",
        }
      );

      const tokenData = await tokenResponse.json();
      const aiAnalyzer = new AIAnalyzer();

      // Always do fresh analysis for test generation
      const structure = await new StructureAnalyzer(
        tokenData.access_token
      ).analyzeRepository(owner, repo);
      const language = repository?.language?.toLowerCase() || "javascript";

      // Use the new structure-based test generation method
      const testResult = await aiAnalyzer.generateTestCasesFromStructure(
        structure,
        language,
        repository?.name || "Repository"
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

      // DON'T automatically save - only update local state
      console.log("Test cases generated successfully - ready to store");
    } catch (error) {
      console.error("Test generation failed:", error);
      setError("Test generation failed. Please try again.");
    } finally {
      setGeneratingTests(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Export documentation to Word format
  const exportToWord = async (documentation: ComprehensiveDocumentation) => {
    try {
      // Create a comprehensive document structure
      const docContent = `
# ${repository?.name || "Repository"} Documentation

## Project Summary
${documentation.summary || "No summary available"}

## Architecture Overview
**Pattern**: ${documentation.architecture?.pattern || "Unknown pattern"}
**Description**: ${
        documentation.architecture?.description || "No description available"
      }

### Technologies Used
${
  documentation.architecture?.technologies
    ?.map((tech) => `- ${tech}`)
    .join("\n") || "No technologies specified"
}

### Architecture Layers
${
  documentation.architecture?.layers
    ?.map(
      (layer) => `
**${layer.name}**
${layer.description}
Components: ${layer.components?.join(", ") || "None"}
`
    )
    .join("\n") || "No architecture layers defined"
}

## Folder Structure
\`\`\`
${documentation.folderStructure?.tree || "No folder structure available"}
\`\`\`

### Directory Details
${
  documentation.folderStructure?.directories
    ?.map(
      (dir) => `
**${dir.path}** (${dir.type})
Purpose: ${dir.purpose}
Files: ${dir.fileCount}
${dir.description}
`
    )
    .join("\n") || "No directory details available"
}

## Code Internals

### Code Flow
${documentation.codeInternals?.codeFlow || "No code flow description available"}

### Data Flow
${documentation.codeInternals?.dataFlow || "No data flow description available"}

### Key Algorithms
${
  documentation.codeInternals?.keyAlgorithms
    ?.map(
      (algo) => `
**${algo.name}** (${algo.file})
${algo.description}
Implementation: ${algo.implementation}
Complexity: ${algo.complexity}
`
    )
    .join("\n") || "No key algorithms documented"
}

### Design Patterns
${
  documentation.codeInternals?.designPatterns
    ?.map(
      (pattern) => `
**${pattern.pattern}**
Usage: ${pattern.usage}
Files: ${pattern.files?.join(", ") || "None"}
${pattern.description}
`
    )
    .join("\n") || "No design patterns documented"
}

### Business Logic
${
  documentation.codeInternals?.businessLogic
    ?.map(
      (logic) => `
**${logic.module}**
Purpose: ${logic.purpose}
Workflow: ${logic.workflow}
Files: ${logic.files?.join(", ") || "None"}
`
    )
    .join("\n") || "No business logic documented"
}

## SDLC Documentation

### Development Workflow
${
  documentation.sdlc?.developmentWorkflow ||
  "No development workflow documented"
}

### Setup Instructions
${
  documentation.sdlc?.setupInstructions
    ?.map(
      (step) => `
${step.step}. **${step.title}**
   ${step.description}
   \`\`\`bash
   ${step.commands?.join("\n   ") || "No commands"}
   \`\`\`
`
    )
    .join("\n") || "No setup instructions available"
}

### Build Process
${
  documentation.sdlc?.buildProcess?.description || "No build process documented"
}

**Steps:**
${
  documentation.sdlc?.buildProcess?.steps
    ?.map((step) => `- ${step}`)
    .join("\n") || "No build steps documented"
}

**Tools:**
${
  documentation.sdlc?.buildProcess?.tools
    ?.map((tool) => `- ${tool}`)
    .join("\n") || "No build tools documented"
}

### Testing Strategy
**Approach:** ${
        documentation.sdlc?.testingStrategy?.approach ||
        "No testing approach documented"
      }
**Coverage:** ${documentation.sdlc?.testingStrategy?.coverage || "Unknown"}

**Test Types:**
${
  documentation.sdlc?.testingStrategy?.testTypes
    ?.map((type) => `- ${type}`)
    .join("\n") || "No test types documented"
}

**Frameworks:**
${
  documentation.sdlc?.testingStrategy?.frameworks
    ?.map((framework) => `- ${framework}`)
    .join("\n") || "No testing frameworks documented"
}

### Deployment Guide
${
  documentation.sdlc?.deploymentGuide?.process ||
  "No deployment process documented"
}

**Environments:** ${
        documentation.sdlc?.deploymentGuide?.environments?.join(", ") ||
        "No environments specified"
      }

${
  documentation.sdlc?.deploymentGuide?.steps
    ?.map(
      (envStep) => `
**${envStep.environment}:**
${envStep.steps?.map((step) => `- ${step}`).join("\n") || "No steps specified"}
`
    )
    .join("\n") || "No deployment steps documented"
}

### Maintenance
**Guidelines:**
${
  documentation.sdlc?.maintenance?.guidelines
    ?.map((guide) => `- ${guide}`)
    .join("\n") || "No maintenance guidelines documented"
}

**Monitoring:**
${
  documentation.sdlc?.maintenance?.monitoring
    ?.map((monitor) => `- ${monitor}`)
    .join("\n") || "No monitoring information documented"
}

**Troubleshooting:**
${
  documentation.sdlc?.maintenance?.troubleshooting
    ?.map(
      (trouble) => `
**Issue:** ${trouble.issue}
**Solution:** ${trouble.solution}
`
    )
    .join("\n") || "No troubleshooting information documented"
}

## System Architecture Diagram (Mermaid)
\`\`\`mermaid
${documentation.mermaidDiagram || "No architecture diagram available"}
\`\`\`

## Components (${documentation.components?.length || 0})
${
  documentation.components
    ?.map(
      (component) => `
### ${component.name} (${component.type})
**File**: ${component.file}
**Description**: ${component.description}

**Internals:**
- Purpose: ${component.internals?.purpose || "Unknown"}
- Key Methods: ${component.internals?.keyMethods?.join(", ") || "None"}
- State Management: ${component.internals?.stateManagement || "Unknown"}
- Lifecycle: ${component.internals?.lifecycle || "Unknown"}

**Dependencies**: ${component.dependencies?.join(", ") || "None"}
**Exports**: ${component.exports?.join(", ") || "None"}
`
    )
    .join("\n") || "No components documented"
}

## API Endpoints (${documentation.apis?.length || 0})
${
  documentation.apis
    ?.map(
      (api) => `
### ${api.method} ${api.endpoint}
**Description**: ${api.description}

**Parameters**:
${
  api.parameters
    ?.map(
      (param) => `- **${param.name}** (${param.type}): ${param.description}`
    )
    .join("\n") || "No parameters"
}

**Response**: ${api.response}

**Implementation Details:**
- Implementation: ${api.internals?.implementation || "Unknown"}
- Validation: ${api.internals?.validation || "Unknown"}
- Error Handling: ${api.internals?.errorHandling || "Unknown"}
- Authentication: ${api.internals?.authentication || "Unknown"}
`
    )
    .join("\n") || "No API endpoints documented"
}

## Functions & Methods (${documentation.functions?.length || 0})
${
  documentation.functions
    ?.map(
      (func) => `
### ${func.name} (${func.type})
**File**: ${func.file}
**Description**: ${func.description}

**Parameters**:
${
  func.parameters
    ?.map(
      (param) => `- **${param.name}** (${param.type}): ${param.description}`
    )
    .join("\n") || "No parameters"
}

**Returns**: ${func.returns?.type || "void"} - ${
        func.returns?.description || "No description"
      }

**Internal Details:**
- Algorithm: ${func.internals?.algorithm || "Unknown"}
- Complexity: ${func.internals?.complexity || "Unknown"}
- Side Effects: ${func.internals?.sideEffects || "None"}
- Dependencies: ${func.internals?.dependencies?.join(", ") || "None"}
`
    )
    .join("\n") || "No functions documented"
}

## Data Models & Interfaces (${documentation.dataModels?.length || 0})
${
  documentation.dataModels
    ?.map(
      (model) => `
### ${model.name} (${model.type})
**File**: ${model.file}

**Properties**:
${
  model.properties
    ?.map((prop) => `- **${prop.name}** (${prop.type}): ${prop.description}`)
    .join("\n") || "No properties documented"
}

**Relationships**:
${
  model.relationships
    ?.map((rel) => `- ${rel.model} (${rel.type}): ${rel.description}`)
    .join("\n") || "No relationships documented"
}

**Validation**:
${
  model.validation?.map((rule) => `- ${rule}`).join("\n") ||
  "No validation rules documented"
}
`
    )
    .join("\n") || "No data models documented"
}

## Usage Examples
${
  documentation.examples
    ?.map(
      (example) => `
### ${example.title}
${example.description}

\`\`\`${repository?.language?.toLowerCase() || "javascript"}
${example.code}
\`\`\`

**Explanation:** ${example.explanation}
`
    )
    .join("\n") || "No usage examples documented"
}

---
*Generated on ${new Date().toLocaleDateString()} for ${
        repository?.full_name || "Repository"
      }*
      `;

      // Create a Blob with the content
      const blob = new Blob([docContent], { type: "text/markdown" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${repository?.name || "repository"}-documentation.md`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      // Show success message (you could add a toast notification here)
      console.log("Documentation exported successfully!");
    } catch (error) {
      console.error("Failed to export documentation:", error);
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
          toast.success("Removed from Favorites", {
            description: `${repository.name} has been removed from your favorites.`,
          });
        } else {
          await addFavorite(user.id, repository);
          setIsFavorite(true);
          toast.success("Added to Favorites", {
            description: `${repository.name} has been added to your favorites.`,
          });
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        toast.error("Error", {
          description: "Failed to update favorites. Please try again.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading repository details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Repository
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || "Repository not found"}
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {repository.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {repository.description || "No description available"}
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
                className={
                  isFavorite
                    ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                    : ""
                }
              >
                <Star
                  className={`w-4 h-4 mr-2 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(repository.html_url, "_blank")}
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
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Language
                      </p>
                      <p className="text-2xl font-bold">
                        {repository.language || "Mixed"}
                      </p>
                    </div>
                    <Code className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Size
                      </p>
                      <p className="text-2xl font-bold">
                        {formatBytes(repository.size * 1024)}
                      </p>
                    </div>
                    <FileCode className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Created
                      </p>
                      <p className="text-2xl font-bold">
                        {formatDate(repository.created_at)}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Last Push
                      </p>
                      <p className="text-2xl font-bold">
                        {formatDate(repository.pushed_at)}
                      </p>
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
                      <p className="text-2xl font-bold text-blue-600">
                        {analysis.structure.totalFiles}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Files
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {analysis.structure.totalLines}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Lines of Code
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analysis.structure.testCoverage}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Test Coverage
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {analysis.structure.complexity.average.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Complexity
                      </p>
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
                  <div className="prose dark:prose-invert max-w-none prose-table:border-collapse prose-table:w-full prose-th:border prose-th:p-3 prose-td:border prose-td:p-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-2xl font-black mb-4 border-b border-slate-300 dark:border-slate-700 pb-3 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-100 mt-6"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200 mt-4"
                            {...props}
                          />
                        ),
                        h4: ({ ...props }) => (
                          <h4
                            className="text-base font-medium mb-2 text-slate-700 dark:text-slate-200 mt-3"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p
                            className="mb-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc list-inside mb-3 text-slate-600 dark:text-slate-300 space-y-1 pl-4"
                            {...props}
                          />
                        ),
                        ol: ({ ...props }) => (
                          <ol
                            className="list-decimal list-inside mb-3 text-slate-600 dark:text-slate-300 space-y-1 pl-4"
                            {...props}
                          />
                        ),
                        li: ({ ...props }) => (
                          <li
                            className="mb-1 leading-relaxed text-sm"
                            {...props}
                          />
                        ),
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: {
                          inline?: boolean;
                          children?: React.ReactNode;
                          className?: string;
                        }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          const language = match ? match[1] : "";
                          const code = String(children).replace(/\n$/, "");

                          // Check if it's a Mermaid diagram
                          if (!inline && language === "mermaid") {
                            return <MermaidDiagram chart={code} />;
                          }

                          return inline ? (
                            <code
                              className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-700"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code
                              className="block bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-slate-300 dark:border-slate-700"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children, ...props }) => {
                          return (
                            <pre
                              className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 p-4 rounded-lg overflow-x-auto text-xs font-mono mb-4 border border-slate-300 dark:border-slate-700 shadow-inner"
                              {...props}
                            >
                              {children}
                            </pre>
                          );
                        },
                        a: ({ ...props }) => (
                          <a
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors decoration-blue-600/50 dark:decoration-blue-400/50 underline-offset-2"
                            {...props}
                          />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-r-lg italic text-slate-600 dark:text-slate-300 backdrop-blur-sm"
                            {...props}
                          />
                        ),
                        table: ({ ...props }) => (
                          <div className="overflow-x-auto mb-6 rounded-lg border border-slate-300 dark:border-slate-600 shadow-lg bg-white dark:bg-slate-800/30">
                            <table
                              className="min-w-full border-collapse bg-white dark:bg-slate-900"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ ...props }) => (
                          <thead
                            className="bg-slate-50 dark:bg-slate-800"
                            {...props}
                          />
                        ),
                        tbody: ({ ...props }) => (
                          <tbody
                            className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700"
                            {...props}
                          />
                        ),
                        th: ({ ...props }) => (
                          <th
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-6 py-3 text-left font-semibold text-slate-900 dark:text-slate-100 text-sm"
                            {...props}
                          />
                        ),
                        td: ({ ...props }) => (
                          <td
                            className="border border-slate-300 dark:border-slate-700 px-6 py-3 text-slate-700 dark:text-slate-300 text-sm"
                            {...props}
                          />
                        ),
                        hr: ({ ...props }) => (
                          <hr
                            className="my-4 border-slate-300 dark:border-slate-700"
                            {...props}
                          />
                        ),
                        img: ({ ...props }) => (
                          <img
                            className="max-w-full h-auto rounded-lg shadow-xl my-4 border border-slate-300 dark:border-slate-700"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {readme}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No README found</p>
                    <p className="text-sm">
                      This repository doesn't have a README file.
                    </p>
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
                            <span className="text-sm font-medium">
                              Quality Score
                            </span>
                            <span className="text-sm font-bold">
                              {analysis.codeAnalysis.qualityScore}/100
                            </span>
                          </div>
                          <Progress
                            value={analysis.codeAnalysis.qualityScore}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Maintainability Index
                            </span>
                            <span className="text-sm font-bold">
                              {analysis.codeAnalysis.maintainabilityIndex}/100
                            </span>
                          </div>
                          <Progress
                            value={analysis.codeAnalysis.maintainabilityIndex}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          Strengths
                        </h4>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                          {analysis.codeAnalysis.strengths.map(
                            (strength, index) => (
                              <li key={index} className="text-sm">
                                {strength}
                              </li>
                            )
                          )}
                        </ul>
                        <h4 className="font-semibold mb-2 text-orange-600">
                          Areas for Improvement
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.codeAnalysis.weaknesses.map(
                            (weakness, index) => (
                              <li key={index} className="text-sm">
                                {weakness}
                              </li>
                            )
                          )}
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
                      {analysis.codeAnalysis.recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Analysis Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Run analysis to get detailed insights about this
                      repository
                    </p>
                    <Button onClick={runAnalysis} disabled={analyzing}>
                      {analyzing ? "Analyzing..." : "Run Analysis"}
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
                      Comprehensive documentation with code internals, SDLC
                      guide, and architecture
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Project Summary
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {typeof analysis.documentation.summary === "string"
                            ? analysis.documentation.summary
                            : typeof analysis.documentation.summary === "object"
                            ? JSON.stringify(analysis.documentation.summary)
                            : "No summary available"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Architecture Overview
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium">
                            Pattern:{" "}
                            {typeof analysis.documentation.architecture
                              ?.pattern === "string"
                              ? analysis.documentation.architecture.pattern
                              : "Unknown pattern"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {typeof analysis.documentation.architecture
                              ?.description === "string"
                              ? analysis.documentation.architecture.description
                              : "No description available"}
                          </p>
                          <div className="mt-2">
                            <span className="text-sm font-medium">
                              Technologies:{" "}
                            </span>
                            {analysis.documentation.architecture?.technologies?.map(
                              (tech, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="mr-1"
                                >
                                  {typeof tech === "string" ? tech : "Unknown"}
                                </Badge>
                              )
                            ) || (
                              <span className="text-sm text-gray-500">
                                No technologies specified
                              </span>
                            )}
                          </div>

                          {/* Show Architecture Layers if available */}
                          {analysis.documentation.architecture?.layers?.length >
                            0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold mb-2">
                                Architecture Layers:
                              </h4>
                              <div className="space-y-2">
                                {analysis.documentation.architecture.layers.map(
                                  (layer, index) => (
                                    <div
                                      key={index}
                                      className="border-l-2 border-blue-500 pl-3"
                                    >
                                      <p className="font-medium text-sm">
                                        {layer.name}
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {layer.description}
                                      </p>
                                      {layer.components?.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          Components:{" "}
                                          {layer.components.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {analysis.documentation.folderStructure?.tree && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Folder Structure
                          </h3>
                          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                            {analysis.documentation.folderStructure?.tree}
                          </pre>

                          {/* Show Directory Details if available */}
                          {analysis.documentation.folderStructure?.directories
                            ?.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold mb-2">
                                Directory Details:
                              </h4>
                              <div className="space-y-2">
                                {analysis.documentation.folderStructure.directories.map(
                                  (dir, index) => (
                                    <div
                                      key={index}
                                      className="bg-white dark:bg-gray-700 p-3 rounded border"
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-sm">
                                          {dir.path}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {dir.type}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {dir.purpose}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {dir.description}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Files: {dir.fileCount}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {analysis.documentation.codeInternals && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Code Internals
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            <div>
                              <span className="font-medium">Code Flow: </span>
                              <span className="text-sm">
                                {typeof analysis.documentation.codeInternals
                                  .codeFlow === "string"
                                  ? analysis.documentation.codeInternals
                                      .codeFlow
                                  : "No code flow description available"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Data Flow: </span>
                              <span className="text-sm">
                                {typeof analysis.documentation.codeInternals
                                  .dataFlow === "string"
                                  ? analysis.documentation.codeInternals
                                      .dataFlow
                                  : "No data flow description available"}
                              </span>
                            </div>
                            {analysis.documentation.codeInternals.keyAlgorithms
                              ?.length > 0 && (
                              <div>
                                <span className="font-medium">
                                  Key Algorithms:{" "}
                                </span>
                                <span className="text-sm">
                                  {analysis.documentation.codeInternals
                                    .keyAlgorithms?.length || 0}{" "}
                                  documented
                                </span>
                              </div>
                            )}

                            {/* Show Key Algorithms Details */}
                            {analysis.documentation.codeInternals.keyAlgorithms
                              ?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">
                                  Algorithm Details:
                                </h4>
                                <div className="space-y-3">
                                  {analysis.documentation.codeInternals.keyAlgorithms.map(
                                    (algo, index) => (
                                      <div
                                        key={index}
                                        className="bg-white dark:bg-gray-700 p-3 rounded border"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-sm">
                                            {algo.name}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {algo.complexity}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          File: {algo.file}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-1">
                                          {algo.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Implementation: {algo.implementation}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Show Design Patterns */}
                            {analysis.documentation.codeInternals.designPatterns
                              ?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">
                                  Design Patterns:
                                </h4>
                                <div className="space-y-3">
                                  {analysis.documentation.codeInternals.designPatterns.map(
                                    (pattern, index) => (
                                      <div
                                        key={index}
                                        className="bg-white dark:bg-gray-700 p-3 rounded border"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-sm">
                                            {pattern.pattern}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          Usage: {pattern.usage}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-1">
                                          {pattern.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Files: {pattern.files?.join(", ")}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Show Business Logic */}
                            {analysis.documentation.codeInternals.businessLogic
                              ?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">
                                  Business Logic:
                                </h4>
                                <div className="space-y-3">
                                  {analysis.documentation.codeInternals.businessLogic.map(
                                    (logic, index) => (
                                      <div
                                        key={index}
                                        className="bg-white dark:bg-gray-700 p-3 rounded border"
                                      >
                                        <span className="font-medium text-sm">
                                          {logic.module}
                                        </span>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          Purpose: {logic.purpose}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Workflow: {logic.workflow}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Files: {logic.files?.join(", ")}
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {analysis.documentation.sdlc && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            SDLC Documentation
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                            <div>
                              <span className="font-medium">
                                Development Workflow:{" "}
                              </span>
                              <span className="text-sm">
                                {typeof analysis.documentation.sdlc
                                  .developmentWorkflow === "string"
                                  ? analysis.documentation.sdlc
                                      .developmentWorkflow
                                  : "No workflow description available"}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Setup Instructions:{" "}
                              </span>
                              <span className="text-sm">
                                {analysis.documentation.sdlc.setupInstructions
                                  ?.length || 0}{" "}
                                steps documented
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">
                                Testing Strategy:{" "}
                              </span>
                              <span className="text-sm">
                                {typeof analysis.documentation.sdlc
                                  .testingStrategy?.approach === "string"
                                  ? analysis.documentation.sdlc.testingStrategy
                                      .approach
                                  : "No testing strategy available"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysis.documentation.functions?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Functions (
                            {analysis.documentation.functions?.length || 0})
                          </h3>
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {analysis.documentation.functions
                              .slice(0, 5)
                              .map((func, index) => (
                                <Card key={index}>
                                  <CardContent className="pt-4">
                                    <h4 className="font-semibold mb-2">
                                      {typeof func.name === "string"
                                        ? func.name
                                        : "Unnamed Function"}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {typeof func.description === "string"
                                        ? func.description
                                        : "No description available"}
                                    </p>

                                    {func.parameters?.length > 0 && (
                                      <div className="mb-3">
                                        <h5 className="text-sm font-semibold mb-2">
                                          Parameters:
                                        </h5>
                                        <ul className="list-disc list-inside space-y-1">
                                          {func.parameters.map(
                                            (
                                              param: {
                                                name: string;
                                                type: string;
                                                description: string;
                                              },
                                              paramIndex: number
                                            ) => (
                                              <li
                                                key={paramIndex}
                                                className="text-sm"
                                              >
                                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                                  {typeof param.name ===
                                                  "string"
                                                    ? param.name
                                                    : "param"}
                                                </code>
                                                <span className="text-gray-500">
                                                  (
                                                  {typeof param.type ===
                                                  "string"
                                                    ? param.type
                                                    : "any"}
                                                  ):{" "}
                                                  {typeof param.description ===
                                                  "string"
                                                    ? param.description
                                                    : "No description"}
                                                </span>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}

                                    {func.returns && (
                                      <div>
                                        <h5 className="text-sm font-semibold mb-1">
                                          Returns:
                                        </h5>
                                        <p className="text-sm">
                                          <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                            {typeof func.returns?.type ===
                                            "string"
                                              ? func.returns.type
                                              : "void"}
                                          </code>
                                          <span className="text-gray-500">
                                            {" "}
                                            -
                                            {typeof func.returns
                                              ?.description === "string"
                                              ? func.returns.description
                                              : "No description"}
                                          </span>
                                        </p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            {analysis.documentation.functions?.length > 5 && (
                              <p className="text-sm text-gray-500 text-center">
                                And{" "}
                                {analysis.documentation.functions.length - 5}{" "}
                                more functions...
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {analysis.documentation.mermaidDiagram && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Architecture Diagram
                          </h3>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                            <pre className="text-sm">
                              <MermaidDiagram
                                chart={analysis.documentation.mermaidDiagram}
                              />
                            </pre>
                          </div>
                        </div>
                      )}

                      {analysis.documentation.examples?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Usage Examples
                          </h3>
                          <div className="space-y-4">
                            {analysis.documentation.examples.map(
                              (example, index) => (
                                <div key={index}>
                                  <h4 className="font-medium mb-2">
                                    {typeof example.title === "string"
                                      ? example.title
                                      : `Example ${index + 1}`}
                                  </h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {typeof example.description === "string"
                                      ? example.description
                                      : "No description available"}
                                  </p>
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={
                                      repository.language?.toLowerCase() ||
                                      "javascript"
                                    }
                                    PreTag="div"
                                  >
                                    {typeof example.code === "string"
                                      ? example.code
                                      : "// No code available"}
                                  </SyntaxHighlighter>
                                  {example.explanation &&
                                    typeof example.explanation === "string" && (
                                      <p className="text-sm text-gray-500 mt-2">
                                        {example.explanation}
                                      </p>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <h4 className="font-semibold mb-2">
                            Components:{" "}
                            {analysis.documentation.components?.length || 0}
                          </h4>
                          <p className="text-sm text-gray-600">
                            React/UI components documented
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            APIs: {analysis.documentation.apis?.length || 0}
                          </h4>
                          <p className="text-sm text-gray-600">
                            API endpoints documented
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            Data Models:{" "}
                            {analysis.documentation.dataModels?.length || 0}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Data structures documented
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">SDLC Guide</h4>
                          <p className="text-sm text-gray-600">
                            Complete development lifecycle
                          </p>
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
                    <h3 className="text-lg font-semibold mb-2">
                      Enhanced Documentation Ready
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate comprehensive documentation with code internals,
                      SDLC guide, and folder structure
                    </p>
                    <Button
                      onClick={generateDocumentation}
                      disabled={generatingDocs}
                    >
                      {generatingDocs
                        ? "Generating..."
                        : "Generate Enhanced Documentation"}
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
                      Generated using{" "}
                      {typeof analysis.testCases.framework === "string"
                        ? analysis.testCases.framework
                        : "Unknown framework"}{" "}
                      - Estimated Coverage:{" "}
                      {typeof analysis.testCases.coverage === "number"
                        ? analysis.testCases.coverage
                        : 0}
                      %
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Progress
                        value={
                          typeof analysis.testCases.coverage === "number"
                            ? analysis.testCases.coverage
                            : 0
                        }
                      />
                    </div>
                    <div className="space-y-4">
                      {analysis.testCases.testCases?.map((testCase, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">
                                {typeof testCase.name === "string"
                                  ? testCase.name
                                  : "Unnamed Test"}
                              </h4>
                              <div className="flex space-x-2">
                                <Badge
                                  variant={
                                    testCase.type === "unit"
                                      ? "default"
                                      : testCase.type === "integration"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {typeof testCase.type === "string"
                                    ? testCase.type
                                    : "unknown"}
                                </Badge>
                                <Badge
                                  variant={
                                    testCase.priority === "high"
                                      ? "destructive"
                                      : testCase.priority === "medium"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {typeof testCase.priority === "string"
                                    ? testCase.priority
                                    : "medium"}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {typeof testCase.description === "string"
                                ? testCase.description
                                : "No description available"}
                            </p>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={
                                repository.language?.toLowerCase() ||
                                "javascript"
                              }
                              PreTag="div"
                            >
                              {typeof testCase.code === "string"
                                ? testCase.code
                                : "// No code available"}
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
                    <h3 className="text-lg font-semibold mb-2">
                      No Test Cases Generated
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Generate AI-powered test cases for this repository
                    </p>
                    <Button
                      onClick={generateTestCases}
                      disabled={generatingTests}
                    >
                      {generatingTests
                        ? "Generating..."
                        : "Generate Test Cases"}
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
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <GitCommit className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {commit.commit.message.split("\n")[0]}
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
                          <span className="font-mono">
                            {commit.sha.substring(0, 7)}
                          </span>
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
                      <p className="text-sm">
                        Unable to fetch commit history for this repository.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
