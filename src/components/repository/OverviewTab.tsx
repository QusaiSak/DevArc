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
  Save,
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
    <div className="space-y-6">
      {/* Repository Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Repository Information</span>
            {hasAnalysisData && onStoreAnalysis && (
              <Button
                onClick={onStoreAnalysis}
                variant="outline"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Save className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </h4>
              <p className="font-mono text-sm">{repository.full_name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                Owner
              </h4>
              <div className="flex items-center space-x-2">
                <img
                  src={repository.owner.avatar_url}
                  alt={repository.owner.login}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{repository.owner.login}</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                Repository Size
              </h4>
              <p className="text-sm">{formatBytes(repository.size * 1024)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                Visibility
              </h4>
              <Badge variant={repository.private ? "destructive" : "secondary"}>
                {repository.private ? "Private" : "Public"}
              </Badge>
            </div>
          </div>

          {repository.description && (
            <div>
              <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">
                Description
              </h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {repository.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {repository.stargazers_count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stars
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <GitFork className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {repository.forks_count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Forks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {repository.watchers_count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Watchers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {repository.open_issues_count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Open Issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Repository Created</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(repository.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Last Updated</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(repository.updated_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">Last Push</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(repository.pushed_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Language */}
      {repository.language && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Language</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-semibold">{repository.language}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
