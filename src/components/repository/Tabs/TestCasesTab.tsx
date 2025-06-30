import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TestTube, Download, Loader2, Copy, FileCode } from "lucide-react";
import type { TestCasesTabProps } from "@/types/repo.interface";

const formatCode = (code: string | undefined): string => {
  if (!code || typeof code !== "string") return "";
  return code;
};

const copyToClipboard = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
  } catch (err) {
    console.error("Failed to copy code:", err);
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    case "low":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "unit":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case "integration":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
    case "e2e":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

export const TestCasesTab: React.FC<TestCasesTabProps> = ({
  testCases,
  generatingTests,
  onGenerateTestCases,
  onStoreAnalysis,
  hasAnalysisData,
}) => {
  if (testCases) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TestTube className="w-5 h-5 text-primary" />
                </div>
                <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Generated Test Cases
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
            <CardDescription className="flex items-center gap-4 text-base">
              <span>
                Generated using{" "}
                <strong>{testCases.framework || "Unknown framework"}</strong>
              </span>
              <span className="text-muted-foreground">•</span>
              <span>
                Estimated Coverage:{" "}
                <strong className="text-primary">
                  {testCases.coverage ?? 0}%
                </strong>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Test Coverage
                </span>
                <span className="text-sm font-bold text-primary">
                  {testCases.coverage ?? 0}%
                </span>
              </div>
              <Progress
                value={testCases.coverage ?? 0}
                className="h-3 bg-secondary/30"
              />
            </div>
            <div className="space-y-6">
              {Array.isArray(testCases.testCases) &&
              testCases.testCases.length > 0 ? (
                testCases.testCases.map((testCase: any, index: number) => (
                  <Card
                    key={index}
                    className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <CardHeader className="pb-4 border-b border-border/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-primary" />
                            {testCase.name}
                          </CardTitle>
                          <CardDescription className="text-muted-foreground leading-relaxed">
                            {testCase.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getPriorityColor(
                              testCase.priority
                            )}`}
                          >
                            {testCase.priority} Priority
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getTypeColor(
                              testCase.type
                            )}`}
                          >
                            {testCase.type} Test
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            Test Implementation
                          </span>
                          <Button
                            onClick={() =>
                              copyToClipboard(
                                formatCode(
                                  typeof testCase.code === "string"
                                    ? testCase.code
                                    : ""
                                )
                              )
                            }
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="bg-slate-900 rounded-lg border border-border/30 p-5 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                          <pre className="text-slate-100 whitespace-pre-wrap break-words">
                            {typeof testCase.code === "string"
                              ? testCase.code
                                  .replace(/\\n/g, "\n")
                                  .replace(/\\/g, "\\")
                                  .trim()
                              : ""}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-border/30 bg-muted/20">
                  <CardContent className="text-center py-12">
                    <TestTube className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      No Test Cases Generated
                    </h3>
                    <p className="text-muted-foreground">
                      The AI couldn't generate test cases for this repository.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial empty state before generation
  return (
    <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl"></div>
            </div>
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border border-border/30">
              <TestTube className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Generate Test Cases
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Use AI to generate comprehensive test cases for this repository,
            including unit tests, integration tests, and end-to-end scenarios.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onGenerateTestCases}
              disabled={generatingTests}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {generatingTests ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Test Cases...
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5 mr-2" />
                  Generate Test Cases
                </>
              )}
            </Button>
            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="secondary"
                size="lg"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-5 h-5 mr-2" />
                Store Analysis Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
