import type {
  ComprehensiveDocumentation,
  ProjectStructure,
} from "./codeparser.interface";

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
  structure?: ProjectStructure;
  codeAnalysis?: {
    qualityScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    maintainabilityIndex: number;
  };
  documentation?: ComprehensiveDocumentation;
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

export interface TestCase {
  name: string;
  type: string;
  priority: "high" | "medium" | "low";
  description: string;
  code: string;
}

export interface TestCasesData {
  testCases: TestCase[];
  coverage: number;
  framework: string;
}

export interface TestCasesTabProps {
  testCases?: TestCasesData;
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
