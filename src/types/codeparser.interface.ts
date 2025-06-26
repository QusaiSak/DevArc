export interface ParsedFile {
  path: string;
  content: string;
  lines: number;
  complexity: number;
  functions: Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }>;
  imports: Array<{
    module: string;
    imports: string[];
    line: number;
  }>;
  exports: Array<{
    name: string;
    type: "default" | "named";
    line: number;
  }>;
  language: string;
  size: number;
}

export interface CodeStructure {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  testCoverage: number;
  complexity: {
    average: number;
    max: number;
    min: number;
  };
  patterns: {
    architecture: string;
    framework: string[];
  };
  issues: Array<{
    file: string;
    line: number;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
}

export interface ProjectStructure {
  totalFiles: number;
  totalLines: number;
  languages: Record<string, number>;
  complexity: {
    average: number;
    max: number;
    min: number;
  };
  testCoverage: number;
  issues: CodeIssue[];
  directories: DirectoryInfo[];
  patterns: {
    architecture: string;
    framework: string[];
    patterns: string[];
  };
  files: ParsedFile[];
  allFiles?: Array<{ path: string; name: string; type: string }>; // All repository files for complete folder structure
}

export interface DirectoryInfo {
  name: string;
  path: string;
  type:
    | "source"
    | "test"
    | "documentation"
    | "configuration"
    | "assets"
    | "build"
    | "scripts"
    | "other";
  purpose: string;
}

export interface CodeIssue {
  type: string;
  severity: "error" | "warning" | "info" | "low" | "medium" | "high";
  message: string;
  file: string;
  line: number;
}

export interface ComprehensiveDocumentation {
  summary: string;
  architecture: {
    pattern: string;
    description: string;
    technologies: string[];
    layers: Array<{
      name: string;
      description: string;
      components: string[];
    }>;
  };
  folderStructure: {
    tree: string;
    directories: Array<{
      path: string;
      purpose: string;
      type:
        | "source"
        | "test"
        | "documentation"
        | "configuration"
        | "assets"
        | "build"
        | "scripts"
        | "other";
      fileCount: number;
      description: string;
    }>;
  };
  codeInternals: {
    codeFlow: string;
    keyAlgorithms: Array<{
      name: string;
      description: string;
      file: string;
      implementation: string;
      complexity: string;
    }>;
    designPatterns: Array<{
      pattern: string;
      usage: string;
      files: string[];
      description: string;
    }>;
    dataFlow: string;
    businessLogic: Array<{
      module: string;
      purpose: string;
      workflow: string;
      files: string[];
    }>;
  };
  sdlc: {
    developmentWorkflow: string;
    setupInstructions: Array<{
      step: number;
      title: string;
      description: string;
      commands: string[];
    }>;
    buildProcess: {
      description: string;
      steps: string[];
      tools: string[];
    };
    testingStrategy: {
      approach: string;
      testTypes: string[];
      coverage: string;
      frameworks: string[];
    };
    deploymentGuide: {
      process: string;
      environments: string[];
      steps: Array<{
        environment: string;
        steps: string[];
      }>;
    };
    maintenance: {
      guidelines: string[];
      monitoring: string[];
      troubleshooting: Array<{
        issue: string;
        solution: string;
      }>;
    };
  };
  components: Array<{
    name: string;
    type: string;
    file: string;
    description: string;
    dependencies: string[];
    exports: string[];
    internals: {
      purpose: string;
      keyMethods: string[];
      stateManagement: string;
      lifecycle: string;
    };
  }>;
  apis: Array<{
    endpoint: string;
    method: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    response: string;
    internals: {
      implementation: string;
      validation: string;
      errorHandling: string;
      authentication: string;
    };
  }>;
  functions: Array<{
    name: string;
    file: string;
    type: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    returns: {
      type: string;
      description: string;
    };
    internals: {
      algorithm: string;
      complexity: string;
      sideEffects: string;
      dependencies: string[];
    };
  }>;
  dataModels: Array<{
    name: string;
    type: string;
    file: string;
    properties: Array<{
      name: string;
      type: string;
      description: string;
    }>;
    relationships: Array<{
      model: string;
      type: "one-to-one" | "one-to-many" | "many-to-many";
      description: string;
    }>;
    validation: string[];
  }>;
  mermaidDiagram: string;
  examples: Array<{
    title: string;
    description: string;
    code: string;
    explanation: string;
  }>;
}

export interface StoredProject {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  addedAt: string;
  documentation?: ComprehensiveDocumentation;
  analysis?: any;
}
