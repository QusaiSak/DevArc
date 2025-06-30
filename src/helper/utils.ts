export function isCodeFile(filePath: string): boolean {
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

export function parseAiJsonResponseTest(aiText: string): any {
  try {
    let sanitized = aiText.trim();

    // Remove markdown blocks
    sanitized = sanitized
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Find JSON object
    const firstBrace = sanitized.indexOf("{");
    const lastBrace = sanitized.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found");
    }

    sanitized = sanitized.substring(firstBrace, lastBrace + 1);

    // Clean up problematic characters
    sanitized = sanitized
      .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
      .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
      .replace(/\\/g, "\\\\") // Escape backslashes
      .replace(/"/g, '"') // Normalize quotes
      .trim();

    // Fix for unterminated/truncated JSON: balance braces/brackets at the end
    const openCurly = (sanitized.match(/{/g) || []).length;
    const closeCurly = (sanitized.match(/}/g) || []).length;
    if (closeCurly < openCurly) {
      sanitized += "}".repeat(openCurly - closeCurly);
    }
    const openBracket = (sanitized.match(/\[/g) || []).length;
    const closeBracket = (sanitized.match(/]/g) || []).length;
    if (closeBracket < openBracket) {
      sanitized += "]".repeat(openBracket - closeBracket);
    }

    return JSON.parse(sanitized);
  } catch (err) {
    console.error("JSON parsing failed:", err);
    console.log("Problematic text:", aiText.substring(0, 500));
    throw new Error(
      `Could not parse AI response as valid JSON: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extracts JSON from markdown code blocks
 */
function extractJsonFromMarkdown(markdown: string): string {
  // Handle both ```json and ```
  const jsonBlockRegex = /```(?:json)?\n([\s\S]*?)\n```/;
  const match = markdown.match(jsonBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // If no code block, try to find JSON directly
  const jsonMatch = markdown.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : markdown;
}

export function parseAiJsonResponse(aiText: string): any {
  if (!aiText?.trim()) {
    throw new Error("Empty AI response");
  }

  try {
    // Try to extract JSON from markdown first
    let sanitized = extractJsonFromMarkdown(aiText);

    // If we didn't find a code block, use the original text
    if (!sanitized) {
      sanitized = aiText.trim();
    }

    // Remove any remaining markdown code block markers
    sanitized = sanitized
      .replace(/```(json)?/g, "")
      .replace(/`/g, "") // Remove any remaining backticks
      .trim();

    // Find the first and last braces to extract the JSON object
    const firstBrace = sanitized.indexOf("{");
    const lastBrace = sanitized.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No JSON object found in the response");
    }

    // Extract the JSON part
    sanitized = sanitized.substring(firstBrace, lastBrace + 1);

    // Remove control characters but preserve newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Fix common JSON issues
    // 1. Fix trailing commas
    sanitized = sanitized.replace(/,\s*([}\]])/g, "$1");

    // 2. Fix unescaped quotes in strings
    sanitized = sanitized.replace(/(?<!\\)"/g, '\\"').replace(/\\"/g, '"');

    // 3. Fix single quotes (convert to double quotes)
    sanitized = sanitized.replace(/'/g, '"');

    // 4. Fix unquoted property names
    sanitized = sanitized.replace(
      /([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g,
      '$1"$2"$3'
    );

    // Check for unbalanced braces and fix them
    const openCurly = (sanitized.match(/\{/g) || []).length;
    const closeCurly = (sanitized.match(/\}/g) || []).length;

    if (closeCurly < openCurly) {
      sanitized += "}".repeat(openCurly - closeCurly);
    } else if (closeCurly > openCurly) {
      sanitized =
        sanitized.replace(/\}/g, "").replace(/\{/g, "") +
        "{" +
        "}".repeat(openCurly - closeCurly + 1);
    }

    const openBracket = (sanitized.match(/\[/g) || []).length;
    const closeBracket = (sanitized.match(/\]/g) || []).length;

    if (closeBracket < openBracket) {
      sanitized += "]".repeat(openBracket - closeBracket);
    } else if (closeBracket > openBracket) {
      sanitized =
        sanitized.replace(/\]/g, "").replace(/\[/g, "") +
        "[" +
        "]".repeat(openBracket - closeBracket + 1);
    }

    // Try to parse the sanitized JSON
    try {
      return JSON.parse(sanitized);
    } catch (parseError) {
      console.warn(
        "Initial JSON parse failed, attempting to fix common issues",
        parseError
      );

      // If parsing still fails, try to fix more issues
      // 5. Handle unescaped control characters in strings
      sanitized = sanitized.replace(/\\([^"\\/bfnrtu])/g, (_, p1) => {
        return `\\\\${p1}`;
      });

      // 6. Handle line breaks in strings
      sanitized = sanitized
        .replace(/\n/g, "\\\\n")
        .replace(/\r/g, "\\\\r")
        .replace(/\t/g, "\\\\t");

      // Try parsing again
      return JSON.parse(sanitized);
    }
  } catch (err) {
    console.error("JSON parsing failed:", err);
    console.log("Problematic text:", aiText.substring(0, 500));

    // If all else fails, try to extract any valid JSON object/array
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Ignore this error and throw the original one
    }

    throw new Error(
      `Could not parse AI response as valid JSON: ${
        err instanceof Error ? err.message : "Unknown error"
      }`
    );
  }
}
