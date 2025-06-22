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
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface TestCase {
  name: string;
  type: string;
  priority: string;
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
  if (testCases) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Test Cases</span>
              <Button
                onClick={onStoreAnalysis}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Store All Data
              </Button>
            </CardTitle>
            <CardDescription>
              Generated using{" "}
              {typeof testCases.framework === "string"
                ? testCases.framework
                : "Unknown framework"}{" "}
              - Estimated Coverage:{" "}
              {typeof testCases.coverage === "number" ? testCases.coverage : 0}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress
                value={
                  typeof testCases.coverage === "number"
                    ? testCases.coverage
                    : 0
                }
              />
            </div>
            <div className="space-y-4">
              {testCases.testCases && testCases.testCases.length > 0 ? (
                testCases.testCases.map((testCase, index) => (
                  <Card key={index} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {testCase.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {testCase.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              testCase.priority === "high"
                                ? "destructive"
                                : testCase.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {testCase.priority}
                          </Badge>
                          <Badge variant="outline">{testCase.type}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <SyntaxHighlighter
                          language="javascript"
                          customStyle={{
                            backgroundColor: "#1e293b",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.875rem",
                          }}
                        >
                          {testCase.code}
                        </SyntaxHighlighter>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <TestTube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test cases available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Test Cases Generated
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate AI-powered test cases for this repository
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
            {/* Show Store button if ANY analysis data exists */}
            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
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
