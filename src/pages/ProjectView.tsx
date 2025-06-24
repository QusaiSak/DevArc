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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-primary to-accent p-1">
              <div className="rounded-full h-full w-full bg-background"></div>
            </div>
            <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-primary to-accent opacity-20 blur-xl"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="max-w-md border-0 shadow-2xl bg-card/70 backdrop-blur-xl">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-destructive to-destructive shadow-lg flex items-center justify-center mx-auto mb-4">
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col space-y-6">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="group w-fit bg-card/70 backdrop-blur-sm border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to Dashboard
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/30 animate-ping"></div>
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
            <Card className="group shadow-sm hover:shadow-lg transition-all duration-300 bg-card/70 backdrop-blur-xl border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>SDLC Recommendation</span>
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-gradient-to-r from-secondary to-accent text-accent-foreground border-0 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="text-base px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium border-0 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200">
                    {project.sdlc?.recommended || "N/A"}
                  </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed animate-in fade-in duration-700">
                  {project.sdlc?.reasoning || "No reasoning provided"}
                </p>

                {project.sdlc?.phases && (
                  <div className="bg-gradient-to-br from-muted/30 to-accent/10 rounded-xl p-5 border border-border shadow-inner backdrop-blur-sm animate-in slide-in-from-bottom duration-500">
                    <h4 className="font-semibold flex items-center gap-2 mb-4 text-foreground">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-primary to-accent shadow-sm">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      Recommended Phases
                    </h4>
                    <div className="grid gap-3">
                      {project.sdlc.phases.map(
                        (phase: string, index: number) => (
                          <div
                            key={index}
                            className="group flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-400/20 transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-left"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold shadow-sm group-hover:scale-110 transition-transform duration-200">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">
                              {phase}
                            </span>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse"></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* README Documentation Card */}
            <Card className="group shadow-sm hover:shadow-xl transition-all duration-500 bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-transparent to-green-50/20 dark:from-emerald-950/30 dark:via-transparent dark:to-green-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Project Documentation
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-auto bg-gradient-to-r from-secondary to-accent text-accent-foreground border-0 shadow-lg hover:scale-105 transition-transform duration-200"
                  >
                    <Code2 className="w-3 h-3 mr-1" />
                    {readmeContent ? "Live" : "Overview"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative z-10">
                {readmeContent ? (
                  <div className="bg-gradient-to-br from-slate-50/80 to-blue-50/50 dark:from-slate-900/80 dark:to-blue-950/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner overflow-hidden m-8 backdrop-blur-sm">
                    {/* Terminal Header */}
                    <div className="bg-gradient-to-r from-slate-100/90 to-slate-200/70 dark:from-slate-800/90 dark:to-slate-700/70 px-6 py-5 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                          <div className="w-3.5 h-3.5 rounded-full bg-destructive shadow-lg animate-pulse hover:scale-110 transition-transform duration-200"></div>
                          <div
                            className="w-3.5 h-3.5 rounded-full bg-yellow-500 shadow-lg animate-pulse hover:scale-110 transition-transform duration-200"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-3.5 h-3.5 rounded-full bg-primary shadow-lg animate-pulse hover:scale-110 transition-transform duration-200"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                        <div className="flex items-center gap-3 group/header">
                          <Code2 className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover/header:text-emerald-500 transition-colors duration-300" />
                          <span className="text-base font-mono font-semibold bg-gradient-to-r from-slate-700 to-slate-600 dark:from-slate-300 dark:to-slate-200 bg-clip-text text-transparent group-hover/header:from-emerald-600 group-hover/header:to-green-600 dark:group-hover/header:from-emerald-400 dark:group-hover/header:to-green-400 transition-all duration-300">
                            README.md
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-secondary to-accent text-accent-foreground border-0 shadow-lg hover:scale-105 transition-transform duration-200 px-3 py-1.5"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mr-2 animate-pulse"></div>
                        Live Documentation
                      </Badge>
                    </div>

                    {/* README Content */}
                    <div className="max-h-[700px] overflow-y-auto scroll-smooth">
                      <div className="p-8">
                        <div className="prose prose-slate dark:prose-invert max-w-none prose-lg">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              h1: ({ ...props }) => (
                                <h1
                                  className="text-3xl font-bold mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-in slide-in-from-left duration-500"
                                  {...props}
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  className="text-2xl font-bold mb-4 mt-8 text-slate-900 dark:text-white relative group animate-in slide-in-from-left duration-500"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-xl font-semibold mb-3 mt-6 text-slate-900 dark:text-white animate-in fade-in duration-500"
                                  {...props}
                                />
                              ),
                              h4: ({ ...props }) => (
                                <h4
                                  className="text-lg font-medium mb-2 mt-4 text-slate-900 dark:text-white"
                                  {...props}
                                />
                              ),
                              p: ({ ...props }) => (
                                <p
                                  className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300 animate-in fade-in duration-700"
                                  {...props}
                                />
                              ),
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc list-inside mb-4 space-y-2 pl-4 text-slate-700 dark:text-slate-300"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-none mb-4 space-y-3 pl-0 text-slate-700 dark:text-slate-300 counter-reset-[ordered-list]"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li
                                  className="mb-1 leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
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
                                    className="bg-slate-100/80 dark:bg-slate-800/80 px-2 py-1 rounded-md text-sm font-mono text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors duration-200"
                                    {...rest}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative group">
                                    <code
                                      className="block bg-slate-100/60 dark:bg-slate-800/60 p-4 rounded-lg text-sm font-mono overflow-x-auto text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all duration-200"
                                      {...rest}
                                    >
                                      {children}
                                    </code>
                                    <div className="absolute  top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                                      >
                                        {language || "code"}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              },
                              pre: ({ children, ...props }) => (
                                <pre
                                  className="bg-slate-100/60 dark:bg-slate-800/60 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6 border border-slate-200/50 dark:border-slate-700/50 shadow-inner hover:shadow-lg transition-shadow duration-300 group"
                                  {...props}
                                >
                                  {children}
                                </pre>
                              ),
                              a: ({ ...props }) => (
                                <a
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-all duration-200 relative group"
                                  {...props}
                                />
                              ),
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="border-l-4 border-blue-500/50 pl-6 py-4 my-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-xl italic text-slate-700 dark:text-slate-300 relative overflow-hidden group hover:bg-blue-100/50 dark:hover:bg-blue-950/30 transition-colors duration-300"
                                  {...props}
                                />
                              ),
                              table: ({ ...props }) => (
                                <div className="overflow-x-auto mb-8 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                                  <table
                                    className="min-w-full border-collapse"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ ...props }) => (
                                <thead
                                  className="bg-gradient-to-r from-slate-100/60 to-slate-200/40 dark:from-slate-800/60 dark:to-slate-700/40"
                                  {...props}
                                />
                              ),
                              tbody: ({ ...props }) => (
                                <tbody
                                  className="divide-y divide-slate-200/30 dark:divide-slate-700/30"
                                  {...props}
                                />
                              ),
                              th: ({ ...props }) => (
                                <th
                                  className="bg-slate-100/40 dark:bg-slate-800/40 border-r border-slate-200/30 dark:border-slate-700/30 last:border-r-0 px-6 py-4 text-left font-semibold text-sm text-slate-900 dark:text-slate-100"
                                  {...props}
                                />
                              ),
                              td: ({ ...props }) => (
                                <td
                                  className="border-r border-slate-200/20 dark:border-slate-700/20 last:border-r-0 px-6 py-4 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                                  {...props}
                                />
                              ),
                              hr: ({ ...props }) => (
                                <hr
                                  className="my-8 border-slate-200/50 dark:border-slate-700/50"
                                  {...props}
                                />
                              ),
                              img: ({ ...props }) => (
                                <img
                                  className="max-w-full h-auto rounded-xl shadow-lg my-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow duration-300"
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
                  <div className="p-16 text-center">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Eye className="w-12 h-12 text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300 relative z-10" />
                      </div>
                      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                      No Documentation Available
                    </h3>
                    {project.repoUrl ? (
                      <div className="space-y-6 max-w-lg mx-auto">
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                          The repository might not have a README.md file or it
                          could not be loaded.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => window.open(project.repoUrl, "_blank")}
                          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group px-6 py-3 rounded-xl font-semibold"
                        >
                          <ExternalLink className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          View Repository
                        </Button>
                      </div>
                    ) : (
                      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
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
          <div className="space-y-8">
            {/* Project Details Card */}
            <Card className="shadow-sm hover:shadow-xl transition-all duration-500 bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Project Details
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5 relative z-10">
                <div className="group/item flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                      Created
                    </p>
                    <p className="text-base font-bold text-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="group/item flex items-center gap-4 p-5 bg-gradient-to-br from-slate-50/80 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                      Visibility
                    </p>
                    <Badge className="capitalize text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-200 px-3 py-1.5">
                      {project.visibility}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="shadow-sm hover:shadow-xl transition-all duration-500 bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    Quick Stats
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative z-10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="group/stat text-center p-5 bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-blue-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-foreground group-hover/stat:text-blue-600 dark:group-hover/stat:text-blue-400 group-hover/stat:scale-110 transition-all duration-300 mb-2">
                      {project.questions?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Config Items
                    </div>
                  </div>
                  <div className="group/stat text-center p-5 bg-gradient-to-br from-slate-50/80 to-purple-50/60 dark:from-slate-900/80 dark:to-purple-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                    <div className="text-3xl font-bold text-foreground group-hover/stat:text-purple-600 dark:group-hover/stat:text-purple-400 group-hover/stat:scale-110 transition-all duration-300 mb-2">
                      {project.tags ? project.tags.split(",").length : 0}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Tags
                    </div>
                  </div>
                </div>

                {/* Repository Status */}
                <div className="group/repo p-5 bg-gradient-to-br from-slate-50/80 to-emerald-50/60 dark:from-slate-900/80 dark:to-emerald-950/60 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Repository
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            project.repoUrl ? "bg-green-500" : "bg-gray-500"
                          } shadow-lg group-hover/repo:scale-110 transition-transform duration-300`}
                        ></div>
                        {project.repoUrl && (
                          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500/30 animate-ping"></div>
                        )}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold group-hover/repo:text-emerald-600 dark:group-hover/repo:text-emerald-400 transition-colors duration-300">
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
