import type { AiMessage, AiResponseOptions, ProjectData, SDDProjectInput } from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface"


// ✅ Wrap response parsing in a reusable function
export function parseAiJsonResponse(aiText: string): any {
  try {
    // Trim whitespace
    let sanitized = aiText.trim();

    // Remove ```json or ``` wrapping if present
    if (sanitized.startsWith("```json")) {
      sanitized = sanitized.replace(/^```json/, "").trim();
    }
    if (sanitized.startsWith("```")) {
      sanitized = sanitized.replace(/^```/, "").trim();
    }
    if (sanitized.endsWith("```")) {
      sanitized = sanitized.slice(0, -3).trim();
    }

    // Optional: fix any escaped characters (not always needed, but safe)
    sanitized = sanitized
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\n/g, '')  // Remove newline escapes
      .replace(/\\r/g, '')  // Remove carriage returns
      .replace(/^"+|"+$/g, ''); // Trim surrounding quotes if present

    // Parse final cleaned string
    return JSON.parse(sanitized);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON response:", err);
    console.log("🔎 Raw AI response was:\n", aiText);
    throw new Error("Could not parse AI response as valid JSON.");
  }
}
const DEFAULT_OPTIONS: AiResponseOptions = {
  model: "mistralai/devstral-small:free",
  systemPrompt:
    "You are a senior software development consultant, codebase auditor, and technical architect.\n\n" +
    "Your role is to thoroughly analyze code repositories and provide high-value, context-aware insights and recommendations across six key areas:\n\n" +
    "1. **Code Structure & Architecture Analysis**\n" +
    "- Identify patterns (e.g., MVC, layered, modular, microservices)\n" +
    "- Evaluate cohesion, separation of concerns, and extensibility\n" +
    "- Highlight architectural decisions and their trade-offs\n\n" +
    "2. **SDLC Methodology Recommendation**\n" +
    "- Recommend the most suitable Software Development Life Cycle (SDLC) model (e.g., Agile, Waterfall, Scrum, DevOps, Lean, Spiral)\n" +
    "- Justify your recommendation based on team size, complexity, timeline, risk, and change frequency\n\n" +
    "3. **Code Quality Assessment**\n" +
    "- Evaluate modularity, readability, testability, and adherence to language/framework best practices\n" +
    "- Identify potential code smells, anti-patterns, or technical debt\n\n" +
    "4. **Test Coverage & Test Case Generation**\n" +
    "- Analyze existing tests (if any)\n" +
    "- Generate comprehensive test cases covering:\n" +
    "  - Happy paths\n" +
    "  - Edge cases\n" +
    "  - Error handling\n" +
    "  - Business logic\n" +
    "- Prioritize test types (unit, integration, e2e) based on context\n\n" +
    "5. **Documentation Generation**\n" +
    "- Produce maintainable, SDD-level documentation based on actual project structure and logic\n" +
    "- Include architecture, data flow, folder structure, components, functions, APIs, and key algorithms\n\n" +
    "6. **Refactoring Suggestions**\n" +
    "- Recommend concrete, localized refactors for readability, performance, or maintainability\n" +
    "- Prioritize changes that reduce complexity or improve developer experience\n\n" +
    "Output Instructions:\n" +
    "- Provide practical, actionable recommendations tailored to the codebase context\n" +
    "- Maintain a professional and concise tone\n" +
    "- Do not explain obvious concepts; focus on what matters most based on actual code\n" +
    "- Respond in raw, valid JSON only. Do not use code blocks, markdown, or escaped characters.\n\n" +
    "Treat each output as if it's being delivered to a tech lead or engineering manager planning real-world improvements. Prioritize clarity, precision, and realism.",
  temperature: 0.5,
  maxTokens: 8192,
};

export const generateAiResponse = async (
  messages: AiMessage[],
  options: Partial<AiResponseOptions> = {}
): Promise<string> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    
    if (messages.every(msg => msg.role !== "system") && mergedOptions.systemPrompt) {
      messages = [
        { role: "system", content: mergedOptions.systemPrompt },
        ...messages
      ];
    }
    
    console.log("AI Request - Messages:", messages.map(m => ({ role: m.role, contentLength: m.content.length })));
    console.log("AI Request - Options:", mergedOptions);
    
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key not found");
      throw new Error("OpenRouter API key not found");
    }
    
    const requestBody = {
      model: mergedOptions.model,
      messages,
      temperature: mergedOptions.temperature,
      max_tokens: mergedOptions.maxTokens
    };
    
    console.log("AI Request Body:", JSON.stringify(requestBody, null, 2));
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "DevArc Assistant"
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log("AI Response Status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Service Error Response:", errorText);
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log("AI Response Result:", result);
    
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response:", result);
      throw new Error("No content received from AI service");
    }
    
    console.log("AI Response Content Length:", content.length);
    return content;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};



