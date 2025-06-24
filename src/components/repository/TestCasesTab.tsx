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
import { Progress } from "@/components/ui/progress";
import { TestTube, Download, Loader2 } from "lucide-react";
import { CodeRenderer } from "./CodeRenderer";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";

interface TestCase {
  name: string;
  type: string;
  priority: "high" | "medium" | "low";
  description: string;
  code: string;
}

interface TestCasesData {
  testCases: TestCase[];
  coverage: number;
  framework: string;
}

interface TestCasesTabProps {
  testCases?: TestCasesData;
  generatingTests: boolean;
  onGenerateTestCases: () => void;
  onStoreAnalysis: () => void;
  hasAnalysisData: boolean;
}

export const TestCasesTab: React.FC<TestCasesTabProps> = ({
  testCases,
  generatingTests,
  onGenerateTestCases,
  onStoreAnalysis,
  hasAnalysisData,
}) => {
  // This is the view when test cases have been generated
  if (testCases) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="bg-card/50 border-border/30 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="font-heading text-xl">Generated Test Cases</span>
              <Button
                onClick={onStoreAnalysis}
                size="sm"
                variant="secondary"
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Download className="w-4 h-4 mr-2" />
                Store All Data
              </Button>
            </CardTitle>
            <CardDescription>
              Generated using {testCases.framework || "Unknown framework"} — Estimated Coverage:{" "}
              {testCases.coverage ?? 0}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={testCases.coverage ?? 0} className="h-2" />
            </div>
            <div className="space-y-4">
              {testCases.testCases?.length > 0 ? (
                testCases.testCases.map((testCase, index) => (
                  <Card key={index} className="border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">{testCase.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {testCase.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                          <Badge
                            variant={
                              testCase.priority === "high"
                                ? "destructive"
                                : testCase.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {testCase.priority}
                          </Badge>
                          <Badge variant="outline">{testCase.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{ code: CodeRenderer }}
                        >
                          {testCase.code}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test cases were generated for this repository.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This is the initial empty state before generation
  return (
    <Card className="bg-card/50 border-border/30 shadow-sm">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Test Cases Generated</h3>
          <p className="text-muted-foreground mb-4">
            Generate AI-powered test cases for this repository.
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={onGenerateTestCases} disabled={generatingTests}>
              {generatingTests ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Test Cases"
              )}
            </Button>
            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="secondary"
                className="shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Store All Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};