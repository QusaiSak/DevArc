import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { ProjectStructure } from "@/types/codeparser.interface";
import type { ProjectData, SDDProjectInput } from "@/types/ai.interface";

export class AIAnalyzer {
  private model = openai("gpt-4o-mini");

  async generateSDLCRecommendation(projectData: ProjectData) {
    const prompt = `
You are an expert software development consultant. Based on the following project information, recommend the most suitable SDLC (Software Development Life Cycle) methodology and provide detailed reasoning.

Project Details:
- Name: ${projectData.name}
- Description: ${projectData.description}
- Type: ${projectData.type}
- Team Size: ${projectData.teamSize}
- Timeline: ${projectData.timeline}
- Complexity: ${projectData.complexity}
- Key Features: ${projectData.keyFeatures}
- Requirements: ${projectData.requirements}
- Risk Factors: ${projectData.riskFactors}
- Additional Context: ${projectData.additionalContext}

Available SDLC methodologies to choose from:
- Agile
- Scrum
- Kanban
- Waterfall
- DevOps
- Lean
- Spiral
- V-Model

Please respond with a JSON object containing:
{
  "recommended": "methodology_name",
  "reasoning": "detailed explanation of why this methodology is best suited for this project",
  "phases": ["phase1", "phase2", "phase3", ...] // key phases for this methodology
}

Consider factors like team size, project complexity, timeline, requirements clarity, and risk factors in your recommendation.
`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3,
      });

      // Parse the JSON response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if JSON parsing fails
      return {
        recommended: "Agile",
        reasoning: "Based on the project characteristics, Agile methodology is recommended for its flexibility and iterative approach.",
        phases: ["Planning", "Design", "Development", "Testing", "Deployment", "Review"]
      };
    } catch (error) {
      console.error("Error generating SDLC recommendation:", error);
      throw new Error("Failed to generate SDLC recommendation");
    }
  }

  async generateSDDReadme(projectData: SDDProjectInput): Promise<string> {
    const prompt = `
Create a comprehensive Software Design Document (SDD) in Markdown format for the following project:

Project Information:
- Name: ${projectData.name}
- Description: ${projectData.description}
- Type: ${projectData.type}
- Team Size: ${projectData.teamSize}
- Timeline: ${projectData.timeline}
- Complexity: ${projectData.complexity}
- Tech Stack: ${projectData.techStack}
- Key Features: ${projectData.keyFeatures}
- Risk Factors: ${projectData.riskFactors}
- Requirements: ${projectData.requirements}
- Additional Context: ${projectData.additionalContext}
- SDLC Model: ${projectData.sdlcModel}

Generate a professional README.md that includes:

1. Project title and description
2. Table of contents
3. Features overview
4. Technology stack
5. Architecture overview
6. Installation and setup instructions
7. Usage examples
8. Development workflow (based on ${projectData.sdlcModel})
9. Testing strategy
10. Deployment guidelines
11. Contributing guidelines
12. Risk mitigation strategies
13. Project timeline and milestones
14. Team structure and roles
15. License information

Make it comprehensive, professional, and suitable for a production repository. Use proper Markdown formatting with headers, lists, code blocks, and badges where appropriate.
`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.4,
        maxTokens: 4000,
      });

      return result.text;
    } catch (error) {
      console.error("Error generating SDD README:", error);
      throw new Error("Failed to generate project documentation");
    }
  }

  async analyzeCodeStructure(structure: ProjectStructure) {
    const prompt = `
Analyze the following code structure and provide insights:

Project Structure:
- Total Files: ${structure.totalFiles}
- Total Lines: ${structure.totalLines}
- Languages: ${JSON.stringify(structure.languages)}
- Test Coverage: ${structure.testCoverage}%
- Average Complexity: ${structure.complexity.average}
- Architecture: ${structure.patterns.architecture}
- Frameworks: ${structure.patterns.framework.join(", ")}
- Patterns: ${structure.patterns.patterns.join(", ")}

Issues Found:
${structure.issues.map(issue => `- ${issue.severity}: ${issue.message} (${issue.file}:${issue.line})`).join("\n")}

Provide a comprehensive analysis including:
1. Code quality score (0-100)
2. Strengths of the codebase
3. Areas for improvement
4. Specific recommendations
5. Maintainability index (0-100)

Respond in JSON format:
{
  "qualityScore": number,
  "maintainabilityIndex": number,
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}
`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3,
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse analysis result");
    } catch (error) {
      console.error("Error analyzing code structure:", error);
      throw new Error("Failed to analyze code structure");
    }
  }

  async generateComprehensiveDocumentation(
    structure: ProjectStructure,
    language: string,
    projectName: string
  ) {
    const prompt = `
Generate comprehensive technical documentation for a ${language} project named "${projectName}".

Project Structure Analysis:
- Total Files: ${structure.totalFiles}
- Total Lines: ${structure.totalLines}
- Languages: ${JSON.stringify(structure.languages)}
- Architecture: ${structure.patterns.architecture}
- Frameworks: ${structure.patterns.framework.join(", ")}

Key Files and Components:
${structure.files.slice(0, 10).map(file => 
  `- ${file.path} (${file.lines} lines, ${file.functions.length} functions)`
).join("\n")}

Generate documentation including:
1. Project summary
2. Architecture overview with pattern and technologies
3. Folder structure analysis
4. Code internals and flow
5. Key components and their purposes
6. API endpoints (if applicable)
7. Data models and relationships
8. Mermaid diagram for system architecture
9. Usage examples with code

Respond in JSON format with the complete documentation structure.
`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.4,
        maxTokens: 4000,
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback documentation structure
      return {
        summary: `Comprehensive documentation for ${projectName}`,
        architecture: {
          pattern: structure.patterns.architecture,
          description: `This project follows the ${structure.patterns.architecture} pattern`,
          technologies: structure.patterns.framework,
        },
        mermaidDiagram: `graph TD\n    A[User] --> B[Frontend]\n    B --> C[Backend]\n    C --> D[Database]`,
        examples: [
          {
            title: "Basic Usage",
            description: "How to get started with the project",
            code: "// Example code here",
            explanation: "This example shows basic usage"
          }
        ]
      };
    } catch (error) {
      console.error("Error generating documentation:", error);
      throw new Error("Failed to generate documentation");
    }
  }

  async generateTestCasesFromStructure(
    structure: ProjectStructure,
    language: string,
    projectName: string
  ) {
    const prompt = `
Generate comprehensive test cases for a ${language} project named "${projectName}".

Project Analysis:
- Total Files: ${structure.totalFiles}
- Languages: ${JSON.stringify(structure.languages)}
- Architecture: ${structure.patterns.architecture}
- Current Test Coverage: ${structure.testCoverage}%

Key Functions to Test:
${structure.files.slice(0, 5).map(file => 
  file.functions.slice(0, 3).map(func => 
    `- ${func.name} in ${file.path} (complexity: ${func.complexity})`
  ).join("\n")
).join("\n")}

Generate test cases including:
1. Unit tests for key functions
2. Integration tests for components
3. End-to-end tests for user workflows
4. Edge case testing
5. Performance tests

For each test case, provide:
- Name
- Type (unit/integration/e2e)
- Priority (high/medium/low)
- Description
- Test code in ${language}

Respond in JSON format:
{
  "testCases": [
    {
      "name": "test name",
      "type": "unit|integration|e2e",
      "priority": "high|medium|low",
      "description": "what this test validates",
      "code": "actual test code"
    }
  ],
  "coverage": estimated_coverage_percentage,
  "framework": "recommended_testing_framework"
}
`;

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.4,
        maxTokens: 3000,
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback test structure
      return {
        testCases: [
          {
            name: "Basic functionality test",
            type: "unit",
            priority: "high",
            description: "Tests core functionality",
            code: `// Example test case\ntest('should work correctly', () => {\n  expect(true).toBe(true);\n});`
          }
        ],
        coverage: 75,
        framework: language === "javascript" || language === "typescript" ? "Jest" : "Default"
      };
    } catch (error) {
      console.error("Error generating test cases:", error);
      throw new Error("Failed to generate test cases");
    }
  }
}