export class AIAnalyzer {
  async generateSDLCRecommendation(projectData: ProjectData
   ): Promise<{
    recommended: string
    reasoning: string
    alternatives: Array<{
      model: string
      suitability: number
      pros: string[]
      cons: string[]
    }>
  }> {
    const prompt = `You are a senior software architect and SDLC strategist.

Evaluate the project based on the following detailed input and recommend the **most suitable Software Development Life Cycle (SDLC) methodology**. Your analysis must be strategic, contextual, and based on modern best practices.

### Project Overview:
- **Name**: ${projectData.name}
- **Description**: ${projectData.description}
- **Type**: ${projectData.type} (e.g., Web App, Mobile App, API)
- **Team Size**: ${projectData.teamSize}
- **Timeline**: ${projectData.timeline}
- **Complexity Level**: ${projectData.complexity} (Low, Medium, High)
- **Key Features**: ${projectData.keyFeatures}
- **Risk Factors**: ${projectData.riskFactors}
- **Requirements**: ${projectData.requirements} (e.g., authentication, integrations, payments)
- **Additional Context**: ${projectData.additionalContext}

---

### Task:

Based on the provided project details, evaluate and select the **best-fit SDLC methodology** from the following options:
- Agile
- Scrum
- Kanban
- Waterfall
- DevOps
- Lean
- Spiral
- V-Model

Your decision should consider:
- Team size and collaboration needs
- Timeline flexibility
- Risk level and need for iterative feedback
- Technical complexity and innovation
- Criticality of documentation and process control

---

### Expected Output:

Respond in **valid JSON** format with the following structure:

{
  "recommended": "<Most suitable SDLC methodology>",
  "reasoning": "<A detailed explanation of why this model is the best fit, tied directly to project attributes>",
  "alternatives": [
    {
      "name": "<Alternative methodology name>",
      "suitabilityScore": <0-100>,
      "pros": ["<List of advantages>"],
      "cons": ["<List of disadvantages>"],
      "additionalConsiderations": "<Optional insights, e.g., when this might still work well>"
    }
    ...
  ]
}

---

### Output Guidelines:

- Use professional and analytical language.
- Justify the recommendation with **evidence-based reasoning** tied to the project attributes.
- Each alternative should be **compared comparatively** with the recommended choice.
- Avoid vague or generic pros/cons—make them relevant to the project specifics.
- Keep the JSON clean, readable, and valid.

---
Generate a decision as if it will directly influence a product development roadmap. Be strategic, specific, and aligned with modern engineering practices.
`;

    try {
      const response = await generateAiResponse([{ role: "user", content: prompt }]);
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI SDLC analysis failed:", error);
      return this.fallbackSDLCRecommendation(projectData);
    }
  }

  async analyzeCodeStructure(structure: ProjectStructure): Promise<{
    qualityScore: number
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    maintainabilityIndex: number
  }> {
    const prompt = `You are a senior software engineer and code quality auditor.

Analyze the following codebase metadata and provide a comprehensive, insight-rich evaluation of the project's structure, maintainability, and quality.

### Codebase Overview:
- **Total Files**: ${structure.totalFiles}
- **Total Lines of Code**: ${structure.totalLines}
- **Languages Used**: ${JSON.stringify(structure.languages)}
- **Test Coverage**: ${structure.testCoverage}%
- **Average Cyclomatic Complexity**: ${structure.complexity.average}
- **Architecture Pattern**: ${structure.patterns.architecture}
- **Frameworks Detected**: ${structure.patterns.framework.join(", ")}
- **Reported Issues**: ${structure.issues.length}

---

### Instructions:

Based on the data, perform a critical codebase analysis and return a structured assessment. Your response should include:

- **Code health and architectural strengths**
- **Technical debt, complexity hotspots, and risk areas**
- **Suggestions for maintainability, readability, and performance improvements**
- **Evaluation of the project’s testability and scalability**

---

### Response Format:

Respond with **ONLY valid JSON**, using the following structure:

{
  "qualityScore": <number 0-100>,  // A holistic score for code quality
  "strengths": ["<Clear, non-generic strengths observed from the data>"],
  "weaknesses": ["<Specific weaknesses and limitations>"],
  "recommendations": ["<Actionable steps to improve code quality and maintainability>"],
  "maintainabilityIndex": <number 0-100> // Based on structure, complexity, and test coverage
}

---

### Guidelines:
- Provide analysis grounded in best software engineering practices.
- Tailor your insights to the **languages**, **frameworks**, **complexity**, and **architecture** observed.
- Use critical reasoning to balance strengths and weaknesses.
- Do NOT include explanations or markdown—return the JSON only.

---
Generate your JSON evaluation as if it will be reviewed by a technical lead conducting a code review across teams. Prioritize clarity, accuracy, and actionability.
`;

    try {
      const response = await generateAiResponse([{ role: "user", content: prompt }]);
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI structure analysis failed:", error);
      return this.fallbackStructureAnalysis(structure);
    }
  }


