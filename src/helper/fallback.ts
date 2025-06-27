import type { ProjectData } from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface";

// Utility function for folder structure tree (copy from aiService if needed)
function createFolderStructureTree(
  files: Array<{ path: string; content: string }>,
  repositoryName: string
): string {
  if (!files || files.length === 0) {
    return `${repositoryName}/\n└── (empty)`;
  }
  const structure: Record<string, string[]> = {};
  const directories = new Set<string>();
  files.forEach((file) => {
    const parts = file.path.split("/");
    let currentPath = "";
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      directories.add(currentPath);
    }
    const dir = parts.slice(0, -1).join("/") || ".";
    const fileName = parts[parts.length - 1];
    if (!structure[dir]) structure[dir] = [];
    structure[dir].push(fileName);
  });
  const sortedDirs = Array.from(directories).sort();
  Object.keys(structure).forEach((dir) => structure[dir].sort());
  let tree = `${repositoryName}/\n`;
  const allPaths = [
    ...sortedDirs,
    ...Object.keys(structure).filter((dir) => dir !== "."),
  ];
  const uniquePaths = [...new Set(allPaths)].sort();
  if (structure["."]) {
    structure["."].forEach((file, index) => {
      const isLast =
        index === structure["."].length - 1 && uniquePaths.length === 0;
      tree += `${isLast ? "└── " : "├── "}${file}\n`;
    });
  }
  uniquePaths.forEach((path, pathIndex) => {
    if (path === ".") return;
    const isLastPath = pathIndex === uniquePaths.length - 1;
    const depth = path.split("/").length;
    const indent = "│   ".repeat(depth - 1);
    const connector = isLastPath ? "└── " : "├── ";
    const dirName = path.split("/").pop();
    tree += `${indent}${connector}${dirName}/\n`;
    if (structure[path]) {
      structure[path].forEach((file, fileIndex) => {
        const isLastFile = fileIndex === structure[path].length - 1;
        const fileIndent = isLastPath
          ? "    ".repeat(depth)
          : "│   ".repeat(depth);
        const fileConnector = isLastFile ? "└── " : "├── ";
        tree += `${fileIndent}${fileConnector}${file}\n`;
      });
    }
  });
  return tree.trim();
}

export function fallbackSDLCRecommendation(projectData: ProjectData) {
  const complexity = projectData.complexity.toLowerCase();
  const teamSize = parseInt(projectData.teamSize) || 1;
  let recommended = "Agile";
  let phases = ["Planning", "Development", "Testing", "Review", "Deployment"];
  if (complexity.includes("high") && teamSize > 10) {
    recommended = "Scrum";
    phases = [
      "Sprint Planning",
      "Daily Standups",
      "Development",
      "Sprint Review",
      "Sprint Retrospective",
    ];
  } else if (complexity.includes("low") && teamSize < 5) {
    recommended = "Kanban";
    phases = ["Backlog", "To Do", "In Progress", "Testing", "Done"];
  }
  return {
    recommended,
    reasoning: `Based on ${projectData.complexity} complexity and ${projectData.teamSize} team size, ${recommended} methodology is recommended.`,
    phases,
    alternatives: [
      {
        model: "Waterfall",
        suitability: 60,
        pros: ["Clear phases", "Well-documented"],
        cons: ["Less flexible", "Late feedback"],
      },
      {
        model: "DevOps",
        suitability: 75,
        pros: ["Continuous delivery", "Automation"],
        cons: ["Complex setup", "Cultural change required"],
      },
    ],
  };
}

export function fallbackStructureAnalysis(structure: ProjectStructure) {
  const score = Math.max(
    30,
    Math.min(
      90,
      structure.testCoverage * 0.3 +
        Math.min(structure.complexity.average, 10) * 5 +
        (structure.totalFiles > 0 ? 20 : 0)
    )
  );
  return {
    qualityScore: Math.round(score),
    strengths: [
      `Project contains ${structure.totalFiles} files with ${structure.totalLines} lines of code`,
      `Test coverage at ${structure.testCoverage}%`,
      `Uses ${structure.patterns.framework.join(", ")} framework`,
    ],
    weaknesses: [
      structure.testCoverage < 80 ? "Test coverage could be improved" : "",
      structure.complexity.average > 5
        ? "Code complexity is above average"
        : "",
      structure.issues.length > 0
        ? `${structure.issues.length} issues detected`
        : "",
    ].filter(Boolean),
    recommendations: [
      "Increase test coverage for better reliability",
      "Consider refactoring complex functions",
      "Add more documentation for maintainability",
    ],
    maintainabilityIndex: Math.round(score * 0.8),
  };
}

export function fallbackTestGenerationFromStructure(
  language: string,
  repositoryName: string
) {
  const frameworks = {
    javascript: "Jest",
    typescript: "Jest",
    python: "pytest",
    java: "JUnit",
    csharp: "NUnit",
    go: "testing",
    rust: "cargo test",
  };
  const framework =
    frameworks[language.toLowerCase() as keyof typeof frameworks] || "Jest";
  return {
    testCases: [
      {
        name: "Repository Integration Test",
        description: `Integration test for ${repositoryName} (AI unavailable)`,
        code: `// ${framework} integration test template\n// Test main application flow`,
        type: "integration" as const,
        priority: "high" as const,
        file: "main application file",
      },
      {
        name: "Core Functionality Unit Test",
        description: "Unit test for core functionality",
        code: `// ${framework} unit test template\n// Test individual components`,
        type: "unit" as const,
        priority: "medium" as const,
        file: "core component files",
      },
    ],
    coverage: 70,
    framework,
    summary: `Basic test strategy for ${repositoryName} using ${framework}. AI-powered analysis unavailable.`,
  };
}

