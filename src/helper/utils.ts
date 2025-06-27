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

export function parseAiJsonResponse(aiText: string): unknown {
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
      .replace(/\\n/g, "") // Remove newline escapes
      .replace(/\\r/g, "") // Remove carriage returns
      .replace(/^"+|"+$/g, ""); // Trim surrounding quotes if present

    // Parse final cleaned string
    return JSON.parse(sanitized);
  } catch (err) {
    console.error("❌ Failed to parse AI JSON response:", err);
    console.log("🔎 Raw AI response was:\n", aiText);
    throw new Error("Could not parse AI response as valid JSON.");
  }
}