  async generateTestCasesFromStructure(
    structure: ProjectStructure,
    language: string,
    repositoryName: string
  ): Promise<{
    testCases: Array<{
      name: string
      description: string
      code: string
      type: "unit" | "integration" | "e2e"
      priority: "high" | "medium" | "low"
      file: string
    }>
    coverage: number
    framework: string
    summary: string
  }> {
    const codeFiles = structure.files.filter(file => 
      file.content && file.content.trim().length > 10 && this.isCodeFile(file.path)
    );

    if (codeFiles.length === 0) {
      return this.fallbackTestGenerationFromStructure(language, repositoryName);
    }

    const maxFiles = 5;
    const maxFileContentLength = 2000;
    const selectedFiles = codeFiles.slice(0, maxFiles).map(f => ({
      path: f.path,
      content: f.content.length > maxFileContentLength ? 
        f.content.substring(0, maxFileContentLength) + '\n...(truncated)' : 
        f.content
    }));

    let aggregatedContent = `Repository: ${repositoryName}\nLanguage: ${language}\nTotal Files: ${structure.totalFiles}\nTotal Lines: ${structure.totalLines}\n\n`;
    for (const file of selectedFiles) {
      aggregatedContent += `\n=== FILE: ${file.path} ===\n\n${file.content}\n\n=== END FILE ===\n`;
    }

    const prompt = `You are a senior QA automation engineer and test strategist.

Analyze the following ${language} repository and generate a comprehensive set of test cases that ensures high confidence in code correctness, reliability, and robustness.

### Repository Content (Partial Overview):
${aggregatedContent}

---

### Your Objectives:

Generate a rich suite of test cases that addresses all relevant layers of the codebase. Ensure the following are covered:

✅ **Unit tests** – for individual functions and methods  
🔗 **Integration tests** – for components/modules interacting together  
⚠️ **Edge cases** – unexpected inputs, null values, overflows  
❌ **Error conditions** – failed operations, exceptions, fallback logic  
📊 **Business logic validation** – according to expected functional behavior

---

### Output Format:

Respond with **ONLY valid JSON** using this structure:

{
  "testCases": [
    {
      "name": "Test case name",
      "description": "Test case description",
      "code": "Test code implementation",
      "type": "unit|integration|e2e",
      "priority": "high|medium|low",
      "file": "Source file being tested"
    }
  ],
  "coverage": <estimated coverage percentage 0-100>,
  "framework": "Testing framework name",
  "summary": "Summary of test strategy and coverage"
}

---

### Guidelines:

- Tailor test syntax and assertions to best practices in the ${language} ecosystem (e.g., Jest, PyTest, Mocha, JUnit, etc.)
- Ensure test names are concise, descriptive, and follow standard conventions.
- Focus on both **critical-path logic** and **less obvious failure conditions**.
- Include proper setup/teardown or mocking where needed.
- Use real function/class names when possible and simulate realistic inputs/outputs.

---

### Notes:

- Do not include markdown formatting or explanatory text—**return only the JSON**.
- Prioritize code quality, readability, and maintainability of test cases.
- Estimate the coverage based on the logic branches inferred from the content.

---
Treat this as a test plan for a production-grade CI/CD pipeline. Be thorough, precise, and pragmatic.
`;
    try {
      const response = await generateAiResponse([{ role: "user", content: prompt }], { maxTokens: 4096 });
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI test generation from structure failed:", error);
      return this.fallbackTestGenerationFromStructure(language, repositoryName);
    }
  }

