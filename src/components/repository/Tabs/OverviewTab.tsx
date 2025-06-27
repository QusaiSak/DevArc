import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  Calendar,
  FileText,
  Code,
  Download,
} from "lucide-react";

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

interface OverviewTabProps {
  repository: RepositoryData;
  onStoreAnalysis?: () => void;
  hasAnalysisData?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  repository,
  onStoreAnalysis,
  hasAnalysisData = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Repository Information */}
      <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Repository Information
              </span>
            </div>
            {hasAnalysisData && onStoreAnalysis && (
              <Button
                onClick={onStoreAnalysis}
                size="sm"
                variant="secondary"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                Full Name
              </h4>
              <p className="font-mono text-sm text-foreground">
                {repository.full_name}
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                Owner
              </h4>
              <div className="flex items-center space-x-2">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-6 h-6 rounded-full border border-border"
                />
                <span className="text-sm text-foreground">
                  {repository.owner.login}
                </span>
              </div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                Repository Size
              </h4>
              <p className="text-sm text-foreground">
                {formatBytes(repository.size * 1024)}
              </p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                Visibility
              </h4>
              <Badge
                variant={repository.private ? "destructive" : "secondary"}
                className="font-medium"
              >
                {repository.private ? "Private" : "Public"}
              </Badge>
            </div>
          </div>

          {repository.description && (
            <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                Description
              </h4>
              <p className="text-foreground leading-relaxed">
                {repository.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/30 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-200/50 dark:bg-yellow-800/50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {repository.stargazers_count.toLocaleString()}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Stars
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-200/50 dark:bg-green-800/50 rounded-lg">
                <GitFork className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {repository.forks_count.toLocaleString()}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Forks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-200/50 dark:bg-blue-800/50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {repository.watchers_count.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Watchers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-200/50 dark:bg-red-800/50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {repository.open_issues_count.toLocaleString()}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Open Issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg border border-border/30">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Repository Created
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(repository.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg border border-border/30">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Last Updated</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(repository.updated_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg border border-border/30">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Last Push</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(repository.pushed_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Language */}
      {repository.language && (
        <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Primary Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-secondary/50 rounded-lg border border-border/30">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {repository.language}
                </p>
                <p className="text-sm text-muted-foreground">
                  Detected primary programming language
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
