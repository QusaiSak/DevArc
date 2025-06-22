import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  RepositoryHeader,
  ReadmeViewer,
  AnalysisTab,
  DocumentationTab,
  TestCasesTab,
  CommitsTab,
  OverviewTab,
} from "@/components/repository";

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

interface CommitData {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubCommitsResponse {
  data?: CommitData[];
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
          try {
            if (analysis.structure) {
              const parsedStructure =
                typeof analysis.structure === "string"
                  ? JSON.parse(analysis.structure)
                  : analysis.structure;
              setAnalysis((prev) => ({
                ...prev,
                structure: parsedStructure,
              }));
            }
          } catch (e) {
            console.warn("Failed to parse structure analysis:", e);
          }

          try {
            if (analysis.codeAnalysis) {
              const parsedCodeAnalysis =
                typeof analysis.codeAnalysis === "string"
                  ? JSON.parse(analysis.codeAnalysis)
                  : analysis.codeAnalysis;
              setAnalysis((prev) => ({
                ...prev,
                codeAnalysis: parsedCodeAnalysis,
              }));
            }
          } catch (e) {
            console.warn("Failed to parse code analysis:", e);
          }

          try {
            if (analysis.documentation) {
              const parsedDocumentation =
                typeof analysis.documentation === "string"
                  ? JSON.parse(analysis.documentation)
                  : analysis.documentation;
              setAnalysis((prev) => ({
                ...prev,
                documentation: parsedDocumentation,
              }));
            }
          } catch (e) {
            console.warn("Failed to parse documentation analysis:", e);
          }