  async generateComprehensiveDocumentation(
    parsedData: ProjectStructure,
    language: string,
    repositoryName: string
  ) {
    const files = parsedData.files.map(file => ({
      path: file.path,
      content: file.content
    }));

    const validFiles = files.filter(f => f.content && f.content.trim().length > 10);
    if (validFiles.length === 0) {
      return this.fallbackComprehensiveDocumentationFromFiles([], language, repositoryName);
    }

    const maxFiles = 6;
    const maxFileContentLength = 2000;
    const selectedFiles = validFiles.slice(0, maxFiles).map(f => ({
      path: f.path,
      content: f.content.length > maxFileContentLength ? 
        f.content.substring(0, maxFileContentLength) + '\n...(truncated)' : 
        f.content
    }));

    let aggregatedContent = `Repository: ${repositoryName}\nLanguage: ${language}\n\n`;
    for (const file of selectedFiles) {
      aggregatedContent += `\n=== FILE: ${file.path} ===\n\n${file.content}\n\n=== END FILE ===\n`;
    }

    const prompt = `You are a senior software architect and documentation expert.

Your task is to analyze the following ${language} codebase and generate a complete Software Design Document (SDD)-level technical documentation report. This documentation will reflect the **real structure, logic, architecture, components, and workflows** present in the repository.

It must be suitable for engineers, architects, QA analysts, and DevOps teams to deeply understand the project design, internals, and implementation details.

---

### Project Details:
- **Repository**: ${repositoryName}
- **Files Analyzed**: ${selectedFiles.map(f => f.path).join(', ')}

\`\`\`${language}
${aggregatedContent}
\`\`\`

---

### Instructions:

Generate **only valid JSON** in the exact structure below. Every section should be grounded in what is observed in the actual codebase, including component-level specifics, key algorithms, architecture, and development processes.

---

### Expected JSON Structure:

{
  "summary": "Brief overview of the project",
  "architecture": {
    "pattern": "Architecture pattern name (e.g., MVC, Component-based, Microservices)",
    "description": "Detailed explanation of the chosen architecture and rationale",
    "technologies": ["tech1", "tech2", "tech3"],
    "layers": [
      {
        "name": "Layer name (e.g., Presentation, Service, Data Access)",
        "description": "Role and responsibility of the layer",
        "components": ["component1", "component2"]
      }
    ]
  },
  "folderStructure": {
    "tree": "ASCII tree representation of key project folders and files",
    "directories": [
      {
        "path": "folder/path",
        "type": "source|config|docs|tests",
        "purpose": "Functional purpose of the folder",
        "description": "What files exist here and why",
        "fileCount": 5
      }
    ]
  },
  "codeInternals": {
    "codeFlow": "Describe the logical flow of control across modules/functions",
    "dataFlow": "Describe how data moves and transforms across layers",
    "keyAlgorithms": [
      {
        "name": "Algorithm name",
        "description": "Core logic of the algorithm",
        "file": "file/path",
        "complexity": "Time complexity, e.g., O(n)",
        "implementation": "Brief code-based explanation of how it's written"
      }
    ],
    "designPatterns": [
      {
        "pattern": "Design pattern name (e.g., Singleton, Factory)",
        "usage": "How and where it's used in the project",
        "files": ["file1", "file2"],
        "description": "Why this pattern was chosen"
      }
    ],
    "businessLogic": [
      {
        "module": "Module or service name",
        "purpose": "What this module is responsible for",
        "workflow": "Explain how it works step by step",
        "files": ["file1", "file2"]
      }
    ]
  },
  "components": [
    {
      "name": "Component name",
      "type": "Component|Service|Utility",
      "file": "file/path",
      "description": "Functionality and scope of this component",
      "dependencies": ["dep1", "dep2"],
      "exports": ["export1", "export2"],
      "internals": {
        "purpose": "Primary function of the component",
        "keyMethods": ["method1", "method2"],
        "stateManagement": "How local or global state is handled",
        "lifecycle": "Lifecycle details (e.g., mount, destroy, request flow)"
      }
    }
  ],
  "apis": [
    {
      "endpoint": "/api/path",
      "method": "GET|POST|PUT|DELETE",
      "description": "Functionality provided by this endpoint",
      "parameters": [
        {
          "name": "Parameter name",
          "type": "string|number|object",
          "description": "What the parameter represents"
        }
      ],
      "response": "Typical output or structure of the response",
      "internals": {
        "implementation": "Explain how the logic is implemented in code",
        "validation": "Describe how request data is validated",
        "errorHandling": "How errors are caught and returned",
        "authentication": "Does this endpoint require auth? If yes, how?"
      }
    }
  ],
  "functions": [
    {
      "name": "Function or method name",
      "file": "file/path",
      "type": "function|method|constructor",
      "description": "What this function does",
      "parameters": [
        {
          "name": "Parameter name",
          "type": "type",
          "description": "What it represents"
        }
      ],
      "returns": {
        "type": "return type",
        "description": "Value or structure returned"
      },
      "internals": {
        "algorithm": "If any known algorithm or custom logic used",
        "complexity": "Time/space complexity if applicable",
        "sideEffects": "Mutations, external calls, I/O etc.",
        "dependencies": ["dependency1", "dependency2"]
      }
    }
  ],
  "dataModels": [
    {
      "name": "Model name (e.g., User, Product)",
      "type": "Interface|Class|Type",
      "file": "file/path",
      "properties": [
        {
          "name": "Property name",
          "type": "string|number|boolean|object",
          "description": "Purpose or usage of the property"
        }
      ],
      "relationships": [
        {
          "model": "Related model name",
          "type": "one-to-one|one-to-many|many-to-many",
          "description": "How this relationship works"
        }
      ],
      "validation": ["Validation rule 1", "Validation rule 2"]
    }
  ],
  "examples": [
    {
      "title": "Title for the example",
      "description": "What this example demonstrates",
      "code": "A working code example",
      "explanation": "How it helps the reader understand the system"
    }
  ],
  "mermaidDiagram": "Mermaid syntax diagram to represent system flow, architecture, or sequence",
  "sdlc": {
    "developmentWorkflow": "Overall engineering workflow (e.g., Git flow, branching model, CI)",
    "setupInstructions": [
      {
        "step": 1,
        "title": "Setup step title",
        "description": "What this step achieves",
        "commands": ["command1", "command2"]
      }
    ],
    "buildProcess": {
      "description": "How the system is built from source to production",
      "steps": ["Build step 1", "Build step 2"],
      "tools": ["Webpack", "Docker", "CI Tools"]
    },
    "testingStrategy": {
      "approach": "Testing philosophy or TDD/BDD approach",
      "testTypes": ["unit", "integration", "e2e"],
      "coverage": "Expected or current test coverage target (e.g., >80%)",
      "frameworks": ["Jest", "Mocha", "Cypress", etc.]
    }
  }
}

---

### Constraints:
- Base your analysis on actual file content only.
- Return **strictly valid JSON**—no markdown, comments, or extra explanations.
- Ensure each field is specific, structured, and derived from real code structure and logic.
- Be precise and helpful, as this document will be used to onboard developers and for architectural reviews.

---
Treat this like a software design handover for a real engineering team. Be clear, detailed, and accurate.
`;

    try {
      console.log("🚀 Generating comprehensive documentation for:", repositoryName);
      console.log("📁 Files being analyzed:", selectedFiles.map(f => f.path));
      console.log("📝 Prompt length:", prompt.length);
      
      const response = await generateAiResponse([{ role: "user", content: prompt }], { maxTokens: 8192 });
      console.log("✅ AI response received, length:", response.length);
      console.log("🔄 Parsing AI response...");
      
      const parsed = parseAiJsonResponse(response);
      console.log("✅ Documentation generated successfully!");
      console.log("📊 Generated data summary:", {
        hasArchitecture: !!parsed.architecture,
        hasTechnologies: !!parsed.architecture?.technologies?.length,
        componentsCount: parsed.components?.length || 0,
        apisCount: parsed.apis?.length || 0,
        functionsCount: parsed.functions?.length || 0
      });
      
      return parsed;
    } catch (error) {
      console.error("❌ AI comprehensive documentation generation failed:", error);
      console.log("🔄 Using fallback documentation...");
      return this.fallbackComprehensiveDocumentationFromFiles(selectedFiles, language, repositoryName);
    }
  }

