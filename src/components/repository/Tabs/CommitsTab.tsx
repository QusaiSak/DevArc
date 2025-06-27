import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitCommit, Download, ExternalLink, Calendar, User } from "lucide-react";

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitCommit className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Recent Git History
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
          <CardDescription className="text-base">
            Latest commits and changes to this repository
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {safeCommits.map((commit, index) => (
              <Card
                key={commit.sha || index}
                className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <GitCommit className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-sm font-medium text-foreground leading-relaxed">
                        {commit.commit?.message || "No commit message"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{commit.commit?.author?.name || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(commit.commit?.author?.date || "")}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs bg-secondary/50"
                        >
                          {commit.sha?.substring(0, 7) || "Unknown"}
                        </Badge>
                        <a
                          href={commit.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors duration-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-xs">View</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {safeCommits.length === 0 && (
              <Card className="border-border/30 bg-muted/20">
                <CardContent className="text-center py-12">
                  <GitCommit className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    No Commits Found
                  </h3>
                  <p className="text-muted-foreground">
                    Unable to fetch commit history for this repository.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
