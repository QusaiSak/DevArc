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

  // Create tree structure
  const tree: Record<string, any> = {};

  // Process all files
  files.forEach((file) => {
    const parts = file.path.split(/[/\\]/).filter(Boolean);
    let current = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        current[part] = null;
      } else {
        // It's a directory
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });

  // Generate the tree string
  function renderTree(
    node: Record<string, any>,
    prefix = "",
    isLast = true,
    isRoot = false
  ): string[] {
    const entries = Object.entries(node);
    const lines: string[] = [];

    entries.forEach(([key, value], index) => {
      const isLastEntry = index === entries.length - 1;
      const newPrefix = isRoot ? "" : prefix + (isLast ? "    " : "│   ");
      
      // Add current line
      lines.push(
        `${prefix}${isRoot ? "" : isLast ? "└── " : "├── "}${key}${
          value === null ? "" : "/"
        }`
      );

      // Recursively process children
      if (value !== null) {
        lines.push(
          ...renderTree(value, newPrefix, isLastEntry)
        );
      }
    });

    return lines;
  }

  const treeLines = renderTree(tree, "", true, true);
  return `${repositoryName}/\n${treeLines.join("\n")}`;
}

// Update the API endpoint extraction to return better structured data:

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
      // Enhanced route pattern matching
      const patterns = [
        // Express/Node.js patterns
        /(?:router|app)\.(get|post|put|delete|patch|use)\s*\(\s*["'`]([^"'`]+)["'`]/g,
        // REST API decorators
        /@(Get|Post|Put|Delete|Patch)\s*\(\s*["'`]([^"'`]+)["'`]/gi,
        // Flask patterns
        /@app\.route\s*\(\s*["'`]([^"'`]+)["'`][\s\S]*?methods\s*=\s*\[["'`]([^"'`]+)["'`]\]/g,
        // FastAPI patterns
        /@app\.(get|post|put|delete|patch)\s*\(\s*["'`]([^"'`]+)["'`]/g,
        // Spring Boot patterns
        /@(GetMapping|PostMapping|PutMapping|DeleteMapping)\s*\(\s*["'`]([^"'`]+)["'`]/g,
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(file.content)) !== null) {
          const method = (match[1] || match[2]).toUpperCase();
          const endpoint = match[2] || match[1];
          
          if (endpoint && !endpoint.includes('undefined')) {
            // Extract more sophisticated parameter information
            const extractParameters = (endpoint: string, fileContent: string) => {
              const params = [];
              
              // Path parameters
              const pathParams = endpoint.match(/:(\w+)|\{(\w+)\}|<(\w+)>/g) || [];
              pathParams.forEach(param => {
                const cleanParam = param.replace(/[:{})<]/g, '');
                params.push({
                  name: cleanParam,
                  type: 'string',
                  description: `Path parameter: ${cleanParam}`
                });
              });

              // Query parameters (look for req.query, request.args, etc.)
              const queryMatches = fileContent.match(/(?:req\.query|request\.args|params\.get)\.\s*(\w+)/g) || [];
              queryMatches.slice(0, 3).forEach(query => {
                const paramName = query.split('.').pop();
                if (paramName) {
                  params.push({
                    name: paramName,
                    type: 'string',
                    description: `Query parameter: ${paramName}`
                  });
                }
              });

              // Body parameters
              const bodyMatches = fileContent.match(/(?:req\.body|request\.json)\.\s*(\w+)/g) || [];
              bodyMatches.slice(0, 3).forEach(body => {
                const paramName = body.split('.').pop();
                if (paramName) {
                  params.push({
                    name: paramName,
                    type: 'any',
                    description: `Request body parameter: ${paramName}`
                  });
                }
              });

              return params;
            };

            // Enhanced description extraction
            const extractDescription = (endpoint: string, method: string, fileContent: string) => {
              const lines = fileContent.split('\n');
              let description = `${method} ${endpoint}`;
              
              // Look for comments, docstrings, or JSDoc
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes(endpoint)) {
                  // Check previous lines for comments
                  for (let j = Math.max(0, i - 3); j < i; j++) {
                    const line = lines[j].trim();
                    if (line.startsWith('//') || line.startsWith('*') || line.startsWith('"""')) {
                      description = line.replace(/^(\/\/|\*|""")?\s*/, '').trim();
                      break;
                    }
                  }
                  break;
                }
              }

              // Infer purpose from endpoint path
              if (endpoint.includes('/auth') || endpoint.includes('/login')) {
                description = `Authentication endpoint - ${description}`;
              } else if (endpoint.includes('/api/')) {
                description = `API endpoint - ${description}`;
              }

              return description;
            };

            const parameters = extractParameters(endpoint, file.content);
            const description = extractDescription(endpoint, method, file.content);

            endpoints.push({
              endpoint: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
              method,
              description,
              parameters,
              response: inferResponseType(endpoint, method),
              internals: {
                implementation: file.path,
                validation: parameters.length > 0 ? 'Parameter validation required' : 'No validation needed',
                errorHandling: 'Standard error handling with appropriate HTTP status codes',
                authentication: inferAuthRequirement(endpoint)
              }
            });
          }
        }
      });
    }
  });

  return endpoints.filter((endpoint, index, self) =>
    index === self.findIndex(e => e.endpoint === endpoint.endpoint && e.method === endpoint.method)
  ).sort((a, b) => a.endpoint.localeCompare(b.endpoint));
}

// Helper functions for better API analysis
function inferResponseType(endpoint: string, method: string): string {
  if (method === 'POST' && endpoint.includes('/auth')) return 'Authentication token and user data';
  if (method === 'GET' && endpoint.includes('/list')) return 'Array of objects with pagination';
  if (method === 'POST') return 'Created resource data with status';
  if (method === 'PUT' || method === 'PATCH') return 'Updated resource data';
  if (method === 'DELETE') return 'Deletion confirmation status';
  if (method === 'GET') return 'Requested resource data';
  return 'JSON response with appropriate status';
}

function inferAuthRequirement(endpoint: string): string {
  if (endpoint.includes('/auth') || endpoint.includes('/login') || endpoint.includes('/register')) {
    return 'Public endpoint for authentication';
  }
  if (endpoint.includes('/admin') || endpoint.includes('/secure')) {
    return 'Required - Admin/elevated privileges needed';
  }
  if (endpoint.includes('/api/')) {
    return 'Required - JWT/Token based authentication';
  }
  return 'Authentication may be required based on implementation';
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

// Update the fallbackComprehensiveDocumentationFromFiles function:

export const fallbackComprehensiveDocumentationFromFiles = (
  files: Array<{ path: string; content: string }>,
  language: string,
  repositoryName: string
) => {
  console.log("🔄 Using fallback comprehensive documentation...");

  const validFiles = files.filter(
    (f) => f.path && f.path.length > 0 && f.content && f.content.length > 0
  );

  // Generate folder structure tree with proper formatting
  const folderTree = createFolderStructureTree(validFiles, repositoryName);
  console.log("📁 Generated folder tree:", folderTree);

  // Extract API endpoints
  const apiEndpoints = extractApiEndpoints(validFiles);

  // Create directory analysis
  const directories = Array.from(
    new Set(
      validFiles
        .map((f) => {
          const parts = f.path.split("/");
          return parts.length > 1 ? parts[0] : null;
        })
        .filter((dir): dir is string => dir !== null)
    )
  ).map((dir) => {
    const dirFiles = validFiles.filter((f) => f.path.startsWith(dir + "/"));
    return {
      path: dir + "/",
      purpose: getDirectoryPurpose(dir),
      type: getDirectoryType(dir),
      fileCount: dirFiles.length,
      description: `Contains ${dirFiles.length} files related to ${getDirectoryPurpose(dir).toLowerCase()}`,
    };
  });

  return {
    summary: `${repositoryName} is a ${language} application with ${validFiles.length} files organized in a structured directory layout.`,
    
    architecture: {
      pattern: "Component-based",
      description: "The application follows a modular component-based architecture with clear separation of concerns.",
      technologies: [language],
      layers: [
        {
          name: "Presentation Layer",
          description: "User interface and presentation logic",
          components: [],
        },
        {
          name: "Business Logic Layer", 
          description: "Core application logic and services",
          components: [],
        },
      ],
    },

    folderStructure: {
      tree: folderTree,
      directories: directories,
    },

    codeInternals: {
      codeFlow: `The ${repositoryName} application starts from the main entry point and processes through various components organized in the directory structure.`,
      keyAlgorithms: [],
      designPatterns: [
        {
          pattern: "Modular Architecture",
          usage: "Files are organized into logical directories",
          files: validFiles.slice(0, 5).map(f => f.path),
          description: "Separation of concerns through directory structure",
        },
      ],
      dataFlow: "Data flows through the application layers from input processing to output generation.",
      businessLogic: [],
    },

    components: [],
    apis: apiEndpoints,
    functions: [],
    dataModels: [],

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
          commands: ["npm run dev", "yarn dev", "npm start"],
        },
      ],
    },

    examples: [
      {
        title: "Project Structure Example",
        description: "Example of how the project is organized",
        code: folderTree,
        explanation: "The project follows a standard directory structure for better organization and maintainability.",
      },
    ],

    mermaidDiagram: `flowchart TD
    A[${repositoryName}] --> B[Source Files]
    B --> C[Components]
    B --> D[Services]
    C --> E[User Interface]
    D --> F[Business Logic]
    E --> G[Output]
    F --> G`,
  };
};

// Helper functions
function getDirectoryPurpose(dir: string): string {
  const lowerDir = dir.toLowerCase();
  if (lowerDir.includes('src') || lowerDir.includes('source')) return 'Source Code';
  if (lowerDir.includes('test')) return 'Test Files';
  if (lowerDir.includes('config')) return 'Configuration';
  if (lowerDir.includes('doc')) return 'Documentation';
  if (lowerDir.includes('asset') || lowerDir.includes('static')) return 'Static Assets';
  if (lowerDir.includes('lib') || lowerDir.includes('util')) return 'Utility Libraries';
  return 'General Files';
}

function getDirectoryType(dir: string): string {
  const lowerDir = dir.toLowerCase();
  if (lowerDir.includes('src') || lowerDir.includes('source')) return 'source';
  if (lowerDir.includes('test')) return 'test';
  if (lowerDir.includes('config')) return 'configuration';
  if (lowerDir.includes('doc')) return 'documentation';
  if (lowerDir.includes('asset') || lowerDir.includes('static')) return 'assets';
  return 'other';
}