  async generateSDDReadme(project: SDDProjectInput): Promise<string> {
    const prompt = `
You are a professional-grade software architect and technical writer.

Your task is to generate a complete, structured, GitHub-ready README document that doubles as a Software Design Document (SDD), fully aligned with IEEE 1016 Software Design Description standards. This document will serve as both technical documentation and onboarding material for developers, managers, and stakeholders.

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

### 📄 YOUR OUTPUT FORMAT:

Produce a **Markdown-formatted README** structured with the following main sections:

---

### 1. Introduction
- **Purpose**: Briefly explain the purpose of the SDD.
- **Scope**: Describe what the software will do, including goals and boundaries.
- **Overview**: Provide a summary of the document structure and how it’s organized.
- **References**: Cite any relevant standards, APIs, libraries, or whitepapers.
- **Definitions**: Include key definitions, acronyms, or domain-specific terms.

---

### 2. System Overview
- Provide a high-level summary of the system’s functionality, purpose, user roles, and major goals.

---

### 3. System Architecture
- Clearly decompose the system into modules or services.
- Use **Mermaid.js diagrams** such as:
  - System block diagrams
  - Component interaction diagrams
  - Data Flow Diagrams (DFD) or Sequence Diagrams
- Provide rationale for architectural decisions, including scalability, maintainability, and security considerations.

---

### 4. Data Design
- Describe the overall data structure, storage model, and flow.
- Include a **data dictionary** listing major entities, fields, types, and descriptions.

---

### 5. Component Design
- For each major component, write:
  - Its responsibility
  - Input/output interface
  - Logic in **PDL (Program Design Language)** or **pseudocode**

---

### 6. Human Interface Design
- Describe user interactions and key screen flows.
- Provide a **descriptive UI layout** or **wireframe mockups** (as Mermaid or textual explanation).
- Mention accessibility or multilingual features if applicable.

---

### 7. Requirements Matrix
- Build a matrix/table mapping:
  - Functional/Non-functional Requirements ⟶ Features ⟶ Components
  - Reference requirement IDs if available

---

### 8. Appendices
- Include:
  - Links to external documents (e.g., API specs, Figma, Postman)
  - Additional diagrams
  - Installation or environment setup notes
  - External APIs or third-party services used

---

### 🔄 Ensure the output:
- Uses clear, developer-friendly Markdown
- Includes **context-aware diagrams** using Mermaid where applicable
- Is **readable, complete, and tailored** to the project complexity and scope
- Is suitable for use in real-world GitHub repositories or SRS/SDD handovers

---

Generate this entire document based on the provided fields. Adapt the tone for technical clarity and completeness.
`;
    try {
      const response = await generateAiResponse([{ role: "user", content: prompt }], { maxTokens: 8192 });
      // This is a Markdown document, so just return as string
      return response.trim();
    } catch (error) {
      console.error("AI SDD/README generation failed:", error);
      throw new Error("Could not generate SDD/README from AI.");
    }
  }

