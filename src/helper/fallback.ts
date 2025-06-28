import type { ProjectData } from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface";

// Utility function for folder structure tree
export function createFolderStructureTree(
  files: Array<{ path: string; content: string }>,
  repositoryName: string
): string {
  if (!files || files.length === 0) {
    return `${repositoryName}/\n└── (empty)`;
  }

  // Build directory tree structure
  const tree: Record<string, any> = {};

  // Filter and process files
  const validFiles = files.filter((f) => f.path && f.path.trim().length > 0);

  validFiles.forEach((file) => {
    // Handle both forward and backward slashes, and normalize paths
    const normalizedPath = file.path
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "");
    if (!normalizedPath) return;

    const parts = normalizedPath.split("/").filter((part) => part.length > 0);
    if (parts.length === 0) return;

    let current = tree;

    // Navigate through directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    // Add file to the directory
    const fileName = parts[parts.length - 1];
    if (fileName && fileName.trim().length > 0) {
      current[fileName] = null; // null indicates it's a file
    }
  });

  // Function to render tree with proper indentation
  function renderTree(
    node: any,
    prefix: string = "",
    isLast: boolean = true
  ): string {
    let result = "";
    const entries = Object.keys(node).sort((a, b) => {
      // Directories first, then files
      const aIsDir = node[a] !== null;
      const bIsDir = node[b] !== null;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    entries.forEach((key, index) => {
      const isLastEntry = index === entries.length - 1;
      const isDirectory = node[key] !== null;
      const connector = isLastEntry ? "└── " : "├── ";
      const name = isDirectory ? `${key}/` : key;

      result += `${prefix}${connector}${name}\n`;

      if (isDirectory && Object.keys(node[key]).length > 0) {
        const newPrefix = prefix + (isLastEntry ? "    " : "│   ");
        result += renderTree(node[key], newPrefix, isLastEntry);
      }
    });

    return result;
  }

  return `${repositoryName}/\n${renderTree(tree)}`.trim();
}

// Function to extract API endpoints from files
export function extractApiEndpoints(
  files: Array<{ path: string; content: string }>
): Array<{
  endpoint: string;
  method: string;
  description: string;
  parameters: Array<{ name: string; type: string; description: string }>;
  response: string;
  internals: {
    implementation: string;
    validation: string;
    errorHandling: string;
    authentication: string;
  };
}> {
  const endpoints: Array<any> = [];

  files.forEach((file) => {
    // Check for API files more comprehensively
    const isApiFile =
      file.path.includes("api/") ||
      file.path.includes("routes/") ||
      file.path.includes("server/") ||
      file.path.includes("backend/") ||
      file.content.includes("router.") ||
      file.content.includes("app.") ||
      file.content.includes("express()") ||
      file.content.includes("fastify") ||
      file.content.includes("@app.route") ||
      file.content.includes("@RestController") ||
      (file.content.includes("def ") && file.content.includes("request"));

    if (isApiFile) {
      // Extract Express.js/Node.js routes
      const routeMatches = file.content.match(
        /router\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g
      );
      const appMatches = file.content.match(
        /app\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g
      );

      // Extract Flask routes
      const flaskMatches = file.content.match(
        /@app\.route\s*\(\s*["'`]([^"'`]+)["'`][\s\S]*?methods\s*=\s*\[["'`]([^"'`]+)["'`]\]/g
      );

      // Extract FastAPI routes
      const fastapiMatches = file.content.match(
        /@app\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g
      );

      const allMatches = [
        ...(routeMatches || []),
        ...(appMatches || []),
        ...(fastapiMatches || []),
      ];

      // Handle Flask routes separately
      if (flaskMatches) {
        flaskMatches.forEach((match) => {
          const routeMatch = match.match(
            /@app\.route\s*\(\s*["'`]([^"'`]+)["'`]/
          );
          const methodMatch = match.match(
            /methods\s*=\s*\[["'`]([^"'`]+)["'`]\]/
          );

          if (routeMatch && methodMatch) {
            const endpoint = routeMatch[1];
            const method = methodMatch[1].toUpperCase();

            endpoints.push({
              endpoint: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
              method,
              description: `${method} ${endpoint} (Flask route)`,
              parameters: [],
              response: "JSON response",
              internals: {
                implementation: file.path,
                validation: "Flask request validation",
                errorHandling: "Flask error handling",
                authentication: endpoint.includes("auth")
                  ? "Required"
                  : "Check implementation",
              },
            });
          }
        });
      }

      allMatches.forEach((match) => {
        const methodMatch = match.match(/(get|post|put|delete|patch)/);
        const endpointMatch = match.match(/["'`]([^"'`]+)["'`]/);

        if (methodMatch && endpointMatch) {
          const method = methodMatch[1].toUpperCase();
          const endpoint = endpointMatch[1];

          // Try to find comments or descriptions near the route
          const lines = file.content.split("\n");
          let description = `${method} ${endpoint}`;

          for (let i = 0; i < lines.length; i++) {
            if (
              lines[i].includes(endpoint) &&
              lines[i].includes(method.toLowerCase())
            ) {
              // Look for comments above or below
              if (i > 0 && lines[i - 1].trim().startsWith("//")) {
                description = lines[i - 1].replace("//", "").trim();
              } else if (
                i < lines.length - 1 &&
                lines[i + 1].trim().startsWith("//")
              ) {
                description = lines[i + 1].replace("//", "").trim();
              }
              break;
            }
          }

          endpoints.push({
            endpoint: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
            method,
            description,
            parameters: [],
            response: "JSON response",
            internals: {
              implementation: `${file.path}`,
              validation: "Express middleware validation",
              errorHandling: "Standard Express error handling",
              authentication: endpoint.includes("auth")
                ? "Required"
                : "Check implementation",
            },
          });
        }
      });
    }
  });

  return endpoints;
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

export const fallbackComprehensiveDocumentationFromFiles = (
  files: { path: string; content: string }[],
  language: string,
  repositoryName: string
) => {
  // Create a proper file structure overview - ensure we have actual file paths
  const validFiles = files.filter((f) => f.path && f.path.length > 0);

  // Generate folder structure tree
  const folderTree = createFolderStructureTree(validFiles, repositoryName);

  // Extract API endpoints
  const apiEndpoints = extractApiEndpoints(validFiles);

  // Create directory analysis
  const directories = Array.from(
    new Set(validFiles.map((f) => f.path.split("/")[0]).filter((dir) => dir))
  ).map((dir) => {
    const dirFiles = validFiles.filter((f) => f.path.startsWith(dir + "/"));
    return {
      path: dir,
      type:
        dir === "src"
          ? "source"
          : dir === "test"
          ? "test"
          : dir === "config"
          ? "config"
          : "other",
      description: `${dir} directory containing ${dirFiles.length} files`,
      fileCount: dirFiles.length,
      purpose:
        dir === "src"
          ? "Main source code directory"
          : dir === "components"
          ? "Reusable UI components"
          : dir === "pages"
          ? "Application pages/routes"
          : dir === "lib"
          ? "Utility libraries and services"
          : dir === "helper"
          ? "Helper functions and utilities"
          : dir === "types"
          ? "TypeScript type definitions"
          : dir === "server"
          ? "Backend server code"
          : `${dir} directory`,
    };
  });

  // Extract components from React/Vue files
  const components = validFiles
    .filter(
      (f) =>
        f.path.endsWith(".tsx") ||
        f.path.endsWith(".jsx") ||
        f.path.endsWith(".vue")
    )
    .map((f) => {
      const componentName =
        f.path
          .split("/")
          .pop()
          ?.replace(/\.(tsx|jsx|vue)$/, "") || "Unknown";
      return {
        name: componentName,
        type: f.path.includes("/pages/")
          ? "page"
          : f.path.includes("/components/")
          ? "component"
          : "module",
        file: f.path,
        description: `${componentName} ${
          f.path.includes("/pages/") ? "page" : "component"
        }`,
        dependencies: [],
      };
    });

  // Detect architecture pattern
  let architecturePattern = "Component-based";
  if (
    validFiles.some(
      (f) => f.path.includes("mvc") || f.path.includes("controller")
    )
  ) {
    architecturePattern = "MVC (Model-View-Controller)";
  } else if (
    validFiles.some(
      (f) => f.path.includes("pages") && f.path.includes("components")
    )
  ) {
    architecturePattern = "Component-based Architecture";
  } else if (
    validFiles.some(
      (f) => f.path.includes("server") && f.path.includes("client")
    )
  ) {
    architecturePattern = "Client-Server Architecture";
  }

  // Detect technologies
  const technologies = [];
  if (
    validFiles.some(
      (f) => f.content.includes("react") || f.path.endsWith(".tsx")
    )
  ) {
    technologies.push("React", "TypeScript");
  }
  if (
    validFiles.some(
      (f) => f.content.includes("express") || f.content.includes("app.get")
    )
  ) {
    technologies.push("Express.js", "Node.js");
  }
  if (
    validFiles.some(
      (f) => f.content.includes("vite") || f.path.includes("vite")
    )
  ) {
    technologies.push("Vite");
  }
  if (validFiles.some((f) => f.content.includes("tailwind"))) {
    technologies.push("Tailwind CSS");
  }

  return {
    summary: `${repositoryName} is a ${language} application built with ${
      technologies.length > 0
        ? technologies.join(", ")
        : "modern web technologies"
    }. The project follows a ${architecturePattern.toLowerCase()} with ${
      validFiles.length
    } files organized across ${directories.length} main directories.`,

    architecture: {
      pattern: architecturePattern,
      description: `The application follows a ${architecturePattern.toLowerCase()} where components are organized into logical directories for maintainability and scalability.`,
      technologies:
        technologies.length > 0 ? technologies : [language, "Web Technologies"],
      layers: [
        {
          name: "Presentation Layer",
          description: "User interface components and pages",
          components: components
            .filter((c) => c.type === "component" || c.type === "page")
            .map((c) => c.name),
        },
        {
          name: "Business Logic Layer",
          description: "Application logic and services",
          components: validFiles
            .filter(
              (f) => f.path.includes("/lib/") || f.path.includes("/helper/")
            )
            .map(
              (f) =>
                f.path
                  .split("/")
                  .pop()
                  ?.replace(/\.[^.]+$/, "") || ""
            )
            .filter((n) => n),
        },
      ],
    },

    folderStructure: {
      tree: folderTree,
      directories: directories,
    },

    components: components,

    apis: apiEndpoints,

    codeInternals: {
      codeFlow: `The application starts from the main entry point and routes through various components. ${
        components.length > 0
          ? `Key components include ${components
              .slice(0, 3)
              .map((c) => c.name)
              .join(", ")}.`
          : ""
      }`,
      keyAlgorithms: [
        {
          name: "Component Rendering",
          description: "React component lifecycle and rendering process",
          complexity: "O(n) where n is number of components",
          file: "src/components/",
        },
      ],
      designPatterns: [
        {
          pattern: "Component Pattern",
          description: "Reusable UI components with props and state management",
          usage: "Used throughout the application for UI composition",
          files: components.map((c) => c.file),
        },
      ],
    },

    sdlc: {
      setupInstructions: [
        {
          step: 1,
          title: "Install Dependencies",
          description: "Install all required project dependencies",
          commands: ["npm install", "yarn install"],
        },
        {
          step: 2,
          title: "Start Development Server",
          description: "Run the development server",
          commands: ["npm run dev", "yarn dev"],
        },
        {
          step: 3,
          title: "Build for Production",
          description: "Create production build",
          commands: ["npm run build", "yarn build"],
        },
      ],
    },

    examples: [
      {
        title: "Component Usage Example",
        description: "Example of how components are structured in this project",
        code: `import React from 'react';\n\nconst ExampleComponent = () => {\n  return (\n    <div className="component">\n      <h1>Hello World</h1>\n    </div>\n  );\n};\n\nexport default ExampleComponent;`,
        explanation:
          "This shows the basic structure of React components used in the project",
      },
    ],

    mermaidDiagram: `flowchart TD
    A[App Entry Point] --> B[Router]
    B --> C[Pages]
    B --> D[Components]
    C --> E[UI Components]
    D --> E
    E --> F[User Interface]
    G[Backend/API] --> H[Data Layer]
    C --> G
    D --> G`,
  };
};
