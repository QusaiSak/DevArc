import type {
  AiMessage,
  AiResponseOptions,
  ProjectData,
  SDDProjectInput,
} from "@/types/ai.interface";
import type { ProjectStructure } from "@/types/codeparser.interface";
import { PROMPTS } from "../helper/aiPrompts";
import {
  fallbackSDLCRecommendation,
  fallbackStructureAnalysis,
  fallbackTestGenerationFromStructure,
  fallbackComprehensiveDocumentationFromFiles,
  createFolderStructureTree,
  extractApiEndpoints,
} from "../helper/fallback";
import {
  isCodeFile,
  parseAiJsonResponse,
  parseAiJsonResponseTest,
} from "@/helper/utils";

const DEFAULT_OPTIONS: AiResponseOptions = {
  model: "mistralai/devstral-small:free",
  systemPrompt: PROMPTS.system,
  temperature: 0.2,
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
  async generateSDLCRecommendation(projectData: ProjectData) {
    let prompt = PROMPTS.sdlcRecommendation(projectData);
    let aiMessages: AiMessage[] = [];
    if (
      prompt &&
      typeof prompt === "object" &&
      Array.isArray(prompt.messages)
    ) {
      aiMessages = prompt.messages.map((m: any) => ({
        ...m,
        content:
          typeof m.content === "string"
            ? m.content.slice(0, 6000) // truncate to 6k chars for safety
            : "",
      }));
    } else {
      aiMessages = [
        {
          role: "user",
          content: typeof prompt === "string" ? prompt.slice(0, 6000) : "",
        },
      ];
    }
    // Final fallback to avoid empty prompt
    if (!aiMessages.length) {
      aiMessages = [
        { role: "user", content: "Analyze the provided code structure." },
      ];
    }
    try {
      const response = await generateAiResponse(aiMessages);
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI SDLC analysis failed:", error);
      return fallbackSDLCRecommendation(projectData);
    }
  }

  async analyzeCodeStructure(structure: ProjectStructure) {
    // Sanitize and truncate prompt before sending to AI
    let prompt = PROMPTS.codeStructure(structure);
    // If the prompt is an object, extract the messages array
    let aiMessages: AiMessage[] = [];
    if (
      prompt &&
      typeof prompt === "object" &&
      Array.isArray(prompt.messages)
    ) {
      aiMessages = prompt.messages.map((m: any) => ({
        ...m,
        content:
          typeof m.content === "string"
            ? m.content.slice(0, 6000) // truncate to 6k chars for safety
            : "",
      }));
    } else {
      aiMessages = [
        {
          role: "user",
          content: typeof prompt === "string" ? prompt.slice(0, 6000) : "",
        },
      ];
    }
    // Final fallback to avoid empty prompt
    if (!aiMessages.length) {
      aiMessages = [
        { role: "user", content: "Analyze the provided code structure." },
      ];
    }
    try {
      const response = await generateAiResponse(aiMessages);
      return parseAiJsonResponse(response);
    } catch (error) {
      console.error("AI structure analysis failed:", error);
      return fallbackStructureAnalysis(structure);
    }
  }

  async generateTestCasesFromStructure(
    structure: ProjectStructure,
    language: string,
    repositoryName: string
  ) {
    const codeFiles = structure.files.filter(
      (file) =>
        file.content && file.content.trim().length > 10 && isCodeFile(file.path)
    );

    if (codeFiles.length === 0) {
      return fallbackTestGenerationFromStructure(language, repositoryName);
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

    // Sanitize and truncate prompt before sending to AI
    let prompt = PROMPTS.testCases(language, aggregatedContent);
    let aiMessages: AiMessage[] = [];
    if (
      prompt &&
      typeof prompt === "object" &&
      Array.isArray(prompt.messages)
    ) {
      aiMessages = prompt.messages.map((m: any) => ({
        ...m,
        content:
          typeof m.content === "string"
            ? m.content.slice(0, 6000) // truncate to 6k chars for safety
            : "",
      }));
    } else {
      aiMessages = [
        {
          role: "user",
          content: typeof prompt === "string" ? prompt.slice(0, 6000) : "",
        },
      ];
    }
    if (!aiMessages.length) {
      aiMessages = [
        {
          role: "user",
          content: "Generate comprehensive test cases for the provided code.",
        },
      ];
    }
    try {
      const response = await generateAiResponse(aiMessages, {
        maxTokens: 4096,
      });
      return parseAiJsonResponseTest(response);
    } catch (error) {
      console.error("AI test generation from structure failed:", error);
      return fallbackTestGenerationFromStructure(language, repositoryName);
    }
  }

  async generateComprehensiveDocumentation(
    parsedData: ProjectStructure,
    language: string,
    repositoryName: string
  ) {
    console.log("🔍 generateComprehensiveDocumentation called with:", {
      language,
      repositoryName,
      totalFiles: parsedData.totalFiles,
      filesCount: parsedData.files?.length || 0,
    });

    const files =
      parsedData.files?.map((file) => ({
        path: file.path || "",
        content: file.content || "",
      })) || [];

    const validFiles = files.filter(
      (f) =>
        f.path && f.path.length > 0 && f.content && f.content.trim().length > 10
    );

    console.log("📁 Valid files found:", validFiles.length);

    if (validFiles.length === 0) {
      console.log("⚠️ No valid files found, using fallback");
      return fallbackComprehensiveDocumentationFromFiles(
        files,
        language,
        repositoryName
      );
    }

    const maxFiles = 6; // Reduced to avoid token limits
    const maxFileContentLength = 2500; // Reduced content length
    const selectedFiles = validFiles.slice(0, maxFiles).map((f) => ({
      path: f.path,
      content:
        f.content && f.content.length > maxFileContentLength
          ? f.content.substring(0, maxFileContentLength) + "\n...(truncated)"
          : f.content || "",
    }));

    // Generate folder structure tree using the utility function
    const folderTree = createFolderStructureTree(files, repositoryName);

    // Extract API endpoints using the utility function
    const apiEndpoints: any = extractApiEndpoints(validFiles);

    const { messages } = PROMPTS.comprehensiveDocumentationFromFiles(
      selectedFiles,
      language,
      repositoryName,
      folderTree,
      apiEndpoints
    );

    console.log("📝 API endpoints being passed:", apiEndpoints?.length || 0);
    console.log("📝 Folder tree being passed:", folderTree ? "✅" : "❌");

    console.log("📝 Sending prompt to AI...");

    try {
      const response = await generateAiResponse(
        messages.map((m) => ({ ...m, role: "user" as const }))
      );

      console.log("🔍 Raw AI response length:", response.length);
      console.log("🔍 Raw AI response preview:", response.substring(0, 300));

      // Directly use the new, more robust parser.
      // It will throw an error if it fails, which will be caught below.
      const result = parseAiJsonResponse(response);

      console.log("✅ Parsed documentation keys:", Object.keys(result || {}));

      // Validate and enhance the result structure
      if (result && typeof result === "object") {
        // Ensure required fields exist with fallback values
        if (!result.summary) {
          result.summary = `${repositoryName} is a ${language} application with ${validFiles.length} source files.`;
        }

        if (!result.folderStructure) {
          result.folderStructure = {
            tree: folderTree,
            directories: [],
          };
        } else if (!result.folderStructure.tree) {
          result.folderStructure.tree = folderTree;
        }

        if (!result.apis && apiEndpoints.length > 0) {
          result.apis = apiEndpoints;
        }

        if (!result.architecture) {
          result.architecture = {
            pattern: "Component-based",
            description:
              "The application follows a modular component-based architecture.",
            technologies: [language],
            layers: [],
          };
        }

        if (!result.codeInternals) {
          result.codeInternals = {
            codeFlow:
              "The application starts from the main entry point and processes through various components.",
            keyAlgorithms: [],
            designPatterns: [],
            dataFlow:
              "Data flows through the application layers from input to output.",
            businessLogic: [],
          };
        }

        if (!result.components) {
          result.components = [];
        }

        if (!result.functions) {
          result.functions = [];
        }

        if (!result.dataModels) {
          result.dataModels = [];
        }

        if (!result.sdlc) {
          result.sdlc = {
            setupInstructions: [
              {
                step: 1,
                title: "Install Dependencies",
                description: "Install project dependencies",
                commands: ["npm install"],
              },
            ],
          };
        }

        if (!result.examples) {
          result.examples = [];
        }

        if (!result.mermaidDiagram) {
          result.mermaidDiagram = `flowchart TD
    A[Application Start] --> B[Main Components]
    B --> C[Business Logic]
    C --> D[Data Layer]
    D --> E[Output]`;
        }

        console.log("✅ Documentation structure validated and enhanced");
      }

      return result;
    } catch (error) {
      console.error(
        "❌ AI comprehensive documentation generation failed:",
        error
      );
      console.log("🔄 Using fallback documentation...");
      return fallbackComprehensiveDocumentationFromFiles(
        selectedFiles,
        language,
        repositoryName
      );
    }
  }

  async generateSDDReadme(project: SDDProjectInput): Promise<string> {
    const prompt = PROMPTS.sddReadme(project);
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
}