  private fallbackSDLCRecommendation(projectData: ProjectData) {
    const complexity = projectData.complexity.toLowerCase();
    const teamSize = parseInt(projectData.teamSize) || 1;
    
    let recommended = "Agile";
    if (complexity.includes("high") && teamSize > 10) {
      recommended = "Scrum";
    } else if (complexity.includes("low") && teamSize < 5) {
      recommended = "Kanban";
    }

    return {
      recommended,
      reasoning: `Based on ${projectData.complexity} complexity and ${projectData.teamSize} team size, ${recommended} methodology is recommended.`,
      alternatives: [
        {
          model: "Waterfall",
          suitability: 60,
          pros: ["Clear phases", "Well-documented"],
          cons: ["Less flexible", "Late feedback"]
        },
        {
          model: "DevOps",
          suitability: 75,
          pros: ["Continuous delivery", "Automation"],
          cons: ["Complex setup", "Cultural change required"]
        }
      ]
    };
  }

  private fallbackStructureAnalysis(structure: ProjectStructure) {
    const score = Math.max(30, Math.min(90, 
      (structure.testCoverage * 0.3) + 
      (Math.min(structure.complexity.average, 10) * 5) + 
      (structure.totalFiles > 0 ? 20 : 0)
    ));

    return {
      qualityScore: Math.round(score),
      strengths: [
        `Project contains ${structure.totalFiles} files with ${structure.totalLines} lines of code`,
        `Test coverage at ${structure.testCoverage}%`,
        `Uses ${structure.patterns.framework.join(", ")} framework`
      ],
      weaknesses: [
        structure.testCoverage < 80 ? "Test coverage could be improved" : "",
        structure.complexity.average > 5 ? "Code complexity is above average" : "",
        structure.issues.length > 0 ? `${structure.issues.length} issues detected` : ""
      ].filter(Boolean),
      recommendations: [
        "Increase test coverage for better reliability",
        "Consider refactoring complex functions",
        "Add more documentation for maintainability"
      ],
      maintainabilityIndex: Math.round(score * 0.8)
    };
  }

  private fallbackTestGeneration(language: string) {
    const frameworks = {
      javascript: 'Jest',
      typescript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      csharp: 'NUnit',
      go: 'testing',
      rust: 'cargo test'
    };

    const framework = frameworks[language.toLowerCase() as keyof typeof frameworks] || 'Jest';

    return {
      testCases: [
        {
          name: "Basic Functionality Test",
          description: `Basic test for ${language} file (AI unavailable)`,
          code: `// ${framework} test template\n// Add your test implementation here`,
          type: "unit" as const,
          priority: "medium" as const
        },
        {
          name: "Error Handling Test",
          description: "Test error conditions and edge cases",
          code: `// Test error scenarios\n// Verify proper error handling`,
          type: "unit" as const,
          priority: "high" as const
        }
      ],
      coverage: 75,
      framework
    };
  }

  private fallbackTestGenerationFromStructure(language: string, repositoryName: string) {
    const frameworks = {
      javascript: 'Jest',
      typescript: 'Jest',
      python: 'pytest',
      java: 'JUnit',
      csharp: 'NUnit',
      go: 'testing',
      rust: 'cargo test'
    };

    const framework = frameworks[language.toLowerCase() as keyof typeof frameworks] || 'Jest';

    return {
      testCases: [
        {
          name: "Repository Integration Test",
          description: `Integration test for ${repositoryName} (AI unavailable)`,
          code: `// ${framework} integration test template\n// Test main application flow`,
          type: "integration" as const,
          priority: "high" as const,
          file: "main application file"
        },
        {
          name: "Core Functionality Unit Test",
          description: "Unit test for core functionality",
          code: `// ${framework} unit test template\n// Test individual components`,
          type: "unit" as const,
          priority: "medium" as const,
          file: "core component files"
        }
      ],
      coverage: 70,
      framework,
      summary: `Basic test strategy for ${repositoryName} using ${framework}. AI-powered analysis unavailable.`
    };
  }

  private fallbackDocumentationGeneration(filePath: string, language: string) {
    return {
      summary: `${language} file located at ${filePath}. AI-powered analysis is currently unavailable, but this file appears to be part of the application's core functionality.`,
      functions: [
        {
          name: "main",
          description: "Main function (inferred from file structure)",
          parameters: [],
          returns: {
            type: "void",
            description: "No return value"
          }
        }
      ],
      examples: [
        `// Example usage of ${filePath}\n// Please refer to the actual file for implementation details`
      ]
    };
  }

