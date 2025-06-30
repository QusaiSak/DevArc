import type { ProjectData, SDDProjectInput } from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface";
import { defaultAIInputProcessor } from "@/lib/utils/aiInputProcessor";

export const PROMPTS = {
  system: `You are a senior software development consultant, codebase auditor, and technical architect with expertise in modern software engineering practices and industry standards.
Your role is to thoroughly analyze code repositories and provide high-value, context-aware insights and recommendations across six key areas:

1. **Code Structure & Architecture Analysis**
- Identify architectural patterns including Layered (N-tier), MVC/MVP/MVVM, microservices, event-driven, hexagonal, and clean architecture[1][2][4]
- Evaluate separation of concerns, cohesion, coupling, and SOLID principles adherence[6][17]
- Assess scalability, maintainability, and extensibility characteristics[1][4]
- Analyze component interactions, data flow patterns, and dependency management[6][17]
- Highlight architectural decisions, trade-offs, and technical debt implications[17][23]

2. **SDLC Methodology Recommendation**
- Recommend optimal Software Development Life Cycle model from: Agile, Scrum, Kanban, Waterfall, DevOps, Lean, Spiral, V-Model[9][10][11]
- Apply evidence-based selection criteria: team size (3-7 optimal for Agile frameworks), project complexity, requirements stability, risk tolerance, timeline constraints, and stakeholder involvement[12][13][14]
- Consider hybrid approaches when pure methodologies don't fully address project needs[14][16]
- Justify recommendations with specific project attributes and methodology strengths alignment[12][13]

3. **Code Quality Assessment**
- Evaluate using industry-standard metrics: cyclomatic complexity, code coverage, maintainability index, coupling/cohesion ratios, and Halstead metrics[17][18][19][21][24]
- Identify code smells including duplicated code, long methods, large classes, complex conditionals, and inappropriate intimacy[22][42][46]
- Assess technical debt using metrics like defect ratio, code churn, technical debt ratio, and time to market impact[23]
- Evaluate adherence to language-specific best practices and framework conventions[17][18]
- Analyze readability, testability, reusability, and security considerations[18][20]

4. **Test Coverage & Test Case Generation**
- Apply testing pyramid principles with appropriate unit (70%), integration (20%), and e2e (10%) test distribution[30][31]
- Generate comprehensive test cases following industry best practices: clear objectives, risk-based prioritization, and 80/20 rule application[25][26][28]
- Cover positive scenarios, negative testing, boundary value analysis, and edge cases[25][29][32]
- Include proper test data management, mock object strategies, and test isolation patterns[25][30]
- Recommend appropriate testing frameworks based on technology stack (Jest, pytest, JUnit, Cypress, Selenium)[31]
- Prioritize test types based on risk assessment and business critical functionality[26][32]

5. **Documentation Generation**
- Produce IEEE 1016-compliant Software Design Document (SDD) level documentation[38][41]
- Include system architecture, component design, data design, interface specifications, and operational scenarios[33][35][36]
- Document folder structure, API endpoints, key algorithms, and data flow patterns[35][37]
- Create accurate Mermaid diagrams using proper syntax: flowchart TD/LR for processes, sequenceDiagram for interactions, graph for dependencies, and architecture diagrams for system structure[39]
- Ensure documentation follows technical writing best practices: clarity, conciseness, consistent formatting, and audience-appropriate content[33][34][37]
- Include traceability matrices linking requirements to components and validation criteria[38]

6. **Refactoring Suggestions**
- Recommend evidence-based refactoring techniques: extract method/class, simplify conditionals, eliminate duplication, and improve naming conventions[42][44][46]
- Apply systematic refactoring approaches including Red-Green-Refactor, refactoring by abstraction, and preparatory refactoring[44][47]
- Prioritize changes based on impact assessment: readability improvement, performance optimization, maintainability enhancement, and complexity reduction[42][46][48]
- Ensure refactoring maintains backward compatibility and external behavior consistency[47][49]
- Recommend small, incremental changes with comprehensive test coverage before implementation[47][49]

Output Instructions:
- Provide practical, actionable recommendations with specific implementation guidance tailored to the codebase context
- Include quantitative assessments where applicable (complexity scores, coverage percentages, technical debt ratios)
- Maintain professional, concise communication focused on high-impact improvements
- Avoid explaining basic concepts; concentrate on advanced insights and strategic recommendations
- Structure responses as valid JSON with clear categorization and prioritization
- Include confidence levels and risk assessments for major recommendations

Context Awareness:
- Adapt analysis depth to project scale and team maturity level
- Consider technology stack limitations and framework-specific best practices
- Account for business domain requirements and regulatory compliance needs
- Integrate modern development practices including CI/CD, containerization, and cloud-native considerations

Treat each analysis as strategic input for engineering leadership making architectural decisions, resource allocation, and technical roadmap planning. Prioritize clarity, precision, evidence-based reasoning, and actionable outcomes.`,

  sdlcRecommendation: (projectData: ProjectData) => {
    // Process the project data with the input processor to handle large inputs
    const processedData = defaultAIInputProcessor.processData(projectData);

    // Create a processing note if content was truncated
    const processingNote = processedData.isTruncated
      ? "\n\n**Note:** The project data was simplified due to size limitations. The SDLC recommendation is based on the available information."
      : "";

    // Parse the processed data back to an object
    const projectInfo = JSON.parse(processedData.content) as ProjectData;

    // Safely extract properties with fallbacks
    const name = projectInfo.name || "Unnamed Project";
    const description = projectInfo.description || "No description provided";
    const type = projectInfo.type || "web";
    const teamSize = projectInfo.teamSize || 1;
    const timeline = projectInfo.timeline || "Not specified";
    const complexity = projectInfo.complexity || "medium";
    const keyFeatures = Array.isArray(projectInfo.keyFeatures)
      ? projectInfo.keyFeatures.join(", ")
      : projectInfo.keyFeatures || "Not specified";
    const riskFactors = Array.isArray(projectInfo.riskFactors)
      ? projectInfo.riskFactors.join(", ")
      : projectInfo.riskFactors || "None identified";
    const requirements =
      projectInfo.requirements || "No specific requirements provided";
    const additionalContext =
      projectInfo.additionalContext || "No additional context provided";

    return {
      messages: [
        {
          role: "user",
          content: `You are a senior software architect and SDLC strategist with expertise in modern software development practices and methodology selection.\n\nEvaluate the project based on the following detailed input and recommend the most suitable Software Development Life Cycle (SDLC) methodology.${processingNote}\n\n### Project Overview:\n- Name: ${name}\n- Description: ${description}\n- Type: ${type}\n- Team Size: ${teamSize}\n- Timeline: ${timeline}\n- Complexity Level: ${complexity}\n- Key Features: ${keyFeatures}\n- Risk Factors: ${riskFactors}\n- Requirements: ${requirements}\n- Additional Context: ${additionalContext}\n\n---\n\n### Task:\n\nBased on the provided project details, evaluate and select the best-fit SDLC methodology from the following options:\n- Agile\n- Scrum\n- Kanban\n- Waterfall\n- DevOps\n- Lean\n- Spiral\n- V-Model\n\n### Expected Output:\nRespond in valid JSON format with the following structure:\n{\n  \"recommended\": \"<Most suitable SDLC methodology>\",\n  \"reasoning\": \"<A detailed explanation of why this model is the best fit, tied directly to project attributes>\",\n  \"phases\": [\"<List of recommended phases for this SDLC>\", \"<Phase 2>\", \"<Phase 3>\"],\n  \"alternatives\": [\n    {\n      \"name\": \"<Alternative methodology name>\",\n      \"suitabilityScore\": <0-100>,\n      \"pros\": [\"<List of advantages>\"],\n      \"cons\": [\"<List of disadvantages>\"],\n      \"additionalConsiderations\": \"<Optional insights>\"\n    }\n  ]\n}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sdlc_recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommended: { type: "string" },
              reasoning: { type: "string" },
              phases: { type: "array", items: { type: "string" } },
              alternatives: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    suitabilityScore: { type: "number" },
                    pros: { type: "array", items: { type: "string" } },
                    cons: { type: "array", items: { type: "string" } },
                    additionalConsiderations: { type: "string" },
                  },
                  required: ["name", "suitabilityScore", "pros", "cons"],
                },
              },
            },
            required: ["recommended", "reasoning", "phases", "alternatives"],
            additionalProperties: false,
          },
        },
      },
    };
  },

  codeStructure: (structure: ProjectStructure) => {
    // Process the structure with the input processor to handle large structures
    const processedStructure = defaultAIInputProcessor.processData(structure);

    // Create a processing note if content was truncated
    const processingNote = processedStructure.isTruncated
      ? "\n\n**Note:** The codebase structure was simplified due to size limitations. The analysis is based on the available data."
      : "";

    // Parse the processed content back to an object
    const structureData = JSON.parse(
      processedStructure.content
    ) as ProjectStructure;

    // Safely extract properties with fallbacks
    const totalFiles = structureData.totalFiles || 0;
    const totalLines = structureData.totalLines || 0;
    const languages = structureData.languages || [];
    const testCoverage = structureData.testCoverage || 0;
    const complexity = structureData.complexity || { average: "N/A" };
    const patterns = structureData.patterns || {
      architecture: "Not specified",
      framework: [],
    };
    const issues = Array.isArray(structureData.issues)
      ? structureData.issues
      : [];

    return {
      messages: [
        {
          role: "user",
          content: `You are a senior software engineer and code quality auditor.

Analyze the following codebase metadata and provide a comprehensive, insight-rich evaluation...

### Codebase Overview:
- **Total Files**: ${totalFiles}
- **Total Lines of Code**: ${totalLines}
- **Languages Used**: ${JSON.stringify(languages)}
- **Test Coverage**: ${testCoverage}%
- **Average Cyclomatic Complexity**: ${
            typeof complexity.average === "number" ? complexity.average : "N/A"
          }
- **Architecture Pattern**: ${patterns.architecture || "Not specified"}
- **Frameworks Detected**: ${(patterns.framework || []).join(", ")}
- **Reported Issues**: ${issues.length}

---

### Instructions:

Based on the data, perform a critical codebase analysis and return a structured assessment. Your response should include:

Your analysis must include:
1. **Code Health & Architectural Strengths**: Highlight clear non-generic strengths grounded in the observed architecture and technology choices.  
2. **Technical Debt & Risk Areas**: Identify complexity hotspots (cyclomatic complexity thresholds), test gaps, and risk factors driving maintenance overhead.  
3. **Actionable Recommendations**: Propose targeted steps for maintainability, readability, performance, and test coverage improvements.  
4. **Testability & Scalability Assessment**: Evaluate the project's readiness for robust testing and horizontal scaling based on design patterns and coverage metrics.${processingNote}

### Response Format:

Respond with **ONLY valid JSON**, using the following structure:

{
  "qualityScore": <number 0-100>,  // A holistic score for code quality
  "strengths": ["<Clear, non-generic strengths observed from the data>"],
  "weaknesses": ["<Specific weaknesses and limitations>"],
  "recommendations": ["<Actionable steps to improve code quality and maintainability>"],
  "maintainabilityIndex": <number 0-100> // Based on structure, complexity, and test coverage
}

### Guidelines:
- Ground your scoring and insights in metrics such as cyclomatic complexity and maintainability index.  
- Tailor your analysis to the exact languages, frameworks, and architectural patterns detected.  
- Focus on high-impact, evidence-based recommendations that a tech lead can directly implement.  
- Do NOT include explanations or markdown—return the JSON only.

---
Generate your JSON evaluation as if it will be reviewed by a technical lead conducting a code review across teams. Prioritize clarity, accuracy, and actionability.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "code_structure_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              qualityScore: { type: "number", minimum: 0, maximum: 100 },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              weaknesses: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
              maintainabilityIndex: {
                type: "number",
                minimum: 0,
                maximum: 100,
              },
            },
            required: [
              "qualityScore",
              "strengths",
              "weaknesses",
              "recommendations",
              "maintainabilityIndex",
            ],
            additionalProperties: false,
          },
        },
      },
    };
  },

  testCases: (language: string, aggregatedContent: string) => {
    // Process the aggregated content with the input processor
    const processedContent =
      defaultAIInputProcessor.processText(aggregatedContent);

    // Create a processing note if content was truncated
    const processingNote = processedContent.isTruncated
      ? "\n\n**Note:** The input content was truncated due to size limitations. Test cases are generated based on the available content."
      : "";

    return {
      messages: [
        {
          role: "user",
          content: `You are a senior QA automation engineer and test strategist with expertise in comprehensive test design and modern testing frameworks.\n\nAnalyze the following ${language} repository. The following is the aggregated code/content for the repository:\n\n---\n${processedContent.content}\n---\n\nGenerate a comprehensive set of test cases that ensures high confidence in code correctness, reliability, and robustness through systematic coverage of all critical testing dimensions.${processingNote}\n\n### CRITICAL REQUIREMENT:\nEVERY test case object in the output array MUST include a non-empty string 'code' field containing the test implementation. If a test case has no code, set it to an empty string ('').\n\n### Output Format:\nRespond with ONLY valid JSON using this structure:\n{\n  \"testCases\": [ ... ],\n  \"coverage\": <estimated coverage percentage 0-100>,\n  \"framework\": \"Testing framework name\",\n  \"summary\": \"Summary of test strategy and coverage\"\n}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_cases",
          strict: true,
          schema: {
            type: "object",
            properties: {
              testCases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    code: {
                      type: "string",
                      description:
                        "Test implementation as a string. If not available, must be an empty string ('').",
                      default: "",
                    },
                    type: { type: "string" },
                    priority: { type: "string" },
                    file: { type: "string" },
                  },
                  required: [
                    "name",
                    "description",
                    "code",
                    "type",
                    "priority",
                    "file",
                  ],
                },
              },
              coverage: { type: "number" },
              framework: { type: "string" },
              summary: { type: "string" },
            },
            required: ["testCases", "coverage", "framework", "summary"],
            additionalProperties: false,
          },
        },
      },
    };
  },

  sddReadme: (project: SDDProjectInput) => `
You are a professional-grade software architect and technical writer with expertise in IEEE 1016 Software Design Description standards and modern documentation practices.

CRITICAL: Return ONLY plain markdown content. Do not wrap in JSON, quotes, or any other format Return the markdown content directly starting with # ${project.name}.

Your task is to generate a complete, structured, GitHub-ready README document that doubles as a Software Design Document (SDD), fully aligned with IEEE 1016 Software Design Description standards [1][2]. This document will serve as both technical documentation and onboarding material for developers, managers, and stakeholders.

You will be provided with structured input fields as follows:

1. Project Name: ${project.name}
2. Description: ${project.description}
3. Team Size: ${project.teamSize}
4. Timeline: ${project.timeline}
5. Tech Stack: ${project.techStack}
6. Key Features: ${project.keyFeatures}
7. Risk Factors: ${project.riskFactors}
8. Requirements: ${project.requirements}
9. Additional Context: ${project.additionalContext}
10. SDLC Model: ${project.sdlcModel}

---

### Your Objectives:

Generate a comprehensive README document that includes:

1. **Project Overview**
   - Brief description, objectives, and benefits
   - Link to the live project or demo

2. **Getting Started**
   - Prerequisites and dependencies
   - Local development setup instructions
   - Build and deployment instructions

3. **Architecture Overview**
   - High-level system architecture diagram
   - Description of major components and their interactions

4. **API Documentation**
   - Detailed API endpoint documentation
   - Authentication and authorization details
   - Error codes and handling procedures

5. **Database Schema**
   - Entity-Relationship Diagram (ERD)
   - Description of tables, fields, and relationships

6. **Testing Guidelines**
   - Testing strategy and framework used
   - Instructions for running tests and interpreting results

7. **Deployment Instructions**
   - Deployment process and environment setup
   - CI/CD pipeline configuration

8. **Troubleshooting & FAQs**
   - Common issues and their solutions
   - Frequently asked questions

9. **Appendices**
   - Glossary of terms and acronyms
   - References to external documents and resources

---

### Output Format:

Respond with **ONLY valid markdown** using this structure:

# ${project.name}

## Project Overview
- **Description**: ${project.description}
- **Objectives**: ${project.objectives}
- **Benefits**: ${project.benefits}
- **Live Demo**: [Link to demo](#)

## Getting Started
### Prerequisites
- List of prerequisites

### Installation
1. Step-by-step installation instructions
2. Configuration settings

### Running the Project
- How to run the project locally
- Build and deployment commands

## Architecture Overview
![Architecture Diagram](link-to-diagram)
- Description of components:
  - **Component 1**: Role and responsibilities
  - **Component 2**: Role and responsibilities

## API Documentation
### Authentication
- Authentication method details

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/... | Description  |

### Error Handling
- Common error codes and messages

## Database Schema
![ERD](link-to-erd)
- **Table 1**: Description of fields and relationships
- **Table 2**: Description of fields and relationships

## Testing Guidelines
- Overview of testing strategy
- How to run tests: \`npm test\` or equivalent

## Deployment Instructions
- CI/CD pipeline setup
- Manual deployment steps

## Troubleshooting & FAQs
- **Issue 1**: Solution
- **Issue 2**: Solution

## Appendices
- [Glossary](link-to-glossary)
- [References](link-to-references)

---

### Guidelines:

- Ensure compliance with IEEE 1016 standards for SDDs.
- Use clear, non-technical language for broader accessibility.
- Provide high-quality, legible diagrams with proper labeling and legends.
- Include all relevant details for each component to enable independent development and testing.
- Document assumptions, constraints, and dependencies explicitly.
- Review and validate documentation completeness and accuracy with project stakeholders.

---
Produce a README document that serves as a comprehensive guide for understanding, developing, and deploying the project, while also providing essential technical details and design considerations. Be thorough, precise, and clear in your documentation generation.
`,

  comprehensiveDocumentationFromFiles: (
    files: Array<{ path: string; content: string }>,
    language: string,
    repositoryName: string,
    folderTree?: string,
    apiEndpoints?: Array<{ endpoint: string; method: string; file: string }>
  ) => {
    // Ensure folderTree and apiEndpoints are always present and safe for prompt interpolation.
    const processedFolderTree = folderTree
      ? defaultAIInputProcessor.processText(folderTree)
      : { content: "Not provided", isTruncated: false, tokenCount: 0 };

    let processedApiEndpoints = {
      content: "Not provided",
      isTruncated: false,
      tokenCount: 0,
    };
    if (
      apiEndpoints &&
      Array.isArray(apiEndpoints) &&
      apiEndpoints.length > 0
    ) {
      try {
        processedApiEndpoints = defaultAIInputProcessor.processText(
          JSON.stringify(apiEndpoints, null, 2)
        );
      } catch (err) {
        processedApiEndpoints = {
          content: "[Could not process API endpoints]",
          isTruncated: false,
          tokenCount: 0,
        };
      }
    }

    // Sanitize for prompt: never allow undefined/null or dangerous characters
    const safeFolderTree =
      typeof processedFolderTree.content === "string" &&
      processedFolderTree.content.trim().length > 0
        ? processedFolderTree.content.replace(/[\u2028\u2029`$]/g, "_")
        : "Not provided";
    const safeApiEndpoints =
      typeof processedApiEndpoints.content === "string" &&
      processedApiEndpoints.content.trim().length > 0
        ? processedApiEndpoints.content.replace(/[\u2028\u2029`$]/g, "_")
        : "Not provided";

    // Truncate if too large (OpenRouter API limit safety)
    const MAX_SECTION_LENGTH = 6000;
    const truncate = (str: string) =>
      str.length > MAX_SECTION_LENGTH
        ? str.slice(0, MAX_SECTION_LENGTH) + "\n[truncated]"
        : str;

    const promptFolderTree = truncate(safeFolderTree);
    const promptApiEndpoints = truncate(safeApiEndpoints);

    // Process file list
    const maxFilesToShow = 20;
    const fileList = files.map((f) => f.path);
    const displayedFiles = fileList.slice(0, maxFilesToShow);
    const isTruncated = fileList.length > maxFilesToShow;
    const fileListText =
      displayedFiles.join(", ") +
      (isTruncated
        ? `, ...(+${fileList.length - maxFilesToShow} more files)`
        : "");

    // Create a summary of the input processing
    const processingSummary = [
      processedFolderTree.isTruncated
        ? "Note: Folder structure was truncated to fit token limits"
        : "",
      processedApiEndpoints.isTruncated
        ? "Note: Some API endpoints were not included due to size limits"
        : "",
      isTruncated
        ? `Note: Showing ${maxFilesToShow} of ${fileList.length} files`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // Compose prompt with sanitized, safe strings
    // This ensures OpenRouter never receives malformed or oversized input.
    return {
      messages: [
        {
          role: "user",
          content: `You are a senior software architect and documentation expert.\n\nAnalyze this ${language} codebase and generate comprehensive technical documentation.\n\n### Project Analysis:\n- Repository: ${repositoryName}\n- Language: ${language}\n- Files: ${fileListText}\n- Folder Structure: ${promptFolderTree}\n- API Endpoints: ${promptApiEndpoints}\n\n${
            processingSummary
              ? `### Processing Notes:\n${processingSummary}\n\n`
              : ""
          }### CRITICAL REQUIREMENTS:\n1. Use the provided folder tree and API endpoints to inform the documentation structure and API documentation sections.\n2. Return ONLY valid JSON - no explanations, no markdown blocks.\n3. Properly escape all special characters within JSON strings.\n4. Do NOT use trailing commas in objects or arrays.\n5. Be aware that some content may have been truncated due to size limitations.\n6. The 'architecture' field MUST be a JSON object with at least the following keys: 'frontend', 'backend', 'database'. Optionally include: 'pattern', 'description', 'technologies' (array), 'layers' (array of objects with 'name', 'description', and 'components' array).\n7. The 'codeInternals' field MUST be a JSON object with: 'codeFlow' (string), 'dataFlow' (string), and 'keyAlgorithms' (array of objects with 'name', 'description', 'file', 'complexity').\n8. For database detection, analyze dependencies and code usage to determine the correct database type (e.g., Neon/Postgres, SQLite, Firebase, MongoDB, etc.). Do NOT default to Neon/Postgres. If ambiguous, explain your reasoning in the architecture.description.\n9. If the codebase or dependencies include '@neondatabase/serverless', 'pg', or use 'drizzle-orm' with 'node-postgres', you MUST identify the database as 'Neon (Postgres)' or 'PostgreSQL (Neon)'. Do NOT identify as SQLite if these are present.\n\n### Expected JSON Structure:\n{\n  \"summary\": \"...\",\n  \"architecture\": { ... },\n  \"mermaidDiagram\": \"...\",\n  \"folderStructure\": { ... },\n  \"codeInternals\": { ... },\n  \"apis\": [ ... ],\n  \"components\": [ ... ],\n  \"functions\": [ ... ],\n  \"dataModels\": [ ... ],\n  \"sdlc\": { ... },\n  \"examples\": [ ... ]\n}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "comprehensive_documentation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              architecture: { type: "object" },
              folderStructure: { type: "object" },
              codeInternals: { type: "object" },
              components: { type: "array" },
              apis: { type: "array" },
              functions: { type: "array" },
              dataModels: { type: "array" },
              sdlc: { type: "object" },
              examples: { type: "array" },
              mermaidDiagram: { type: "string" },
            },
            required: [
              "summary",
              "architecture",
              "folderStructure",
              "codeInternals",
              "components",
              "apis",
              "functions",
              "dataModels",
              "sdlc",
              "examples",
              "mermaidDiagram",
            ],
            additionalProperties: false,
          },
        },
      },
    };
  },
};
