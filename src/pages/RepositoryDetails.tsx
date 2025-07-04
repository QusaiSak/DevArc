import { memo } from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/authAndError/AuthContext";
import { GitHubService } from "@/lib/github";
import { StructureAnalyzer } from "@/lib/structure";
import { AIAnalyzer } from "@/lib/aiService";
import { saveAnalysis, getAnalysis } from "@/lib/analysesService";
import {
  isFavorite as checkIsFavorite,
  addFavorite,
  removeFavorite,
} from "@/lib/favoritesService";
import type {
  ComprehensiveDocumentation,
  ProjectStructure,
} from "@/types/codeparser.interface";
import { toast } from "sonner";
import ErrorBoundary from "@/authAndError/ErrorBoundary";
import {
  RepositoryHeader,
  ReadmeViewer,
  AnalysisTab,
  DocumentationTab,
  TestCasesTab,
  CommitsTab,
  OverviewTab,
} from "@/components/repository";
import { ReparseButton } from "@/components/repository/ReparseButton";
import { ParsingLoader } from "@/components/ui/ParsingLoader";
import type {
  AnalysisResults,
  CommitData,
  RepositoryData,
} from "@/types/repo.interface";

const RepositoryDetailsPage = memo(function RepositoryDetailsPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Repository data states
  const [repository, setRepository] = useState<RepositoryData | null>(null);
  const [readme, setReadme] = useState<string>("");
  const [commits, setCommits] = useState<CommitData[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Analysis states
  const [analysis, setAnalysis] = useState<AnalysisResults>({});
  const [parsedStructure, setParsedStructure] = useState<
    ProjectStructure | any | null
  >(null);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [generatingTests, setGeneratingTests] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch repository data and start parsing immediately
  useEffect(() => {
    if (!owner || !repo) return;

    const initializeRepository = async () => {
      setInitialLoading(true);
      setError(null);

      try {
        // Get GitHub token
        const tokenResponse = await fetch(
          "http://localhost:4000/api/github-token",
          {
            credentials: "include",
          }
        );

        if (!tokenResponse.ok) {
          throw new Error("Failed to authenticate with GitHub");
        }

        const tokenData = await tokenResponse.json();
        const githubService = new GitHubService(tokenData.access_token);

        // Fetch repository data
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
          setReadme("");
        }

        // Fetch commits
        try {
          const commitsData = await githubService.fetch(
            `repos/${owner}/${repo}/commits?per_page=10`
          );
          const commitsArray = Array.isArray(commitsData)
            ? commitsData
            : (commitsData as any)?.data || [];
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
          setCommits([]);
        }

        // Check if favorite (only if user is logged in)
        if (user?.id) {
          try {
            const favoriteStatus = await checkIsFavorite(
              user.id,
              repoData.id.toString()
            );
            setIsFavorite(favoriteStatus);
          } catch (favoriteError) {
            console.error("Failed to check favorite status:", favoriteError);
          }

          // Load stored analysis if available
          try {
            const projectId = `${owner}/${repo}`;
            const { analysis: storedAnalysis } = await getAnalysis(projectId);

            // Parse stored analysis data
            if (storedAnalysis) {
              const parsedAnalysis: AnalysisResults = {};
              let hasStoredStructure = false;

              if (storedAnalysis.structure) {
                try {
                  parsedAnalysis.structure =
                    typeof storedAnalysis.structure === "string"
                      ? JSON.parse(storedAnalysis.structure)
                      : storedAnalysis.structure;
                  hasStoredStructure = true;
                } catch (e) {
                  console.warn("Failed to parse stored structure:", e);
                }
              }

              if (storedAnalysis.codeAnalysis) {
                try {
                  parsedAnalysis.codeAnalysis =
                    typeof storedAnalysis.codeAnalysis === "string"
                      ? JSON.parse(storedAnalysis.codeAnalysis)
                      : storedAnalysis.codeAnalysis;
                } catch (e) {
                  console.warn("Failed to parse stored code analysis:", e);
                }
              }

              if (storedAnalysis.documentation) {
                try {
                  parsedAnalysis.documentation =
                    typeof storedAnalysis.documentation === "string"
                      ? JSON.parse(storedAnalysis.documentation)
                      : storedAnalysis.documentation;
                } catch (e) {
                  console.warn("Failed to parse stored documentation:", e);
                }
              }

              if (storedAnalysis.testCases) {
                try {
                  parsedAnalysis.testCases =
                    typeof storedAnalysis.testCases === "string"
                      ? JSON.parse(storedAnalysis.testCases)
                      : storedAnalysis.testCases;
                } catch (e) {
                  console.warn("Failed to parse stored test cases:", e);
                }
              }

              setAnalysis(parsedAnalysis);

              // If we have stored structure, use it as parsed structure
              if (hasStoredStructure && parsedAnalysis.structure) {
                setParsedStructure(parsedAnalysis.structure);
                console.log(
                  "Using cached repository structure - skipping re-parsing"
                );
                // Don't parse again if we have cached structure
                setInitialLoading(false);
                return;
              }
            }
          } catch (analysisError) {
            console.log("No stored analysis found:", analysisError);
          }
        }

        // Start parsing repository structure immediately (only if not cached)
        startRepositoryParsing(tokenData.access_token);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load repository";
        console.error("Repository initialization failed:", err);
        setError(errorMessage);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeRepository();
  }, [owner, repo, user?.id]); // startRepositoryParsing is defined inside the effect, so it doesn't need to be a dependency

  // Parse repository structure
  const startRepositoryParsing = async (accessToken: string) => {
    if (!owner || !repo || isParsing || parsedStructure) return;

    setIsParsing(true);
    setParsingError(null);

    try {
      const structureAnalyzer = new StructureAnalyzer(accessToken);
      const structure = await structureAnalyzer.analyzeRepository(owner, repo);

      setParsedStructure(structure);
      setAnalysis((prev) => ({ ...prev, structure }));

      // Save the parsed structure immediately for caching
      if (user?.id) {
        try {
          const projectId = `${owner}/${repo}`;
          await saveAnalysis({
            projectId,
            structure: JSON.stringify(structure),
          });
          console.log("Repository structure cached successfully");
        } catch (saveError) {
          console.warn("Failed to cache repository structure:", saveError);
        }
      }

      toast.success("Repository parsed successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to parse repository";
      console.error("Repository parsing failed:", err);
      setParsingError(errorMessage);
      toast.error(`Parsing failed: ${errorMessage}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Use cached parsed structure for analysis
  const runAnalysis = async () => {
    if (!parsedStructure || !user) {
      toast.error(
        "Repository structure not available. Please wait for parsing to complete."
      );
      return;
    }

    setAnalyzing(true);
    try {
      const aiAnalyzer = new AIAnalyzer();
      const codeAnalysis: any = await aiAnalyzer.analyzeCodeStructure(
        parsedStructure
      );

      setAnalysis((prev) => ({ ...prev, codeAnalysis }));

      // Save the analysis results for caching
      if (user?.id) {
        try {
          const projectId = `${owner}/${repo}`;
          await saveAnalysis({
            projectId,
            codeAnalysis: JSON.stringify(codeAnalysis),
          });
        } catch (saveError) {
          console.warn("Failed to cache code analysis:", saveError);
        }
      }

      toast.success("Analysis completed successfully!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Use cached parsed structure for documentation generation
  const generateDocumentation = async () => {
    if (!parsedStructure || !repository) {
      toast.error(
        "Repository structure not available. Please wait for parsing to complete."
      );
      return;
    }

    setGeneratingDocs(true);
    try {
      const aiAnalyzer = new AIAnalyzer();
      const language = repository.language?.toLowerCase() || "javascript";

      // Get the response and ensure it's properly typed
      const rawDocumentation =
        await aiAnalyzer.generateComprehensiveDocumentation(
          parsedStructure,
          language,
          repository.name
        );

      console.log("🔍 Raw documentation response:", rawDocumentation);

      // Cast to the correct type
      const documentation = rawDocumentation as ComprehensiveDocumentation;

      console.log("✅ Typed documentation:", documentation);

      setAnalysis((prev) => {
        const updatedAnalysis = {
          ...prev,
          documentation,
        };
        console.log(
          "✅ Analysis state updated with documentation:",
          updatedAnalysis
        );
        return updatedAnalysis;
      });

      // Save and show success message
      if (user?.id) {
        try {
          const projectId = `${owner}/${repo}`;
          await saveAnalysis({
            projectId,
            documentation: JSON.stringify(documentation),
          });
          toast.success("Documentation generated and cached successfully!");
        } catch (saveError) {
          console.error("❌ Error saving analysis:", saveError);
          toast.error("Documentation generated but failed to cache.");
        }
      } else {
        toast.success("Documentation generated successfully!");
      }
    } catch (error) {
      console.error("❌ Documentation generation failed:", error);
      toast.error("Documentation generation failed. Please try again.");
    } finally {
      setGeneratingDocs(false);
    }
  };

  // Use cached parsed structure for test case generation
  const generateTestCases = async () => {
    if (!parsedStructure || !repository) {
      toast.error(
        "Repository structure not available. Please wait for parsing to complete."
      );
      return;
    }

    setGeneratingTests(true);
    try {
      const aiAnalyzer = new AIAnalyzer();
      const language = repository.language?.toLowerCase() || "javascript";
      const testResult: any = await aiAnalyzer.generateTestCasesFromStructure(
        parsedStructure,
        language,
        repository.name
      );

      const testCases = {
        testCases: testResult.testCases,
        coverage: testResult.coverage,
        framework: testResult.framework,
      };
      setAnalysis((prev) => ({ ...prev, testCases }));

      // Save the test cases for caching
      if (user?.id) {
        try {
          const projectId = `${owner}/${repo}`;
          await saveAnalysis({
            projectId,
            testCases: JSON.stringify(testCases),
          });
        } catch (saveError) {
          console.warn("Failed to cache test cases:", saveError);
        }
      }

      toast.success("Test cases generated successfully!");
    } catch (error) {
      console.error("Test generation failed:", error);
      toast.error("Test generation failed. Please try again.");
    } finally {
      setGeneratingTests(false);
    }
  };

  // Store analysis (unchanged)
  const storeAnalysis = async () => {
    if (!owner || !repo || !user) {
      toast.error("Missing data for storing analysis");
      return;
    }

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
      await saveAnalysis({
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

      toast.success("Analysis stored successfully!");
    } catch (error) {
      console.error("Failed to store analysis:", error);
      toast.error("Failed to store analysis. Please try again.");
    }
  };

  // Export documentation (unchanged)
  const exportToWord = async (documentation: ComprehensiveDocumentation) => {
    try {
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
  documentation.architecture?.frontend?.technologies
    ?.map((tech) => `- ${tech}`)
    .join("\n") || "No technologies specified"
}

### Technologies Used
${
  documentation.architecture?.backend?.technologies
    ?.map((tech) => `- ${tech}`)
    .join("\n") || "No technologies specified"
}

### Technologies Used
${
  documentation.architecture?.database?.technologies
    ?.map((tech) => `- ${tech}`)
    .join("\n") || "No technologies specified"
}
---
*Generated on ${new Date().toLocaleDateString()} for ${
        repository?.full_name || "Repository"
      }*
      `;

      const blob = new Blob([docContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${repository?.name || "repository"}-documentation.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export documentation:", error);
      toast.error("Failed to export documentation");
    }
  };

  // Toggle favorite (unchanged)
  const toggleFavorite = async () => {
    if (!owner || !repo || !user || !repository) return;

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
  };

  // Show parsing loader
  if (isParsing) {
    return (
      <ParsingLoader message="Analyzing repository structure and files..." />
    );
  }

  // Show parsing error
  if (parsingError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Parsing Failed
            </h3>
            <p className="text-muted-foreground mb-4">{parsingError}</p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show initial loading
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading repository...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !repository) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              Error Loading Repository
            </h3>
            <p className="text-muted-foreground mb-4">
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

  const hasAnalysisData = !!(
    analysis.structure ||
    analysis.codeAnalysis ||
    analysis.documentation ||
    analysis.testCases
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
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

          {/* Re-parse Button: visible above the tabs, only if repository and parsedStructure exist */}
          {repository && parsedStructure && (
            <div className="flex justify-end mb-4">
              <ReparseButton
                files={parsedStructure.files || []}
                language={repository.language?.toLowerCase() || "javascript"}
                onReparse={(result) => {
                  setParsedStructure(result);
                  toast.success("Repository structure re-parsed!");
                }}
              />
            </div>
          )}

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
                hasAnalysisData={hasAnalysisData}
              />
            </TabsContent>

            <TabsContent value="readme" className="space-y-6">
              <ReadmeViewer
                readme={readme}
                onStoreAnalysis={storeAnalysis}
                hasAnalysisData={hasAnalysisData}
              />
            </TabsContent>

            <TabsContent value="analysis">
              <AnalysisTab
                analysis={analysis}
                onRunAnalysis={runAnalysis}
                onStoreAnalysis={storeAnalysis}
                analyzing={analyzing}
              />
              {(analysis.structure || analysis.codeAnalysis) && (
                <div className="mt-6 text-center">
                  <Button onClick={runAnalysis} disabled={analyzing}>
                    {analyzing ? "Re-running Analysis..." : "Re-run Analysis"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documentation">
              <DocumentationTab
                documentation={analysis.documentation}
                onGenerateDocumentation={generateDocumentation}
                onStoreAnalysis={storeAnalysis}
                onExportToWord={exportToWord}
                generatingDocs={generatingDocs}
                hasAnalysisData={hasAnalysisData}
              />
              {analysis.documentation && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={generateDocumentation}
                    disabled={generatingDocs}
                  >
                    {generatingDocs
                      ? "Re-generating Docs..."
                      : "Re-generate Documentation"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tests">
              <TestCasesTab
                testCases={analysis.testCases}
                onGenerateTestCases={generateTestCases}
                onStoreAnalysis={storeAnalysis}
                generatingTests={generatingTests}
                hasAnalysisData={hasAnalysisData}
              />
              {analysis.testCases && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={generateTestCases}
                    disabled={generatingTests}
                  >
                    {generatingTests
                      ? "Re-generating Tests..."
                      : "Re-generate Test Cases"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="commits">
              <CommitsTab
                commits={commits}
                onStoreAnalysis={storeAnalysis}
                hasAnalysisData={hasAnalysisData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default RepositoryDetailsPage;
