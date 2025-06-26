import type {
  AiMessage,
  AiResponseOptions,
  ProjectData,
  SDDProjectInput,
} from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface";

// ✅ Wrap response parsing in a reusable function
export function parseAiJsonResponse(aiText: string): any {
  try {
    console.log("🔍 Parsing AI response of length:", aiText.length);

    let sanitized = aiText.trim();

    console.log("🔍 Raw AI response preview:", sanitized.substring(0, 200));

    // Remove code fences if present
    if (sanitized.startsWith("```json")) {
      sanitized = sanitized.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    }
    if (sanitized.startsWith("```")) {
      sanitized = sanitized.replace(/^```/, "").trim();
    }
    if (sanitized.endsWith("```")) {
      sanitized = sanitized.slice(0, -3).trim();
    }

    // Handle case where response is wrapped in extra text or explanations
    const jsonStart = sanitized.indexOf("{");
    const jsonEnd = sanitized.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      sanitized = sanitized.substring(jsonStart, jsonEnd + 1);
    }

    // Fix common JSON formatting issues from AI responses
    sanitized = sanitized
      // Fix trailing commas
      .replace(/,(\s*[}\]])/g, "$1")
      // Fix multiple spaces
      .replace(/\s{2,}/g, " ")
      // Fix unescaped quotes in strings (basic fix)
      .replace(/\\"/g, '"')
      // Remove newline escapes that break JSON
      .replace(/\\n/g, "")
      .replace(/\\r/g, "")
      // Remove any BOM or hidden characters
      .replace(/^\uFEFF/, "")
      .replace(/^"+|"+$/g, "")
      .trim();

    console.log("🔧 Cleaned AI response preview:", sanitized.substring(0, 200));

    // Try parsing with error recovery
    try {
      return JSON.parse(sanitized);
    } catch (firstError) {
      console.warn("First JSON parse attempt failed, trying recovery...");

      // Try to fix common issues
      let recovered = sanitized
        // Fix single quotes to double quotes (but be careful not to break escaped quotes)
        .replace(/(?<!\\)'/g, '"')
        // Fix missing quotes around object keys
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
        // Fix trailing commas more aggressively
        .replace(/,\s*([}\]])/g, "$1")
        // Fix double commas
        .replace(/,,+/g, ",");

      console.log("🔧 Recovery attempt preview:", recovered.substring(0, 200));
      return JSON.parse(recovered);
    }
  } catch (err) {
    console.error("❌ Failed to parse AI JSON response:", err);
    console.log("🔎 Full raw AI response length:", aiText.length);
    console.log(
      "🔎 Raw AI response (first 500 chars):\n",
      aiText.substring(0, 500)
    );
    console.log(
      "🔎 Raw AI response (last 200 chars):\n",
      aiText.substring(Math.max(0, aiText.length - 200))
    );

    // Try to extract just the main content if it's not properly formatted JSON
    try {
      // Look for key-value patterns and try to construct a basic object
      const summary =
        aiText.match(/"summary":\s*"([^"]+)"/)?.[1] ||
        "Analysis failed - invalid JSON response";
      console.log("🔄 Attempting basic object recovery with summary:", summary);

      return {
        summary,
        architecture: {
          pattern: "Unknown",
          description: "Failed to parse AI response",
          technologies: [],
          layers: [],
        },
        folderStructure: {
          tree: "Failed to generate",
          directories: [],
        },
        components: [],
        apis: [],
        functions: [],
        dataModels: [],
        examples: [],
        mermaidDiagram:
          "flowchart TD\nA[Error] --> B[Failed to parse AI response]",
        error: "AI response parsing failed, using minimal fallback",
        rawResponse: aiText.substring(0, 1000), // Truncate for debugging
      };
    } catch (recoveryError) {
      console.error("❌ Recovery attempt also failed:", recoveryError);
      throw new Error("Could not parse AI response as valid JSON.");
    }
  }
}
const DEFAULT_OPTIONS: AiResponseOptions = {
  model: "rekaai/reka-flash-3:free",
  systemPrompt:
    "You are a senior software development consultant, codebase auditor, and technical architect with expertise in modern software engineering practices and industry standards.\n\n" +
    "Your role is to thoroughly analyze code repositories and provide high-value, context-aware insights and recommendations across six key areas:\n\n" +
    "1. **Code Structure & Architecture Analysis**\n" +
    "- Identify architectural patterns including Layered (N-tier), MVC/MVP/MVVM, microservices, event-driven, hexagonal, and clean architecture[1][2][4]\n" +
    "- Evaluate separation of concerns, cohesion, coupling, and SOLID principles adherence[6][17]\n" +
    "- Assess scalability, maintainability, and extensibility characteristics[1][4]\n" +
    "- Analyze component interactions, data flow patterns, and dependency management[6][17]\n" +
    "- Highlight architectural decisions, trade-offs, and technical debt implications[17][23]\n\n" +
    "2. **SDLC Methodology Recommendation**\n" +
    "- Recommend optimal Software Development Life Cycle model from: Agile, Scrum, Kanban, Waterfall, DevOps, Lean, Spiral, V-Model[9][10][11]\n" +
    "- Apply evidence-based selection criteria: team size (3-7 optimal for Agile frameworks), project complexity, requirements stability, risk tolerance, timeline constraints, and stakeholder involvement[12][13][14]\n" +
    "- Consider hybrid approaches when pure methodologies don't fully address project needs[14][16]\n" +
    "- Justify recommendations with specific project attributes and methodology strengths alignment[12][13]\n\n" +
    "3. **Code Quality Assessment**\n" +
    "- Evaluate using industry-standard metrics: cyclomatic complexity, code coverage, maintainability index, coupling/cohesion ratios, and Halstead metrics[17][18][19][21][24]\n" +
    "- Identify code smells including duplicated code, long methods, large classes, complex conditionals, and inappropriate intimacy[22][42][46]\n" +
    "- Assess technical debt using metrics like defect ratio, code churn, technical debt ratio, and time to market impact[23]\n" +
    "- Evaluate adherence to language-specific best practices and framework conventions[17][18]\n" +
    "- Analyze readability, testability, reusability, and security considerations[18][20]\n\n" +
    "4. **Test Coverage & Test Case Generation**\n" +
    "- Apply testing pyramid principles with appropriate unit (70%), integration (20%), and e2e (10%) test distribution[30][31]\n" +
    "- Generate comprehensive test cases following industry best practices: clear objectives, risk-based prioritization, and 80/20 rule application[25][26][28]\n" +
    "- Cover positive scenarios, negative testing, boundary value analysis, and edge cases[25][29][32]\n" +
    "- Include proper test data management, mock object strategies, and test isolation patterns[25][30]\n" +
    "- Recommend appropriate testing frameworks based on technology stack (Jest, pytest, JUnit, Cypress, Selenium)[31]\n" +
    "- Prioritize test types based on risk assessment and business critical functionality[26][32]\n\n" +
    "5. **Documentation Generation**\n" +
    "- Produce IEEE 1016-compliant Software Design Document (SDD) level documentation[38][41]\n" +
    "- Include system architecture, component design, data design, interface specifications, and operational scenarios[33][35][36]\n" +
    "- Document folder structure, API endpoints, key algorithms, and data flow patterns[35][37]\n" +
    "- Create accurate Mermaid diagrams using proper syntax: flowchart TD/LR for processes, sequenceDiagram for interactions, graph for dependencies, and architecture diagrams for system structure[39]\n" +
    "- CRITICAL: Ensure Mermaid diagrams follow exact syntax rules: start with diagram type (flowchart TD, graph LR, sequenceDiagram), use valid node IDs (alphanumeric only), proper arrow syntax (A --> B), and no special characters in node names\n" +
    "- CRITICAL: Ensure Mermaid diagrams follow exact syntax rules: start with diagram type (flowchart TD, graph LR, sequenceDiagram), use valid node IDs (alphanumeric only), proper arrow syntax (A --> B), and no special characters in node names\n" +
    "- Ensure documentation follows technical writing best practices: clarity, conciseness, consistent formatting, and audience-appropriate content[33][34][37]\n" +
    "- Include traceability matrices linking requirements to components and validation criteria[38]\n\n" +
    "6. **Refactoring Suggestions**\n" +
    "- Recommend evidence-based refactoring techniques: extract method/class, simplify conditionals, eliminate duplication, and improve naming conventions[42][44][46]\n" +
    "- Apply systematic refactoring approaches including Red-Green-Refactor, refactoring by abstraction, and preparatory refactoring[44][47]\n" +
    "- Prioritize changes based on impact assessment: readability improvement, performance optimization, maintainability enhancement, and complexity reduction[42][46][48]\n" +
    "- Ensure refactoring maintains backward compatibility and external behavior consistency[47][49]\n" +
    "- Recommend small, incremental changes with comprehensive test coverage before implementation[47][49]\n\n" +
    "Output Instructions:\n" +
    "- Provide practical, actionable recommendations with specific implementation guidance tailored to the codebase context\n" +
    "- Include quantitative assessments where applicable (complexity scores, coverage percentages, technical debt ratios)\n" +
    "- Maintain professional, concise communication focused on high-impact improvements\n" +
    "- Avoid explaining basic concepts; concentrate on advanced insights and strategic recommendations\n" +
    "- Structure responses as valid JSON with clear categorization and prioritization\n" +
    "- Include confidence levels and risk assessments for major recommendations\n\n" +
    "Context Awareness:\n" +
    "- Adapt analysis depth to project scale and team maturity level\n" +
    "- Consider technology stack limitations and framework-specific best practices\n" +
    "- Account for business domain requirements and regulatory compliance needs\n" +
    "- Integrate modern development practices including CI/CD, containerization, and cloud-native considerations\n\n" +
    "Treat each analysis as strategic input for engineering leadership making architectural decisions, resource allocation, and technical roadmap planning. Prioritize clarity, precision, evidence-based reasoning, and actionable outcomes.",
  temperature: 0.5,
  maxTokens: 8192,
};

