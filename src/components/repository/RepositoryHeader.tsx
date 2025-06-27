import React from "react";
import {
  Star,
  GitFork,
  Calendar,
  Eye,
  Github,
  Users,
  Clock,
  BarChart3,
  BookOpen,
  TestTube,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RepositoryHeaderProps } from "@/types/repo.interface";


export interface AnalysisResults {
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
  documentation?: unknown;
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



export const RepositoryHeader: React.FC<RepositoryHeaderProps> = ({
  repository,
  isFavorite,
  analyzing,
  generatingDocs,
  generatingTests,
  analysis,
  onToggleFavorite,
  onRunAnalysis,
  onStoreAnalysis,
  onGenerateDocumentation,
  onGenerateTestCases,
}) => {
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

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {repository.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {repository.owner.login}/{repository.name}
                  </p>
                </div>
              </div>
              {repository.description && (
                <p className="text-lg text-foreground max-w-3xl">
                  {repository.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={isFavorite ? "default" : "outline"}
                onClick={onToggleFavorite}
                className={
                  isFavorite
                    ? "bg-accent hover:bg-accent/80 text-accent-foreground"
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
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Repository Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {repository.stargazers_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Stars
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/50">
              <div className="flex items-center space-x-2">
                <GitFork className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {repository.forks_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Forks
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-accent/20 p-4 rounded-xl border border-border">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {repository.watchers_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Watchers</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-secondary/20 p-4 rounded-xl border border-border">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(repository.created_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-accent/20 p-4 rounded-xl border border-border">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {formatDate(repository.updated_at)}
                  </p>
                  <p className="text-xs text-muted-foreground">Updated</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-muted/50 to-secondary/20 p-4 rounded-xl border border-border">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {formatBytes(repository.size * 1024)}
                  </p>
                  <p className="text-xs text-muted-foreground">Size</p>
                </div>
              </div>
            </div>
          </div>

          {/* Language and Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {repository.language && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 px-3 py-1"
              >
                {repository.language}
              </Badge>
            )}
            <Badge
              variant={repository.private ? "destructive" : "secondary"}
              className="px-3 py-1"
            >
              {repository.private ? "Private" : "Public"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onRunAnalysis}
              disabled={analyzing}
              className="bg-primary hover:bg-primary/90"
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

            {/* Show Store Analysis button if ANY analysis data exists */}
            {(analysis.structure ||
              analysis.codeAnalysis ||
              analysis.documentation ||
              analysis.testCases) && (
              <Button
                onClick={onStoreAnalysis}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}

            <Button
              onClick={onGenerateDocumentation}
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
              onClick={onGenerateTestCases}
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
        </CardContent>
      </Card>
    </div>
  );
};
