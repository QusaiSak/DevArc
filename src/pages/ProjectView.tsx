import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  GitBranch,
  Calendar,
  Users,
  Settings,
  Trash2,
  Eye,
  ExternalLink,
  Sparkles,
  Code2,
  Layers,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProjectById, deleteProject } from "@/lib/projectService";
import { getGitHubService } from "@/lib/projectService";
import type { Project } from "@/types/project.interface";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MermaidDiagram from "@/components/MermaidDiagram";

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [readmeContent, setReadmeContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await getProjectById(projectId);
      setProject(projectData);

      if (projectData.repoUrl) {
        try {
          const repoPath = projectData.repoUrl.replace(
            "https://github.com/",
            ""
          );
          const [owner, repo] = repoPath.split("/");
          const githubService = await getGitHubService();
          const readme = await githubService.getReadme(owner, repo);
          setReadmeContent(readme);
        } catch (readmeError) {
          console.log("Could not load README:", readmeError);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await deleteProject(project.id);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-primary to-secondary p-1">
              <div className="rounded-full h-full w-full bg-background"></div>
            </div>
            <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-primary to-secondary opacity-20 blur-xl"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Loading Project
            </h3>
            <p className="text-muted-foreground">Fetching project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md border-0 shadow-lg bg-card/80 backdrop-blur-xl">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-destructive-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-destructive mb-6">
              {error || "Project not found"}
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col space-y-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="group w-fit shadow-sm hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500/30 animate-ping"></div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="capitalize font-medium shadow-sm"
                  >
                    {project.visibility}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
                    {project.name}
                  </h1>

                  <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                    {project.description}
                  </p>

                  {project.tags && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tags
                        .split(",")
                        .map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md px-3 py-1.5"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 lg:pt-16">
                {project.repoUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(project.repoUrl, "_blank")}
                    className="group shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <GitBranch className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                    View Repository
                    <ExternalLink className="w-3 h-3 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="group shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Delete Project
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Primary Content Column */}
          <div className="xl:col-span-3 space-y-8">
            {/* SDLC Recommendation Card */}
            <Card className="group shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>SDLC Recommendation</span>
                  <Badge variant="secondary" className="ml-auto shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="text-base px-4 py-2 shadow-sm bg-gradient-to-r from-primary to-primary/80 font-medium">
                    {project.sdlc?.recommended || "N/A"}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {project.sdlc?.reasoning || "No reasoning provided"}
                </p>

                {project.sdlc?.phases && (
                  <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-5 border border-border/50 shadow-inner">
                    <h4 className="font-semibold flex items-center gap-2 mb-4 text-foreground">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Layers className="w-4 h-4 text-primary" />
                      </div>
                      Recommended Phases
                    </h4>
                    <div className="grid gap-3">
                      {project.sdlc.phases.map(
                        (phase: string, index: number) => (
                          <div
                            key={index}
                            className="group flex items-center gap-4 p-4 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 hover:shadow-md hover:border-primary/20 transition-all duration-200"
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-bold shadow-sm">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                              {phase}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* README Documentation Card */}
            <Card className="group shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-secondary to-primary text-secondary-foreground shadow-sm">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span>Project Documentation</span>
                  <Badge variant="secondary" className="ml-auto shadow-sm">
                    <Code2 className="w-3 h-3 mr-1" />
                    {readmeContent ? "Live" : "Overview"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {readmeContent ? (
                  <div className="bg-gradient-to-br from-muted/30 to-background rounded-xl border border-border/50 shadow-inner overflow-hidden m-6">
                    {/* Terminal Header */}
                    <div className="bg-gradient-to-r from-muted/80 to-muted/60 px-6 py-4 border-b border-border/50 flex items-center justify-between backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-mono font-medium">
                            README.md
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shadow-sm">
                        Documentation
                      </Badge>
                    </div>

                    {/* README Content */}
                    <div className="max-h-[700px] overflow-y-auto">
                      <div className="p-8">
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              h1: ({ ...props }) => (
                                <h1
                                  className="text-3xl font-bold mb-6 pb-4 border-b border-border/50 text-foreground"
                                  {...props}
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  className="text-2xl font-bold mb-4 mt-8 text-foreground"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-xl font-semibold mb-3 mt-6 text-foreground"
                                  {...props}
                                />
                              ),
                              h4: ({ ...props }) => (
                                <h4
                                  className="text-lg font-medium mb-2 mt-4 text-foreground"
                                  {...props}
                                />
                              ),
                              p: ({ ...props }) => (
                                <p
                                  className="mb-4 leading-relaxed text-muted-foreground"
                                  {...props}
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc list-inside mb-4 space-y-2 pl-4 text-muted-foreground"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal list-inside mb-4 space-y-2 pl-4 text-muted-foreground"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li
                                  className="mb-1 leading-relaxed"
                                  {...props}
                                />
                              ),
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              code: (props: any) => {
                                const { className, children, ...rest } = props;
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                const language = match ? match[1] : "";
                                const code = String(children).replace(
                                  /\n$/,
                                  ""
                                );
                                const isInline = !className || !match;

                                if (!isInline && language === "mermaid") {
                                  return <MermaidDiagram chart={code} />;
                                }

                                return isInline ? (
                                  <code
                                    className="bg-muted/80 px-2 py-1 rounded-md text-sm font-mono text-foreground border border-border/30"
                                    {...rest}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code
                                    className="block bg-muted/60 p-4 rounded-lg text-sm font-mono overflow-x-auto text-foreground border border-border/30"
                                    {...rest}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              pre: ({ children, ...props }) => (
                                <pre
                                  className="bg-muted/60 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6 border border-border/30 shadow-inner"
                                  {...props}
                                >
                                  {children}
                                </pre>
                              ),
                              a: ({ ...props }) => (
                                <a
                                  className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                                  {...props}
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="border-l-4 border-primary/50 pl-6 py-4 my-6 bg-muted/30 rounded-r-xl italic text-muted-foreground"
                                  {...props}
                                />
                              ),
                              table: ({ ...props }) => (
                                <div className="overflow-x-auto mb-8 rounded-xl border border-border/50 shadow-lg bg-background/80 backdrop-blur-sm">
                                  <table
                                    className="min-w-full border-collapse"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ ...props }) => (
                                <thead
                                  className="bg-gradient-to-r from-muted/60 to-muted/40"
                                  {...props}
                                />
                              ),
                              tbody: ({ ...props }) => (
                                <tbody
                                  className="divide-y divide-border/30"
                                  {...props}
                                />
                              ),
                              th: ({ ...props }) => (
                                <th
                                  className="bg-muted/40 border-r border-border/30 last:border-r-0 px-6 py-4 text-left font-semibold text-sm text-foreground"
                                  {...props}
                                />
                              ),
                              td: ({ ...props }) => (
                                <td
                                  className="border-r border-border/20 last:border-r-0 px-6 py-4 text-sm text-muted-foreground"
                                  {...props}
                                />
                              ),
                              hr: ({ ...props }) => (
                                <hr
                                  className="my-8 border-border/50"
                                  {...props}
                                />
                              ),
                              img: ({ ...props }) => (
                                <img
                                  className="max-w-full h-auto rounded-xl shadow-lg my-6 border border-border/30"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {readmeContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Eye className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">
                      No Documentation Available
                    </h3>
                    {project.repoUrl ? (
                      <div className="space-y-4 max-w-md mx-auto">
                        <p className="text-muted-foreground leading-relaxed">
                          The repository might not have a README.md file or it
                          could not be loaded.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(project.repoUrl, "_blank")}
                          className="shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Repository
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                        This project doesn't have an associated GitHub
                        repository.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Project Details Card */}
            <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span>Project Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                    <Calendar className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                      Created
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-md">
                    <Users className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                      Visibility
                    </p>
                    <Badge className="mt-1 capitalize text-xs font-medium shadow-sm">
                      {project.visibility}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-secondary to-primary text-secondary-foreground shadow-sm">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span>Quick Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 shadow-sm group hover:shadow-md transition-all duration-200">
                    <div className="text-2xl font-bold text-foreground group-hover:scale-110 transition-transform duration-200">
                      {project.questions?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Config Items
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 shadow-sm group hover:shadow-md transition-all duration-200">
                    <div className="text-2xl font-bold text-foreground group-hover:scale-110 transition-transform duration-200">
                      {project.tags ? project.tags.split(",").length : 0}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Tags
                    </div>
                  </div>
                </div>

                {/* Repository Status */}
                <div className="p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Repository
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            project.repoUrl ? "bg-green-500" : "bg-gray-500"
                          } shadow-sm`}
                        ></div>
                        {project.repoUrl && (
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500/30 animate-ping"></div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {project.repoUrl ? "Connected" : "Not linked"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