          try {
            if (analysis.testCases) {
              const parsedTestCases =
                typeof analysis.testCases === "string"
                  ? JSON.parse(analysis.testCases)
                  : analysis.testCases;
              setAnalysis((prev) => ({
                ...prev,
                testCases: parsedTestCases,
              }));
            }
          } catch (e) {
            console.warn("Failed to parse test cases analysis:", e);
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

        // Fetch README
        try {
          const readmeContent = await githubService.getReadme(owner, repo);
          setReadme(readmeContent);
        } catch (readmeError) {
          console.log("No README found:", readmeError);
        }

        // Fetch commits
        try {
          const commitsData = await githubService.fetch(
            `repos/${owner}/${repo}/commits?per_page=10`
          );

          // Handle both direct array response and response object with data property
          let commitsArray: CommitData[] = [];
          if (Array.isArray(commitsData)) {
            commitsArray = commitsData as CommitData[];
          } else if (
            commitsData &&
            typeof commitsData === "object" &&
            "data" in commitsData &&
            Array.isArray((commitsData as GitHubCommitsResponse).data)
          ) {
            commitsArray = (commitsData as GitHubCommitsResponse).data || [];
          } else {
            console.warn(
              "Commits data is not in expected format:",
              commitsData
            );
            commitsArray = [];
          }

          setCommits(
            commitsArray.map((commit: CommitData) => ({
              sha: commit.sha || "",
              commit: {
                message: commit.commit?.message || "",
                author: {
                  name: commit.commit?.author?.name || "Unknown",
                  date: commit.commit?.author?.date || new Date().toISOString(),
                },
              },
              html_url: commit.html_url || "",
            }))
          );
        } catch (commitsError) {
          console.log("Could not fetch commits:", commitsError);
          setCommits([]); // Ensure commits is always an array
        }
      } catch (error) {
        console.error("Failed to fetch repository data:", error);
        setError("Failed to load repository data");
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
        throw new Error("Failed to get GitHub token");
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

    // Check if there's ANY analysis data available
    const hasAnalysisData =
      analysis.structure ||
      analysis.codeAnalysis ||
      analysis.documentation ||
      analysis.testCases;

    if (!hasAnalysisData) {
      toast.error("No analysis data to store. Please run analysis first.");
      return;
    }

    try {
      const projectId = `${owner}/${repo}`;

      // Store ALL available analysis data - no exceptions
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

      console.log("All analysis data stored successfully!");
      toast.success("Analysis Stored Successfully!", {
        description: `Stored ${[
          analysis.structure && "Structure Analysis",
          analysis.codeAnalysis && "Code Analysis",
          analysis.documentation && "Documentation",
          analysis.testCases && "Test Cases",
        ]
          .filter(Boolean)
          .join(", ")}`,
      });
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

      console.log("Test cases generated successfully - ready to store");
    } catch (error) {
      console.error("Test generation failed:", error);
      setError("Test generation failed. Please try again.");
    } finally {
      setGeneratingTests(false);
    }
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

      console.log("Documentation exported successfully!");
    } catch (error) {
      console.error("Failed to export documentation:", error);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (owner && repo && user && repository) {
      try {
        if (isFavorite) {
          await removeFavorite(user.id, repository.id.toString());
          setIsFavorite(false);
          toast.success("Removed from favorites");
        } else {
          await addFavorite(user.id, {
            id: repository.id,
            name: repository.name,
            owner: {
              login: repository.owner.login,
              avatar_url: repository.owner.avatar_url,
            },
            description: repository.description,
            language: repository.language,
            stargazers_count: repository.stargazers_count,
            forks_count: repository.forks_count,
            html_url: repository.html_url,
          });
          setIsFavorite(true);
          toast.success("Added to favorites");
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        toast.error("Failed to update favorites");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading repository...
          </p>
        </div>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Repository
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || "Repository not found"}
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <div className="container mx-auto px-4 py-8">
          {/* Repository Header Component */}
          <RepositoryHeader
            repository={repository}
            isFavorite={isFavorite}
            analyzing={analyzing}
            generatingDocs={generatingDocs}
            generatingTests={generatingTests}
            analysis={analysis}
            onToggleFavorite={toggleFavorite}
            onRunAnalysis={runAnalysis}
            onStoreAnalysis={storeAnalysis}
            onGenerateDocumentation={generateDocumentation}
            onGenerateTestCases={generateTestCases}
          />

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
              <OverviewTab
                repository={repository}
                onStoreAnalysis={storeAnalysis}
                hasAnalysisData={
                  !!(
                    analysis.structure ||
                    analysis.codeAnalysis ||
                    analysis.documentation ||
                    analysis.testCases
                  )
                }
              />
            </TabsContent>

            <TabsContent value="readme" className="space-y-6">
              <ReadmeViewer
                readme={readme}
                onStoreAnalysis={storeAnalysis}
                hasAnalysisData={
                  !!(
                    analysis.structure ||
                    analysis.codeAnalysis ||
                    analysis.documentation ||
                    analysis.testCases
                  )
                }
              />
            </TabsContent>

            <TabsContent value="analysis">
              <AnalysisTab
                analysis={analysis}
                onRunAnalysis={runAnalysis}
                onStoreAnalysis={storeAnalysis}
                analyzing={analyzing}
              />
            </TabsContent>

            <TabsContent value="documentation">
              <DocumentationTab
                documentation={analysis.documentation}
                onGenerateDocumentation={generateDocumentation}
                onStoreAnalysis={storeAnalysis}
                onExportToWord={exportToWord}
                generatingDocs={generatingDocs}
                hasAnalysisData={
                  !!(
                    analysis.structure ||
                    analysis.codeAnalysis ||
                    analysis.documentation ||
                    analysis.testCases
                  )
                }
              />
            </TabsContent>

            <TabsContent value="tests">
              <TestCasesTab
                testCases={analysis.testCases}
                onGenerateTestCases={generateTestCases}
                onStoreAnalysis={storeAnalysis}
                generatingTests={generatingTests}
                hasAnalysisData={
                  !!(
                    analysis.structure ||
                    analysis.codeAnalysis ||
                    analysis.documentation ||
                    analysis.testCases
                  )
                }
              />
            </TabsContent>

            <TabsContent value="commits">
              <CommitsTab
                commits={commits}
                onStoreAnalysis={storeAnalysis}
                hasAnalysisData={
                  !!(
                    analysis.structure ||
                    analysis.codeAnalysis ||
                    analysis.documentation ||
                    analysis.testCases
                  )
                }
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}
