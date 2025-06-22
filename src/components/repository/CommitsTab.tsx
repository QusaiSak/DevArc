import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitCommit, Save } from "lucide-react";

interface Commit {
  sha: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
  };
  html_url: string;
}

interface CommitsTabProps {
  commits: Commit[] | null | undefined;
  onStoreAnalysis?: () => void;
  hasAnalysisData?: boolean;
}

export const CommitsTab: React.FC<CommitsTabProps> = ({
  commits = [],
  onStoreAnalysis,
  hasAnalysisData = false,
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Ensure commits is always an array
  const safeCommits = Array.isArray(commits) ? commits : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Git History</span>
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
        <CardDescription>
          Latest commits and changes to this repository
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeCommits.map((commit, index) => (
            <div
              key={commit.sha || index}
              className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <GitCommit className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {commit.commit?.message || "No commit message"}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{commit.commit?.author?.name || "Unknown"}</span>
                  <span>{formatDate(commit.commit?.author?.date || "")}</span>
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {commit.sha?.substring(0, 7) || "Unknown"}
                  </a>
                </div>
              </div>
            </div>
          ))}
          {safeCommits.length === 0 && (
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
  );
};