export const generateAiResponse = async (
  messages: AiMessage[],
  options: Partial<AiResponseOptions> = {}
): Promise<string> => {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    if (
      messages.every((msg) => msg.role !== "system") &&
      mergedOptions.systemPrompt
    ) {
      messages = [
        { role: "system", content: mergedOptions.systemPrompt },
        ...messages,
      ];
    }

    console.log(
      "AI Request - Messages:",
      messages.map((m) => ({ role: m.role, contentLength: m.content.length }))
    );
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
      max_tokens: mergedOptions.maxTokens,
    };

    console.log("AI Request Body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "DevArc Assistant",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("AI Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Service Error Response:", errorText);
      throw new Error(
        `API error: ${response.status} ${response.statusText} - ${errorText}`
      );
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
  async generateSDLCRecommendation(projectData: ProjectData): Promise<{
    recommended: string;
    reasoning: string;
    phases: string[];
    alternatives: Array<{
      model: string;
      suitability: number;
      pros: string[];
      cons: string[];
    }>;
  }> {
    const prompt = `You are a senior software architect and SDLC strategist with expertise in modern software development practices and methodology selection.

Evaluate the project based on the following detailed input and recommend the **most suitable Software Development Life Cycle (SDLC) methodology**. Your analysis must be strategic, contextual, and based on evidence-driven selection criteria that consider project complexity, team dynamics, and organizational constraints.

### Project Overview:
- **Name**: ${projectData.name}
- **Description**: ${projectData.description}
- **Type**: ${projectData.type} (e.g., Web App, Mobile App, API, Enterprise System)
- **Team Size**: ${projectData.teamSize}
- **Timeline**: ${projectData.timeline}
- **Complexity Level**: ${projectData.complexity} (Low, Medium, High)
- **Key Features**: ${projectData.keyFeatures}
- **Risk Factors**: ${projectData.riskFactors}
- **Requirements**: ${projectData.requirements}
- **Additional Context**: ${projectData.additionalContext}

---

### Task:

Based on the provided project details, evaluate and select the **best-fit SDLC methodology** from the following options:
- **Agile**: Iterative development with continuous feedback and adaptation
- **Scrum**: Framework within Agile focusing on sprints and cross-functional teams
- **Kanban**: Visual workflow management with continuous delivery
- **Waterfall**: Sequential phases with comprehensive upfront planning
- **DevOps**: Integration of development and operations with continuous deployment
- **Lean**: Waste elimination and value stream optimization
- **Spiral**: Risk-driven iterative approach with prototyping
- **V-Model**: Verification and validation focused sequential development

### Selection Criteria Framework:

Your decision should systematically evaluate:

**Team Dynamics & Collaboration**
- Team size optimization (3-7 members ideal for most methodologies)
- Geographic distribution and communication needs
- Skill level and experience with methodologies
- Cross-functional collaboration requirements

**Project Characteristics**
- Requirements clarity and stability
- Technical complexity and innovation level
- Integration complexity and dependencies
- Performance and scalability requirements

**Risk & Quality Management**
- Risk tolerance and mitigation strategies
- Quality assurance and testing requirements
- Compliance and regulatory constraints
- Documentation and traceability needs

**Timeline & Resource Constraints**
- Schedule flexibility vs. fixed deadlines
- Budget limitations and cost optimization
- Resource availability and allocation
- Market timing and competitive pressures

**Organizational Context**
- Stakeholder involvement and feedback frequency
- Change management and adaptability
- Process maturity and governance requirements
- Long-term maintenance and support considerations

---

### Expected Output:

Respond in **valid JSON** format with the following enhanced structure:

{
  "recommended": "<Most suitable SDLC methodology>",
  "reasoning": "<A detailed explanation of why this model is the best fit, tied directly to project attributes>",
  "phases": ["<List of recommended phases for this SDLC>", "<Phase 2>", "<Phase 3>"],
  "alternatives": [
    {
      "name": "<Alternative methodology name>",
      "suitabilityScore": <0-100>,
      "pros": ["<List of advantages>"],
      "cons": ["<List of disadvantages>"],
      "additionalConsiderations": "<Optional insights, e.g., when this might still work well>"
    }
  ]
}

---

### Enhanced Output Guidelines:

**Analysis Depth**
- Provide quantitative reasoning where possible (e.g., team size optimization, timeline estimates)
- Reference industry best practices and proven patterns
- Consider both immediate project needs and long-term maintainability

**Comparative Analysis**
- Score alternatives based on project-specific criteria, not generic advantages
- Explain trade-offs explicitly with business impact assessment
- Identify potential pivot points and adaptation strategies

**Strategic Alignment**
- Align methodology selection with business objectives and organizational maturity
- Consider technology stack compatibility and tooling requirements
- Factor in team learning curve and adoption challenges

**Risk-Aware Recommendations**
- Identify methodology-specific risks and mitigation strategies
- Provide contingency planning for common failure scenarios
- Include early warning indicators for methodology effectiveness

**Modern Practices Integration**
- Incorporate DevOps practices regardless of base methodology
- Consider continuous integration/continuous deployment (CI/CD) requirements
- Address security, performance, and scalability from methodology perspective

---

Generate a decision that will directly influence product development roadmap, resource allocation, and team structure. Be strategic, evidence-based, and aligned with contemporary software engineering excellence standards.`;

    try {
      const response = await generateAiResponse([
        { role: "user", content: prompt },
      ]);
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI SDLC analysis failed:", error);
      return this.fallbackSDLCRecommendation(projectData);
    }
  }

  async analyzeCodeStructure(structure: ProjectStructure): Promise<{
    qualityScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    maintainabilityIndex: number;
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

Your analysis must include:  
1. **Code Health & Architectural Strengths**: Highlight clear non-generic strengths grounded in the observed architecture and technology choices.[2]  
2. **Technical Debt & Risk Areas**: Identify complexity hotspots (cyclomatic complexity thresholds), test gaps, and risk factors driving maintenance overhead.[3]  
3. **Actionable Recommendations**: Propose targeted steps for maintainability, readability, performance, and test coverage improvements.[5]  
4. **Testability & Scalability Assessment**: Evaluate the project’s readiness for robust testing and horizontal scaling based on design patterns and coverage metrics.[4]

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
- Ground your scoring and insights in metrics such as cyclomatic complexity and maintainability index.[3]  
- Tailor your analysis to the exact languages, frameworks, and architectural patterns detected.[2]  
- Focus on high-impact, evidence-based recommendations that a tech lead can directly implement.[8]  
- Do NOT include explanations or markdown—return the JSON only.

---
Generate your JSON evaluation as if it will be reviewed by a technical lead conducting a code review across teams. Prioritize clarity, accuracy, and actionability.
`;

    try {
      const response = await generateAiResponse([
        { role: "user", content: prompt },
      ]);
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
      name: string;
      description: string;
      code: string;
      type: "unit" | "integration" | "e2e";
      priority: "high" | "medium" | "low";
      file: string;
    }>;
    coverage: number;
    framework: string;
    summary: string;
  }> {
    const codeFiles = structure.files.filter(
      (file) =>
        file.content &&
        file.content.trim().length > 10 &&
        this.isCodeFile(file.path)
    );

    if (codeFiles.length === 0) {
      return this.fallbackTestGenerationFromStructure(language, repositoryName);
    }

    const maxFiles = 5;
    const maxFileContentLength = 2000;
    const selectedFiles = codeFiles.slice(0, maxFiles).map((f) => ({
      path: f.path,
      content:
        f.content.length > maxFileContentLength
          ? f.content.substring(0, maxFileContentLength) + "\n...(truncated)"
          : f.content,
    }));

    let aggregatedContent = `Repository: ${repositoryName}\nLanguage: ${language}\nTotal Files: ${structure.totalFiles}\nTotal Lines: ${structure.totalLines}\n\n`;
    for (const file of selectedFiles) {
      aggregatedContent += `\n=== FILE: ${file.path} ===\n\n${file.content}\n\n=== END FILE ===\n`;
    }

    const prompt = `You are a senior QA automation engineer and test strategist with expertise in comprehensive test design and modern testing frameworks.

Analyze the following ${language} repository and generate a comprehensive set of test cases that ensures high confidence in code correctness, reliability, and robustness through systematic coverage of all critical testing dimensions.
Overview
The refined system prompt ensures strict alignment with IEEE 1016 Software Design Description standards for comprehensive software design documentation. It integrates modern GitHub README best practices and mandates generation of accurate Mermaid diagrams corresponding only to the project’s actual architecture and workflows. The prompt preserves the exact JSON output structure to maintain compatibility with existing automation pipelines.
### Repository Content (Partial Overview):
${aggregatedContent}

---

### Your Objectives:

Generate a rich suite of test cases following the test automation pyramid principle [6] that addresses all relevant layers of the codebase. Ensure comprehensive coverage across:

✅ **Unit tests** – Individual functions, methods, and classes with isolated dependencies [7][14]
🔗 **Integration tests** – Components/modules interacting together, API endpoints, database connections [8]  
⚠️ **Edge cases** – Boundary values, null/undefined inputs, empty collections, numeric overflows [5][24]
❌ **Error conditions** – Exception handling, network failures, timeout scenarios, fallback logic [24][25]
📊 **Business logic validation** – Functional behavior according to requirements and business rules [25]

### Testing Strategy Framework:

Apply these evidence-based testing principles [1][2]:

**Risk-Based Prioritization**: Focus on high-risk, high-impact functionality first [2]
**80/20 Rule**: Ensure core functionality receives comprehensive coverage before edge cases [2]
**Negative Testing**: Include scenarios with invalid inputs and unexpected conditions [5][24]
**Data-Driven Approach**: Use realistic test data that mirrors production scenarios [23][26]
**Mocking Strategy**: Isolate units under test with appropriate mock objects and stubs [18][22]

---

### Output Format:

RRespond with **ONLY valid JSON** using this structure:

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

### Enhanced Guidelines:

**Framework-Specific Implementation** [7][14][17]:
- **JavaScript**: Use Jest syntax with describe/it blocks, expect() assertions, beforeEach/afterEach hooks [21]
- **Python**: Use pytest with assert statements, fixtures, parametrize decorators [14][17]
- **Java**: Use JUnit 5 with @Test, @BeforeEach, @Mock annotations, assertEquals() methods [14][20]
- **Other languages**: Apply equivalent framework conventions and best practices

**Test Naming Conventions** [15]:
- Follow Method_Scenario_Behavior pattern for clarity and consistency
- Use descriptive names that explain the test purpose without reading the code
- Avoid abbreviated or cryptic naming that requires additional context

**Code Quality Standards** [5][6]:
- Include proper setup/teardown methods to ensure test isolation [18][19][21]
- Implement realistic mock objects that simulate actual dependencies [18][22]
- Use data-driven testing patterns where multiple scenarios share logic [12][23]
- Apply boundary value analysis for numeric and collection inputs [24]
- Include both positive and negative test scenarios [5][24]

**Coverage Analysis** [16]:
- Estimate coverage based on statement, branch, and condition coverage techniques
- Consider cyclomatic complexity when determining test case completeness
- Account for error handling paths and exception scenarios in coverage calculations

---

### Advanced Testing Considerations:

**Mock Object Strategy** [18][22]:
- Create mock dependencies that verify interaction patterns
- Use stubs for predictable return values and mocks for behavior verification
- Implement proper mock lifecycle with setup and verification phases

**Error Handling Testing** [24]:
- Test all exception paths and error conditions systematically
- Verify appropriate error messages and logging
- Include fault injection scenarios for external dependencies
- Test recovery mechanisms and fallback logic

**Business Logic Validation** [25]:
- Align test scenarios with actual business requirements and workflows
- Test data validation rules and business constraints
- Verify integrity checks and process timing requirements
- Include workflow-specific edge cases and boundary conditions

**Test Data Generation** [23][26]:
- Use realistic, production-like test data while maintaining data privacy
- Implement data factories or builders for consistent test data creation
- Include edge cases in test data (empty values, boundary limits, special characters)
- Reset test data state between test runs for consistency

---

### Quality Assurance Standards:

- Prioritize test maintainability and readability over brevity
- Ensure each test verifies a single, specific behavior or requirement
- Include sufficient assertions to validate expected outcomes completely
- Implement tests that can be executed independently and in any order
- Design tests to be resilient to minor code changes while catching real regressions

---

### Notes:

- Do not include markdown formatting or explanatory text—**return only the JSON**.
- Prioritize code quality, readability, and maintainability of test cases.
- Estimate the coverage based on the logic branches inferred from the content.

---
Treat this as a test plan for a production-grade CI/CD pipeline. Be thorough, precise, and pragmatic.

Generate a comprehensive test suite that demonstrates senior-level testing expertise and strategic thinking about quality assurance in modern software development.`;

    try {
      const response = await generateAiResponse(
        [{ role: "user", content: prompt }],
        { maxTokens: 4096 }
      );
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
    const files = parsedData.files.map((file) => ({
      path: file.path,
      content: file.content,
    }));

    const validFiles = files.filter(
      (f) => f.content && f.content.trim().length > 10
    );
    if (validFiles.length === 0) {
      return this.fallbackComprehensiveDocumentationFromFiles(
        [],
        language,
        repositoryName,
        parsedData
      );
    }

    const maxFiles = 6;
    const maxFileContentLength = 2000;
    const selectedFiles = validFiles.slice(0, maxFiles).map((f) => ({
      path: f.path,
      content:
        f.content.length > maxFileContentLength
          ? f.content.substring(0, maxFileContentLength) + "\n...(truncated)"
          : f.content,
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
- **Files Analyzed**: ${selectedFiles.map((f) => f.path)}

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
  "mermaidDiagram": "CRITICAL: Create valid Mermaid diagram with exact syntax. MUST start with diagram type (flowchart TD, graph LR, sequenceDiagram). Use only alphanumeric node IDs (A, B, Module1, Service2). Proper arrows (A --> B, A --- B). NO SPECIAL CHARACTERS in node IDs. Example: 'flowchart TD\\nA[User] --> B[Frontend]\\nB --> C[API]\\nC --> D[Database]'. If unsure, use simple flowchart TD format.",
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
      console.log(
        "🚀 Generating comprehensive documentation for:",
        repositoryName
      );
      console.log(
        "📁 Files being analyzed:",
        selectedFiles.map((f) => f.path)
      );
      console.log("📝 Prompt length:", prompt.length);

      const response = await generateAiResponse(
        [{ role: "user", content: prompt }],
        { maxTokens: 8192 }
      );
      console.log("✅ AI response received, length:", response.length);

      const parsedResult = parseAiJsonResponse(response);

      // Validate and fix the Mermaid diagram if present
      if (parsedResult.mermaidDiagram) {
        parsedResult.mermaidDiagram = validateAndFixMermaidDiagram(
          parsedResult.mermaidDiagram
        );
        console.log("🎯 Mermaid diagram validated and fixed");
      }

      // --- ALWAYS use our own folder structure tree formatting ---
      // Use all files from the repository, not just the selected files for analysis
      let allRepositoryFiles = files; // Start with all files that have content

      // If parsedData has allFiles (complete file list), use that for better coverage
      if (parsedData.allFiles && parsedData.allFiles.length > 0) {
        allRepositoryFiles = parsedData.allFiles.map((f) => ({
          path: f.path,
          content: "", // We don't need content for folder structure
        }));
        console.log(
          `📁 Using complete file list: ${parsedData.allFiles.length} files`
        );
        console.log(
          `📁 Sample complete files:`,
          parsedData.allFiles.slice(0, 10).map((f) => f.path)
        );
      } else {
        console.log(`📁 Using parsed files: ${files.length} files`);
        console.log(
          `📁 Sample parsed files:`,
          files.slice(0, 10).map((f) => f.path)
        );
      }

      if (parsedResult.folderStructure) {
        parsedResult.folderStructure.tree = createFolderStructureTree(
          allRepositoryFiles,
          repositoryName
        );
        console.log(
          `🌳 Folder structure tree generated with all ${allRepositoryFiles.length} files`
        );
      }

      console.log("✅ Documentation generated successfully!");
      console.log("📊 Generated data summary:", {
        hasArchitecture: !!parsedResult.architecture,
        hasTechnologies: !!parsedResult.architecture?.technologies?.length,
        componentsCount: parsedResult.components?.length || 0,
        apisCount: parsedResult.apis?.length || 0,
        functionsCount: parsedResult.functions?.length || 0,
      });

      return parsedResult;
    } catch (error) {
      console.error(
        "❌ AI comprehensive documentation generation failed:",
        error
      );
      console.log("🔄 Using fallback documentation...");

      // Use all files for fallback documentation too
      let allRepositoryFiles = files;
      if (parsedData.allFiles && parsedData.allFiles.length > 0) {
        allRepositoryFiles = parsedData.allFiles.map((f) => ({
          path: f.path,
          content: "",
        }));
      }

      return this.fallbackComprehensiveDocumentationFromFiles(
        allRepositoryFiles,
        language,
        repositoryName,
        parsedData
      );
    }
  }

  async generateSDDReadme(project: SDDProjectInput): Promise<string> {
    const prompt = `You are a professional-grade software architect and technical writer with expertise in IEEE 1016 Software Design Description standards and modern documentation practices.

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

### 📄 IEEE 1016 Compliant Structure:

Generate a comprehensive document that integrates modern README practices [17][18][19] with IEEE 1016 SDD requirements [1][2][3]:

**README Components** (GitHub Best Practices):
1. Project title with description and badges [20][24]
2. Features section with emojis and clear value propositions [17][18]
3. Tech stack with modern badge integration [23]
4. Installation instructions with prerequisite specifications [19][22]
5. Usage examples with code snippets and practical demonstrations [19][24]
6. Project structure with directory tree visualization [17][22]
7. Development setup with environment configuration [22]
8. Contributing guidelines following open-source standards [17][18]
9. License information and legal compliance [19][22]
10. Contact/support information with communication channels [20]

**SDD Components** (IEEE 1016 Compliance):

### 1. Introduction
- **Purpose**: Document scope aligned with IEEE 1016 requirements for SDD information content and organization [1][2]
- **Scope**: Software functionality boundaries, goals, and stakeholder identification [3][6]
- **Overview**: Document structure following IEEE 1016 design entity framework [4]
- **References**: Standards compliance (IEEE 1016), APIs, libraries, and technical specifications [1][5]
- **Definitions**: Domain-specific terminology, acronyms, and technical glossary [2][8]

### 2. System Overview
- High-level system functionality summary addressing IEEE 1016 design concerns [3][6]
- User roles, system boundaries, and major architectural goals [6][7]
- Business context and stakeholder value proposition [6]

### 3. System Architecture
- System decomposition following IEEE 1016 design entity attributes [4]
- **Mermaid.js diagrams** with accurate syntax and appropriate diagram selection [9][11][16]:
  - **Architecture diagrams** for service relationships using architecture-beta syntax [9][11][16]
  - **Flowcharts** for process workflows using flowchart TD/LR syntax [25][28][31]
  - **Sequence diagrams** for component interactions using sequenceDiagram syntax [30][31]
  - **Component diagrams** for system structure visualization [13][14]
- Architectural decision rationale covering scalability, maintainability, and security [6][7]

### 4. Data Design
- Data structure and storage model aligned with IEEE 1016 data design requirements [7]
- **Data dictionary** with entity definitions, field specifications, and relationship mappings [3][7]
- Data flow patterns and persistence strategies [6]

### 5. Component Design
- IEEE 1016 compliant component specifications [4]:
  - Component responsibility and purpose definition
  - Input/output interface specifications
  - **Program Design Language (PDL)** or structured pseudocode [3][7]
- Component interaction patterns and dependency management [4]

### 6. Human Interface Design
- User interaction patterns and interface specifications [3][7]
- **UI layout descriptions** with Mermaid flowchart representations where applicable [25][28]
- Accessibility compliance and internationalization considerations [20]

### 7. Requirements Matrix
- **Traceability matrix** mapping functional/non-functional requirements to features and components [3][6]
- Requirements verification and validation approach [2][3]

### 8. Appendices
- External documentation references (API specifications, design documents) [1][2]
- **Additional Mermaid diagrams** for complex system interactions [11][13]
- Environment setup and deployment configurations [7][22]
- Third-party service integrations and external dependencies [6]

---

### 🎯 Enhanced Guidelines:

**Mermaid Diagram Accuracy** [9][11][16]:
- Use **architecture-beta** syntax for modern service architecture visualization [9][11][16]
- Apply **flowchart TD/LR** for process flows with proper node shapes and connections [25][28]
- Implement **sequenceDiagram** for component interactions with participant definitions [30][31]
- Include **graph TD/LR** for component relationships and data flow representation [14][25]
- Ensure diagram complexity matches project scope - avoid unnecessary visualizations [11][13]

**Professional Documentation Standards** [17][18][19]:
- Maintain consistent markdown formatting with proper heading hierarchy [21][22]
- Include contextually appropriate badges using shields.io integration [23]
- Provide executable code examples with clear setup instructions [19][24]
- Structure content for both technical and managerial audiences [6][20]

**IEEE 1016 Compliance Requirements** [1][2][4]:
- Address all mandatory design entity attributes: identity, type, purpose, function, dependencies, interface, resources, processing, and data [4]
- Ensure design viewpoint organization facilitates stakeholder access to relevant information [1][4]
- Maintain consistency between design description and implementation [2][3]

**Context-Aware Content Generation**:
- Tailor diagram complexity to project size and team requirements
- Select appropriate Mermaid diagram types based on system architecture
- Scale documentation depth according to SDLC model and project timeline
- Integrate risk factors into architectural decision documentation

---

### 🔄 Output Requirements:

- Generate **complete markdown content** starting with # \${project.name}
- Ensure **IEEE 1016 compliance** while maintaining GitHub README usability [1][2][17]
- Include **accurate Mermaid diagrams** with proper syntax validation [9][11][25]
- Provide **actionable documentation** suitable for development teams and stakeholders [6][20]
- Maintain **professional technical writing standards** throughout the document [24]

Generate this comprehensive SDD/README hybrid document that serves as both practical development documentation and formal software design specification, ensuring compliance with IEEE 1016 standards while following modern GitHub documentation best practices.`;

    try {
      const response = await generateAiResponse(
        [{ role: "user", content: prompt }],
        { maxTokens: 8192 }
      );

      console.log("🔍 AI SDD/README Response Debug:");
      console.log("- Type:", typeof response);
      console.log("- Length:", response.length);
      console.log("- First 300 chars:", response.substring(0, 300));
      console.log("- Starts with JSON?:", response.trim().startsWith("{"));
      console.log(
        "- Contains README.md key?:",
        response.includes('"README.md"')
      );

      // Check if the response is JSON-wrapped and extract content if needed
      let cleanResponse = response.trim();

      if (
        cleanResponse.startsWith("{") &&
        cleanResponse.includes('"README.md"')
      ) {
        console.log(
          "⚠️ Detected JSON-wrapped response, extracting markdown content..."
        );
        try {
          const parsed = JSON.parse(cleanResponse);
          if (parsed["README.md"]) {
            cleanResponse = parsed["README.md"];
            console.log("✅ Successfully extracted markdown from JSON wrapper");
          }
        } catch {
          console.log(
            "❌ Failed to parse JSON wrapper, using original response"
          );
        }
      }

      // This is a Markdown document, so just return as string
      return cleanResponse;
    } catch (error) {
      console.error("AI SDD/README generation failed:", error);
      throw new Error("Could not generate SDD/README from AI.");
    }
  }

  private fallbackSDLCRecommendation(projectData: ProjectData) {
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

  private fallbackStructureAnalysis(structure: ProjectStructure) {
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

  private fallbackTestGeneration(language: string) {
    console.warn("Using fallback test generation for language:", language);
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
          name: "Basic Functionality Test",
          description: `Basic test for ${language} file (AI unavailable)`,
          code: `// ${framework} test template\n// Add your test implementation here`,
          type: "unit" as const,
          priority: "medium" as const,
        },
        {
          name: "Error Handling Test",
          description: "Test error conditions and edge cases",
          code: `// Test error scenarios\n// Verify proper error handling`,
          type: "unit" as const,
          priority: "high" as const,
        },
      ],
      coverage: 75,
      framework,
    };
  }

  private fallbackTestGenerationFromStructure(
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

  private fallbackDocumentationGeneration(filePath: string, language: string) {
    console.warn(
      "Using fallback documentation generation for:",
      filePath,
      language
    );
    return {
      summary: `${language} file located at ${filePath}. AI-powered analysis is currently unavailable, but this file appears to be part of the application's core functionality.`,
      functions: [
        {
          name: "main",
          description: "Main function (inferred from file structure)",
          parameters: [],
          returns: {
            type: "void",
            description: "No return value",
          },
        },
      ],
      examples: [
        `// Example usage of ${filePath}\n// Please refer to the actual file for implementation details`,
      ],
    };
  }

  private fallbackComprehensiveDocumentationFromFiles(
    files: Array<{ path: string; content: string }>,
    language: string,
    repositoryName: string,
    parsedData?: ProjectStructure
  ) {
    const fileList =
      files.length > 0
        ? files.map((f) => f.path).join(", ")
        : "No files available";

    // Use all files from parsedData if available, otherwise use the provided files
    let allFiles = files;
    if (parsedData?.allFiles && parsedData.allFiles.length > 0) {
      allFiles = parsedData.allFiles.map((f) => ({
        path: f.path,
        content: "", // Content not needed for folder structure
      }));
      console.log(
        `📁 Fallback using complete file list: ${parsedData.allFiles.length} files`
      );
    } else {
      console.log(`📁 Fallback using parsed files: ${files.length} files`);
    }

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
        tree: createFolderStructureTree(allFiles, repositoryName),
        directories: [
          {
            path: "src/",
            purpose: "Main source code directory",
            type: "source" as const,
            fileCount: allFiles.filter((f) => f.path.startsWith("src/")).length,
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
      mermaidDiagram: validateAndFixMermaidDiagram(
        "flowchart TD\nA[User] --> B[" +
          repositoryName +
          " Application]\nB --> C[Business Logic]\nC --> D[Data Layer]"
      ),
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

  private isCodeFile(filePath: string): boolean {
    if (!filePath) return false;

    const excludedExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".svg",
      ".ico",
      ".webp",
      ".mp4",
      ".avi",
      ".mov",
      ".wmv",
      ".mp3",
      ".wav",
      ".pdf",
      ".doc",
      ".zip",
      ".rar",
      ".7z",
      ".tar",
      ".gz",
      ".ttf",
      ".otf",
      ".woff",
      ".exe",
      ".dll",
      ".so",
      ".db",
      ".sqlite",
      ".log",
      ".tmp",
      ".lock",
      ".map",
    ];

    const excludedDirectories = [
      "node_modules/",
      "dist/",
      "build/",
      "target/",
      "bin/",
      "obj/",
      ".git/",
      ".vscode/",
      ".idea/",
      "__pycache__/",
      "coverage/",
      "vendor/",
      "assets/images/",
      "static/images/",
      "images/",
      "img/",
    ];

    const codeExtensions = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".vue",
      ".svelte",
      ".html",
      ".css",
      ".scss",
      ".sass",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".kt",
      ".swift",
      ".sh",
      ".json",
      ".yaml",
      ".yml",
      ".xml",
      ".md",
      ".txt",
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
function createFolderStructureTree(
  files: Array<{ path: string; content?: string }>,
  repositoryName: string
): string {
  if (!files || files.length === 0) {
    return `${repositoryName}/\n└── (empty)`;
  }

  console.log(`🌳 Creating folder structure tree for ${files.length} files`);
  console.log(
    "📂 Sample file paths:",
    files.slice(0, 15).map((f) => f.path)
  );

  if (files.length > 15) {
    console.log(
      "📂 More file paths:",
      files.slice(15, 30).map((f) => f.path)
    );
  }

  // Build a tree structure from file paths
  interface TreeNode {
    name: string;
    isFile: boolean;
    children: Map<string, TreeNode>;
    path: string;
  }

  const root: TreeNode = {
    name: repositoryName,
    isFile: false,
    children: new Map(),
    path: "",
  };

  // Add all files to the tree
  files.forEach((file) => {
    if (!file.path) return; // Skip files without path

    const parts = file.path.split("/").filter((part) => part.length > 0);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (!current.children.has(part)) {
        current.children.set(part, {
          name: part,
          isFile: isLastPart,
          children: new Map(),
          path: currentPath,
        });
      }

      current = current.children.get(part)!;
    }
  });

  // Convert tree to ASCII representation
  function buildTreeString(
    node: TreeNode,
    prefix: string = "",
    isLast: boolean = true
  ): string {
    let result = "";

    if (node.name !== repositoryName) {
      const connector = isLast ? "└── " : "├── ";
      const suffix = node.isFile ? "" : "/";
      result += prefix + connector + node.name + suffix + "\n";
    } else {
      result += repositoryName + "/\n";
    }

    const children = Array.from(node.children.values()).sort((a, b) => {
      // Directories first, then files, alphabetically within each group
      if (!a.isFile && b.isFile) return -1;
      if (a.isFile && !b.isFile) return 1;
      return a.name.localeCompare(b.name);
    });

    children.forEach((child, index) => {
      const isChildLast = index === children.length - 1;
      const childPrefix =
        node.name === repositoryName ? "" : prefix + (isLast ? "    " : "│   ");

      result += buildTreeString(child, childPrefix, isChildLast);
    });

    return result;
  }

  const result = buildTreeString(root).trim();
  console.log(`🌳 Generated tree with ${result.split("\n").length} lines`);
  return result;
}

// Mermaid diagram validation and fixing function
export function validateAndFixMermaidDiagram(diagram: string): string {
  if (!diagram || typeof diagram !== "string") {
    return "flowchart TD\nA[Start] --> B[End]";
  }

  let cleaned = diagram.trim();

  // Remove any markdown code blocks
  if (cleaned.startsWith("```mermaid")) {
    cleaned = cleaned.replace(/^```mermaid\s*/, "").replace(/```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```\s*$/, "");
  }

  cleaned = cleaned.trim();

  // Check if it starts with a valid diagram type
  const validTypes = [
    "flowchart TD",
    "flowchart LR",
    "flowchart TB",
    "flowchart RL",
    "graph TD",
    "graph LR",
    "graph TB",
    "graph RL",
    "sequenceDiagram",
    "classDiagram",
    "erDiagram",
    "gitgraph",
    "pie",
    "journey",
    "gantt",
    "mindmap",
    "timeline",
  ];

  const hasValidStart = validTypes.some((type) => cleaned.startsWith(type));

  if (!hasValidStart) {
    // Try to auto-fix by adding flowchart TD
    cleaned = "flowchart TD\n" + cleaned;
  }

  // Fix common syntax issues
  cleaned = cleaned
    // Fix node IDs with special characters
    .replace(/\[([^\]]*)\s+([^\]]*)\]/g, "[$1_$2]")
    // Fix arrows with spaces
    .replace(/\s*-->\s*/g, " --> ")
    .replace(/\s*---\s*/g, " --- ")
    // Remove extra whitespace
    .replace(/\n\s*\n/g, "\n")
    .trim();

  // Validate that each line follows proper syntax
  const lines = cleaned.split("\n");
  const fixedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip diagram type declarations
    if (i === 0 && validTypes.some((type) => line.startsWith(type))) {
      fixedLines.push(line);
      continue;
    }

    // Fix node definitions and connections
    if (line.includes("-->") || line.includes("---")) {
      // Ensure node IDs are alphanumeric
      const fixedLine = line.replace(
        /([A-Za-z0-9_]+)(\[[^\]]+\])?/g,
        (_, id, label) => {
          const cleanId = id.replace(/[^A-Za-z0-9_]/g, "_");
          return cleanId + (label || "");
        }
      );
      fixedLines.push(fixedLine);
    } else if (line.match(/^[A-Za-z0-9_]+(\[[^\]]+\])?$/)) {
      // Simple node definition
      fixedLines.push(line);
    } else {
      // Try to fix the line or skip if it's malformed
      const fixedLine = line.replace(/[^A-Za-z0-9_[\]\->\s]/g, "_");
      if (fixedLine.trim()) {
        fixedLines.push(fixedLine);
      }
    }
  }

  const result = fixedLines.join("\n");

  // Final validation - if the result is too broken, return a safe fallback
  if (result.split("\n").length < 2) {
    return "flowchart TD\nA[Application] --> B[Component]\nB --> C[Output]";
  }

  return result;
}
