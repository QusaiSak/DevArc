import React, { memo } from "react";
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
  Loader2,
} from "lucide-react";

interface AnalysisTabProps {
  analysis: any;
  analyzing: boolean;
  onAnalyzeRepository: () => void;
  onStoreAnalysis: () => void;
  hasAnalysisData: boolean;
}

export const AnalysisTab = memo<AnalysisTabProps>(function AnalysisTab({
  analysis,
  analyzing,
  onAnalyzeRepository,
  onStoreAnalysis,
}) {
  const hasAnalysisDataCheck =
    analysis.structure ||
    analysis.codeAnalysis ||
    analysis.documentation ||
    analysis.testCases;

  if (analysis.codeAnalysis) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Code Quality Analysis
                </span>
              </div>
              <Button
                onClick={onStoreAnalysis}
                size="sm"
                variant="secondary"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-4 h-4 mr-2" />
                Store All Data
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Quality Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Quality Score */}
              <Card className="border-border/30 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Quality Score
                    </h3>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
                    {analysis.codeAnalysis.qualityScore}/100
                  </div>
                  <Progress
                    value={analysis.codeAnalysis.qualityScore}
                    className="h-3 bg-green-200/50"
                  />
                </CardContent>
              </Card>

              {/* Maintainability Index */}
              <Card className="border-border/30 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Maintainability
                    </h3>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                    {analysis.codeAnalysis.maintainabilityIndex}/100
                  </div>
                  <Progress
                    value={analysis.codeAnalysis.maintainabilityIndex}
                    className="h-3 bg-blue-200/50"
                  />
                </CardContent>
              </Card>

              {/* Structure Info */}
              {analysis.structure && (
                <>
                  <Card className="border-border/30 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          Total Files
                        </h3>
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">
                        {analysis.structure.totalFiles.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/30 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          Lines of Code
                        </h3>
                        <Code className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">
                        {analysis.structure.totalLines.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Strengths */}
            {analysis.codeAnalysis.strengths &&
              analysis.codeAnalysis.strengths.length > 0 && (
                <Card className="mb-6 border-border/30 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle className="w-5 h-5" />
                      Strengths & Advantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {analysis.codeAnalysis.strengths.map(
                        (strength, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-green-100/80 dark:bg-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-green-800 dark:text-green-200 leading-relaxed">
                              {strength}
                            </span>
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
                <Card className="mb-6 border-border/30 bg-gradient-to-br from-red-50/50 to-red-100/50 dark:from-red-900/10 dark:to-red-800/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
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
                            className="flex items-start gap-3 p-4 bg-red-100/80 dark:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                          >
                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-red-800 dark:text-red-200 leading-relaxed">
                              {weakness}
                            </span>
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
                <Card className="border-border/30 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
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
                            className="flex items-start gap-3 p-4 bg-blue-100/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                          >
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-800 dark:text-blue-200 leading-relaxed">
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
    <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl"></div>
            </div>
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border border-border/30">
              <BarChart3 className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Code Analysis Ready
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Run comprehensive analysis to get detailed insights about code
            quality, structure, and maintainability metrics.
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onAnalyzeRepository}
              disabled={analyzing}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Repository...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>

            {hasAnalysisDataCheck && (
              <Button
                onClick={onStoreAnalysis}
                variant="secondary"
                size="lg"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-5 h-5 mr-2" />
                Store Analysis
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