  private fallbackComprehensiveDocumentationFromFiles(
    files: Array<{ path: string; content: string }>,
    language: string,
    repositoryName: string
  ) {
    const fileList = files.length > 0 ? files.map(f => f.path).join(', ') : 'No files available';

    return {
      summary: `${repositoryName} is a ${language} application. AI-powered analysis is currently unavailable, but the codebase includes the following files: ${fileList}`,
      architecture: {
        pattern: 'Component-based Architecture',
        description: `The application follows a ${language} component-based architecture with clear separation of concerns.`,
        technologies: [language, 'Modern Development Stack'],
        layers: [
          {
            name: 'Presentation Layer',
            description: 'User interface and presentation logic',
            components: files.filter(f => f.path.includes('component')).map(f => f.path)
          },
          {
            name: 'Business Logic Layer', 
            description: 'Core application logic and business rules',
            components: files.filter(f => f.path.includes('service') || f.path.includes('lib')).map(f => f.path)
          },
          {
            name: 'Data Layer',
            description: 'Data access and management',
            components: files.filter(f => f.path.includes('model') || f.path.includes('interface')).map(f => f.path)
          }
        ]
      },
      folderStructure: {
        tree: createFolderStructureTree(files, repositoryName),
        directories: [
          {
            path: 'src/',
            purpose: 'Main source code directory',
            type: 'source' as const,
            fileCount: files.filter(f => f.path.startsWith('src/')).length,
            description: 'Contains the main application source code including components, services, and utilities'
          }
        ]
      },
      codeInternals: {
        codeFlow: `The application follows a standard ${language} execution flow with initialization, main processing, and cleanup phases.`,
        keyAlgorithms: [
          {
            name: 'Standard Processing',
            description: 'Basic application processing logic',
            file: 'main application file',
            complexity: 'O(n)',
            implementation: 'Standard implementation patterns'
          }
        ],
        designPatterns: [
          {
            pattern: 'Module Pattern',
            usage: 'Used for organizing code into reusable modules',
            files: files.map(f => f.path),
            description: 'Better code organization and maintainability'
          }
        ],
        dataFlow: 'Data flows from input through processing layers to output with validation at each stage',
        businessLogic: [
          {
            module: 'Core Application',
            purpose: 'Main application functionality',
            workflow: 'Standard processing workflow',
            files: files.map(f => f.path)
          }
        ]
      },
      sdlc: {
        developmentWorkflow: 'Standard development workflow with version control, code review, and continuous integration',
        setupInstructions: [
          {
            step: 1,
            title: 'Clone Repository',
            description: 'Clone the repository to your local machine',
            commands: ['git clone <repository-url>']
          },
          {
            step: 2,
            title: 'Install Dependencies',
            description: 'Install project dependencies',
            commands: ['npm install', 'yarn install']
          }
        ],
        buildProcess: {
          description: `Standard ${language} build process`,
          steps: ['Install dependencies', 'Run build command', 'Generate output'],
          tools: ['Package manager', 'Build tools', 'Bundler']
        },
        testingStrategy: {
          approach: 'Unit testing with integration tests',
          testTypes: ['unit', 'integration', 'e2e'],
          coverage: 'Target 80%+ code coverage',
          frameworks: ['Standard testing framework']
        },
        deploymentGuide: {
          process: 'Automated deployment through CI/CD pipeline',
          environments: ['development', 'staging', 'production'],
          steps: [
            {
              environment: 'development',
              steps: ['Build application', 'Run tests', 'Deploy to dev environment']
            }
          ]
        },
        maintenance: {
          guidelines: ['Regular code reviews', 'Keep dependencies updated', 'Monitor performance'],
          monitoring: ['Application logs', 'Performance metrics', 'Error tracking'],
          troubleshooting: [
            {
              issue: 'Application not starting',
              solution: 'Check logs for errors and verify environment configuration'
            }
          ]
        }
      },
      components: files.map(f => ({
        name: f.path.split('/').pop() || f.path,
        type: f.path.includes('component') ? 'Component' : 'File',
        file: f.path,
        description: 'Component/file in the codebase',
        dependencies: [] as string[],
        exports: [] as string[],
        internals: {
          purpose: 'Core application functionality',
          keyMethods: ['main', 'init', 'process'],
          stateManagement: 'Local state management',
          lifecycle: 'Standard lifecycle'
        }
      })),
      apis: [
        {
          endpoint: '/api/health',
          method: 'GET',
          description: 'Health check endpoint',
          parameters: [],
          response: '{ "status": "ok" }',
          internals: {
            implementation: 'Health controller',
            validation: 'Basic validation',
            errorHandling: 'Standard error handling',
            authentication: 'No authentication required'
          }
        }
      ],
      functions: [
        {
          name: 'main',
          file: 'main application file',
          type: 'function',
          description: 'Main application entry point',
          parameters: [],
          returns: {
            type: 'void',
            description: 'No return value'
          },
          internals: {
            algorithm: 'Simple initialization and startup',
            complexity: 'O(1)',
            sideEffects: 'None',
            dependencies: []
          }
        }
      ],
      dataModels: [
        {
          name: 'ApplicationConfig',
          type: 'Interface',
          file: 'config file',
          properties: [
            {
              name: 'environment',
              type: 'string',
              description: 'Application environment'
            }
          ],
          relationships: [],
          validation: ['Required field validation']
        }
      ],
      mermaidDiagram: 'graph TD\nA[User] --> B[' + repositoryName + ' Application]\nB --> C[Business Logic]\nC --> D[Data Layer]',
      examples: [
        {
          title: 'Basic Usage',
          description: 'How to use the main application',
          code: `// Example usage\n// Initialize application\n// Process data\n// Return results`,
          explanation: 'This shows the basic application flow'
        }
      ]
    };
  }

