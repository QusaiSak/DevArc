import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Download,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Code,
  FileText,
} from "lucide-react";

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

interface AnalysisTabProps {
  analysis: AnalysisResults;
  analyzing: boolean;
  onRunAnalysis: () => void;
  onStoreAnalysis: () => void;
}

export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  analysis,
  analyzing,
  onRunAnalysis,
  onStoreAnalysis,
}) => {
  const hasAnalysisData =
    analysis.structure ||
    analysis.codeAnalysis ||
    analysis.documentation ||
    analysis.testCases;

  if (analysis.codeAnalysis) {
    return (
      <div className="space-y-6">
        {/* Store Analysis button at the top of analysis tab */}
        <div className="flex justify-end">
          <Button
            onClick={onStoreAnalysis}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Store All Analysis Data
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Code Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Quality Score */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-xl border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-primary">
                    Quality Score
                  </h3>
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {analysis.codeAnalysis.qualityScore}/100
                </div>
                <Progress
                  value={analysis.codeAnalysis.qualityScore}
                  className="h-2"
                />
              </div>

              {/* Maintainability Index */}
              <div className="bg-gradient-to-br from-accent/10 to-accent/20 p-6 rounded-xl border border-accent/30">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-accent-foreground">
                    Maintainability
                  </h3>
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="text-3xl font-bold text-accent-foreground mb-2">
                  {analysis.codeAnalysis.maintainabilityIndex}/100
                </div>
                <Progress
                  value={analysis.codeAnalysis.maintainabilityIndex}
                  className="h-2"
                />
              </div>

              {/* Structure Info */}
              {analysis.structure && (
                <>
                  <div className="bg-gradient-to-br from-secondary/50 to-secondary p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-secondary-foreground">
                        Total Files
                      </h3>
                      <FileText className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-secondary-foreground">
                      {analysis.structure.totalFiles.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-muted/50 to-muted p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Lines of Code
                      </h3>
                      <Code className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-3xl font-bold text-muted-foreground">
                      {analysis.structure.totalLines.toLocaleString()}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Strengths */}
            {analysis.codeAnalysis.strengths &&
              analysis.codeAnalysis.strengths.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.codeAnalysis.strengths.map(
                        (strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30"
                          >
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-primary">{strength}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Weaknesses */}
            {analysis.codeAnalysis.weaknesses &&
              analysis.codeAnalysis.weaknesses.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.codeAnalysis.weaknesses.map(
                        (weakness, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30"
                          >
                            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-destructive">{weakness}</span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Recommendations */}
            {analysis.codeAnalysis.recommendations &&
              analysis.codeAnalysis.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent-foreground">
                      <TrendingUp className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.codeAnalysis.recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50"
                          >
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-800 dark:text-blue-200">
                              {recommendation}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Run analysis to get detailed insights about this repository
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={onRunAnalysis} disabled={analyzing}>
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
            {/* Show Store button if ANY analysis data exists */}
            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