export function fallbackComprehensiveDocumentationFromFiles(
  files: Array<{ path: string; content: string }>,
  language: string,
  repositoryName: string
) {
  const fileList =
    files.length > 0
      ? files.map((f) => f.path).join(", ")
      : "No files available";
  return {
    summary: `${repositoryName} is a ${language} application. AI-powered analysis is currently unavailable, but the codebase includes the following files: ${fileList}`,
    architecture: {
      pattern: "Component-based Architecture",
      description: `The application follows a ${language} component-based architecture with clear separation of concerns.`,
      technologies: [language, "Modern Development Stack"],
      layers: [
        {
          name: "Presentation Layer",
          description: "User interface and presentation logic",
          components: files
            .filter((f) => f.path.includes("component"))
            .map((f) => f.path),
        },
        {
          name: "Business Logic Layer",
          description: "Core application logic and business rules",
          components: files
            .filter(
              (f) => f.path.includes("service") || f.path.includes("lib")
            )
            .map((f) => f.path),
        },
        {
          name: "Data Layer",
          description: "Data access and management",
          components: files
            .filter(
              (f) => f.path.includes("model") || f.path.includes("interface")
            )
            .map((f) => f.path),
        },
      ],
    },
    folderStructure: {
      tree: createFolderStructureTree(files, repositoryName),
      directories: [
        {
          path: "src/",
          purpose: "Main source code directory",
          type: "source" as const,
          fileCount: files.filter((f) => f.path.startsWith("src/")).length,
          description:
            "Contains the main application source code including components, services, and utilities",
        },
      ],
    },
    codeInternals: {
      codeFlow: `The application follows a standard ${language} execution flow with initialization, main processing, and cleanup phases.`,
      keyAlgorithms: [
        {
          name: "Standard Processing",
          description: "Basic application processing logic",
          file: "main application file",
          complexity: "O(n)",
          implementation: "Standard implementation patterns",
        },
      ],
      designPatterns: [
        {
          pattern: "Module Pattern",
          usage: "Used for organizing code into reusable modules",
          files: files.map((f) => f.path),
          description: "Better code organization and maintainability",
        },
      ],
      dataFlow:
        "Data flows from input through processing layers to output with validation at each stage",
      businessLogic: [
        {
          module: "Core Application",
          purpose: "Main application functionality",
          workflow: "Standard processing workflow",
          files: files.map((f) => f.path),
        },
      ],
    },
    sdlc: {
      developmentWorkflow:
        "Standard development workflow with version control, code review, and continuous integration",
      setupInstructions: [
        {
          step: 1,
          title: "Clone Repository",
          description: "Clone the repository to your local machine",
          commands: ["git clone <repository-url>"],
        },
        {
          step: 2,
          title: "Install Dependencies",
          description: "Install project dependencies",
          commands: ["npm install", "yarn install"],
        },
      ],
      buildProcess: {
        description: `Standard ${language} build process`,
        steps: [
          "Install dependencies",
          "Run build command",
          "Generate output",
        ],
        tools: ["Package manager", "Build tools", "Bundler"],
      },
      testingStrategy: {
        approach: "Unit testing with integration tests",
        testTypes: ["unit", "integration", "e2e"],
        coverage: "Target 80%+ code coverage",
        frameworks: ["Standard testing framework"],
      },
      deploymentGuide: {
        process: "Automated deployment through CI/CD pipeline",
        environments: ["development", "staging", "production"],
        steps: [
          {
            environment: "development",
            steps: [
              "Build application",
              "Run tests",
              "Deploy to dev environment",
            ],
          },
        ],
      },
      maintenance: {
        guidelines: [
          "Regular code reviews",
          "Keep dependencies updated",
          "Monitor performance",
        ],
        monitoring: [
          "Application logs",
          "Performance metrics",
          "Error tracking",
        ],
        troubleshooting: [
          {
            issue: "Application not starting",
            solution:
              "Check logs for errors and verify environment configuration",
          },
        ],
      },
    },
    components: files.map((f) => ({
      name: f.path.split("/").pop() || f.path,
      type: f.path.includes("component") ? "Component" : "File",
      file: f.path,
      description: "Component/file in the codebase",
      dependencies: [] as string[],
      exports: [] as string[],
      internals: {
        purpose: "Core application functionality",
        keyMethods: ["main", "init", "process"],
        stateManagement: "Local state management",
        lifecycle: "Standard lifecycle",
      },
    })),
    apis: [
      {
        endpoint: "/api/health",
        method: "GET",
        description: "Health check endpoint",
        parameters: [],
        response: '{ "status": "ok" }',
        internals: {
          implementation: "Health controller",
          validation: "Basic validation",
          errorHandling: "Standard error handling",
          authentication: "No authentication required",
        },
      },
    ],
    functions: [
      {
        name: "main",
        file: "main application file",
        type: "function",
        description: "Main application entry point",
        parameters: [],
        returns: {
          type: "void",
          description: "No return value",
        },
        internals: {
          algorithm: "Simple initialization and startup",
          complexity: "O(1)",
          sideEffects: "None",
          dependencies: [],
        },
      },
    ],
    dataModels: [
      {
        name: "ApplicationConfig",
        type: "Interface",
        file: "config file",
        properties: [
          {
            name: "environment",
            type: "string",
            description: "Application environment",
          },
        ],
        relationships: [],
        validation: ["Required field validation"],
      },
    ],
    mermaidDiagram:
      "graph TD\nA[User] --> B[" +
      repositoryName +
      " Application]\nB --> C[Business Logic]\nC --> D[Data Layer]",
    examples: [
      {
        title: "Basic Usage",
        description: "How to use the main application",
        code: `// Example usage\n// Initialize application\n// Process data\n// Return results`,
        explanation: "This shows the basic application flow",
      },
    ],
  };
}