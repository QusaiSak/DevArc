import type { ComprehensiveDocumentation } from "./codeparser.interface";

export interface RepositoryData {
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

export interface CommitData {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

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
  documentation?: ComprehensiveDocumentation;
  testCases?: {
    testCases: TestCase[]; // Use the proper TestCase interface
    coverage: number;
    framework: string;
    summary?: string; // Add this if your AI returns a summary
  };
}

export interface TestCase {
  name: string;
  testCase: string;
  type: "unit" | "integration" | "e2e"; // Make this a literal type instead of string
  priority: "high" | "medium" | "low";
  framework: string; // Specify the testing framework used
  coverage: number; // Percentage of code covered by this test case
  description: string;
  code: string;
  file?: string; // Add this if your test cases include file references
}

export interface TestCasesTabProps {
  testCases?: TestCase;
  generatingTests: boolean;
  onGenerateTestCases: () => void;
  onStoreAnalysis: () => void;
  hasAnalysisData: boolean;
}

export interface RepositoryHeaderProps {
  repository: RepositoryData;
  isFavorite: boolean;
  analyzing: boolean;
  generatingDocs: boolean;
  generatingTests: boolean;
  analysis: AnalysisResults;
  onToggleFavorite: () => void;
  onRunAnalysis: () => void;
  onStoreAnalysis: () => void;
  onGenerateDocumentation: () => void;
  onGenerateTestCases: () => void;
}

export interface AnalysisTabProps {
  analysis: AnalysisResults;
  analyzing: boolean;
  onRunAnalysis: () => void;
  onStoreAnalysis: () => void;
}