  private isCodeFile(filePath: string): boolean {
    if (!filePath) return false;

    const excludedExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.webp',
      '.mp4', '.avi', '.mov', '.wmv', '.mp3', '.wav', '.pdf', '.doc',
      '.zip', '.rar', '.7z', '.tar', '.gz', '.ttf', '.otf', '.woff',
      '.exe', '.dll', '.so', '.db', '.sqlite', '.log', '.tmp', '.lock', '.map'
    ];

    const excludedDirectories = [
      'node_modules/', 'dist/', 'build/', 'target/', 'bin/', 'obj/',
      '.git/', '.vscode/', '.idea/', '__pycache__/', 'coverage/',
      'vendor/', 'assets/images/', 'static/images/', 'images/', 'img/'
    ];

    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.html', '.css',
      '.scss', '.sass', '.py', '.java', '.c', '.cpp', '.cs', '.php',
      '.rb', '.go', '.rs', '.kt', '.swift', '.sh', '.json', '.yaml',
      '.yml', '.xml', '.md', '.txt'
    ];

    const lowerPath = filePath.toLowerCase();

    for (const dir of excludedDirectories) {
      if (lowerPath.includes(dir)) return false;
    }
    for (const ext of excludedExtensions) {
      if (lowerPath.endsWith(ext)) return false;
    }

    for (const ext of codeExtensions) {
      if (lowerPath.endsWith(ext)) return true;
    }

    return false;
  }
}

// Utility function to create a properly formatted folder structure tree
function createFolderStructureTree(files: Array<{ path: string; content: string }>, repositoryName: string): string {
  if (!files || files.length === 0) {
    return `${repositoryName}/\n└── (empty)`;
  }

  // Group files by directory
  const structure: Record<string, string[]> = {};
  const directories = new Set<string>();

  files.forEach(file => {
    const parts = file.path.split('/');
    let currentPath = '';
    
    // Add all directory levels
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      directories.add(currentPath);
    }
    
    // Add file to its directory
    const dir = parts.slice(0, -1).join('/') || '.';
    const fileName = parts[parts.length - 1];
    
    if (!structure[dir]) {
      structure[dir] = [];
    }
    structure[dir].push(fileName);
  });

  // Sort directories and files
  const sortedDirs = Array.from(directories).sort();
  Object.keys(structure).forEach(dir => {
    structure[dir].sort();
  });

  // Build tree string
  let tree = `${repositoryName}/\n`;
  const allPaths = [...sortedDirs, ...Object.keys(structure).filter(dir => dir !== '.')];
  const uniquePaths = [...new Set(allPaths)].sort();

  // Add root files first
  if (structure['.']) {
    structure['.'].forEach((file, index) => {
      const isLast = index === structure['.'].length - 1 && uniquePaths.length === 0;
      tree += `${isLast ? '└── ' : '├── '}${file}\n`;
    });
  }

  // Add directories and their contents
  uniquePaths.forEach((path, pathIndex) => {
    if (path === '.') return;
    
    const isLastPath = pathIndex === uniquePaths.length - 1;
    const depth = path.split('/').length;
    const indent = '│   '.repeat(depth - 1);
    const connector = isLastPath ? '└── ' : '├── ';
    const dirName = path.split('/').pop();
    
    tree += `${indent}${connector}${dirName}/\n`;
    
    // Add files in this directory
    if (structure[path]) {
      structure[path].forEach((file, fileIndex) => {
        const isLastFile = fileIndex === structure[path].length - 1;
        const fileIndent = isLastPath ? '    '.repeat(depth) : '│   '.repeat(depth);
        const fileConnector = isLastFile ? '└── ' : '├── ';
        tree += `${fileIndent}${fileConnector}${file}\n`;
      });
    }
  });

  return tree.trim();
}
