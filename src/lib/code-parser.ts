import type { ParsedFile } from "@/types/codeparser.interface";

export class CodeParser {
  // Keep this method - it's used by StructureAnalyzer
  parseFile(filePath: string, content: string): ParsedFile {
    // Handle binary files and very large files
    if (this.isBinaryFile(filePath) || content.length > 5000000) {
      // 5MB limit
      return {
        path: filePath,
        content: "",
        lines: 0,
        complexity: 0,
        functions: [],
        imports: [],
        exports: [],
        language: this.detectLanguage(filePath),
        size: content.length,
      };
    }

    try {
      const lines = content.split("\n").length;
      const complexity = this.calculateComplexity(content);
      const functions = this.extractFunctions(content, filePath);
      const imports = this.extractImports(content, filePath);
      const exports = this.extractExports(content, filePath);

      return {
        path: filePath,
        content,
        lines,
        complexity,
        functions,
        imports,
        exports,
        language: this.detectLanguage(filePath),
        size: content.length,
      };
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      return {
        path: filePath,
        content: "",
        lines: content.split("\n").length,
        complexity: 0,
        functions: [],
        imports: [],
        exports: [],
        language: this.detectLanguage(filePath),
        size: content.length,
      };
    }
  }

  private isBinaryFile(filePath: string): boolean {
    const binaryExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".bmp",
      ".ico",
      ".svg",
      ".pdf",
      ".zip",
      ".tar",
      ".gz",
      ".7z",
      ".rar",
      ".exe",
      ".dll",
      ".so",
      ".dylib",
      ".mp3",
      ".mp4",
      ".avi",
      ".mov",
      ".wav",
      ".ttf",
      ".otf",
      ".woff",
      ".woff2",
      ".bin",
      ".dat",
      ".db",
      ".sqlite",
    ];

    const extension = "." + filePath.split(".").pop()?.toLowerCase();
    return binaryExtensions.includes(extension);
  }

  private calculateComplexity(content: string): number {
    const language = this.detectLanguageFromContent(content);

    // Language-specific complexity patterns
    const patterns = this.getComplexityPatterns(language);

    let complexity = 1; // Base complexity

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private getComplexityPatterns(language: string): RegExp[] {
    const basePatterns = [
      /\?.*:/g, // Ternary operators
    ];

    switch (language) {
      case "javascript":
      case "typescript":
        return [
          ...basePatterns,
          /if\s*\(/g,
          /else\s+if\s*\(/g,
          /while\s*\(/g,
          /for\s*\(/g,
          /catch\s*\(/g,
          /case\s+.*:/g,
          /&&|\|\|/g,
          /switch\s*\(/g,
        ];

      case "python":
        return [
          ...basePatterns,
          /if\s+.*:/g,
          /elif\s+.*:/g,
          /while\s+.*:/g,
          /for\s+.*:/g,
          /except\s*:/g,
          /except\s+\w+.*:/g,
          /and|or/g,
        ];

      case "java":
      case "csharp":
        return [
          ...basePatterns,
          /if\s*\(/g,
          /else\s+if\s*\(/g,
          /while\s*\(/g,
          /for\s*\(/g,
          /catch\s*\(/g,
          /case\s+.*:/g,
          /&&|\|\|/g,
          /switch\s*\(/g,
        ];

      case "go":
        return [
          ...basePatterns,
          /if\s+.*{/g,
          /for\s+.*{/g,
          /switch\s+.*{/g,
          /case\s+.*:/g,
          /&&|\|\|/g,
        ];

      case "rust":
        return [
          ...basePatterns,
          /if\s+.*{/g,
          /while\s+.*{/g,
          /for\s+.*{/g,
          /match\s+.*{/g,
          /&&|\|\|/g,
        ];

      default:
        return basePatterns;
    }
  }

  private extractFunctions(
    content: string,
    filePath: string
  ): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    const language = this.detectLanguage(filePath);

    try {
      if (language === "javascript" || language === "typescript") {
        functions.push(...this.extractJavaScriptFunctions(content));
      } else if (language === "python") {
        functions.push(...this.extractPythonFunctions(content));
      } else if (language === "java") {
        functions.push(...this.extractJavaFunctions(content));
      } else if (language === "csharp") {
        functions.push(...this.extractCSharpFunctions(content));
      } else if (language === "go") {
        functions.push(...this.extractGoFunctions(content));
      } else if (language === "rust") {
        functions.push(...this.extractRustFunctions(content));
      } else if (language === "php") {
        functions.push(...this.extractPhpFunctions(content));
      } else if (language === "ruby") {
        functions.push(...this.extractRubyFunctions(content));
      }
    } catch (error) {
      console.error(`Error extracting functions from ${filePath}:`, error);
    }

    return functions;
  }

  private extractJavaScriptFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Function declarations: function name() {}
    const functionDeclarations =
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g;
    let match;
    while ((match = functionDeclarations.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
      });
    }

    // Arrow functions: const name = () => {}
    const arrowFunctions =
      /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/g;
    while ((match = arrowFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractArrowFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
      });
    }

    // Method definitions: methodName() {}
    const methods =
      /(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*{/g;
    while ((match = methods.exec(content)) !== null) {
      const methodName = match[1];
      const params = this.parseParameters(match[2]);
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const methodBody = this.extractFunctionBody(content, match.index);

      // Skip constructor and common keywords
      if (
        !["if", "for", "while", "switch", "catch", "constructor"].includes(
          methodName
        )
      ) {
        functions.push({
          name: methodName,
          line: lineNumber,
          complexity: this.calculateComplexity(methodBody),
          parameters: params,
        });
      }
    }

    return functions;
  }

  private extractPythonFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Python function definitions: def name():
    const pythonFunctions =
      /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)(?:\s*->\s*([^:]+))?:/g;
    let match;
    while ((match = pythonFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const returnType = match[3]?.trim();
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractPythonFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractJavaFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Java method definitions
    const javaMethods =
      /(?:public|private|protected|static|\s)*\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*{/g;
    let match;
    while ((match = javaMethods.exec(content)) !== null) {
      const returnType = match[1];
      const methodName = match[2];
      const params = this.parseParameters(match[3]);
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const methodBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: methodName,
        line: lineNumber,
        complexity: this.calculateComplexity(methodBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractCSharpFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // C# method definitions
    const csharpMethods =
      /(?:public|private|protected|internal|static|\s)*\s+(\w+)\s+(\w+)\s*\(([^)]*)\)\s*{/g;
    let match;
    while ((match = csharpMethods.exec(content)) !== null) {
      const returnType = match[1];
      const methodName = match[2];
      const params = this.parseParameters(match[3]);
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const methodBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: methodName,
        line: lineNumber,
        complexity: this.calculateComplexity(methodBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractGoFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Go function definitions: func name() type {}
    const goFunctions =
      /func\s+(?:\([^)]*\)\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?:\(([^)]*)\)|(\w+))?\s*{/g;
    let match;
    while ((match = goFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const returnType = match[3] || match[4];
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractRustFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Rust function definitions: fn name() -> type {}
    const rustFunctions =
      /fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?:->\s*([^{]+))?\s*{/g;
    let match;
    while ((match = rustFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const returnType = match[3]?.trim();
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractPhpFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // PHP function definitions: function name() {}
    const phpFunctions =
      /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*{/g;
    let match;
    while ((match = phpFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2]);
      const returnType = match[3]?.trim();
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
        returnType,
      });
    }

    return functions;
  }

  private extractRubyFunctions(content: string): Array<{
    name: string;
    line: number;
    complexity: number;
    parameters: string[];
    returnType?: string;
  }> {
    const functions: Array<{
      name: string;
      line: number;
      complexity: number;
      parameters: string[];
      returnType?: string;
    }> = [];

    // Ruby method definitions: def name() end
    const rubyFunctions =
      /def\s+([a-zA-Z_][a-zA-Z0-9_]*[!?]?)\s*(?:\(([^)]*)\))?\s*$/gm;
    let match;
    while ((match = rubyFunctions.exec(content)) !== null) {
      const functionName = match[1];
      const params = this.parseParameters(match[2] || "");
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const functionBody = this.extractRubyFunctionBody(content, match.index);

      functions.push({
        name: functionName,
        line: lineNumber,
        complexity: this.calculateComplexity(functionBody),
        parameters: params,
      });
    }

    return functions;
  }

  private extractImports(
    content: string,
    filePath: string
  ): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    const language = this.detectLanguage(filePath);

    try {
      if (language === "javascript" || language === "typescript") {
        imports.push(...this.extractJavaScriptImports(content));
      } else if (language === "python") {
        imports.push(...this.extractPythonImports(content));
      } else if (language === "java") {
        imports.push(...this.extractJavaImports(content));
      } else if (language === "csharp") {
        imports.push(...this.extractCSharpImports(content));
      } else if (language === "go") {
        imports.push(...this.extractGoImports(content));
      } else if (language === "rust") {
        imports.push(...this.extractRustImports(content));
      }
    } catch (error) {
      console.error(`Error extracting imports from ${filePath}:`, error);
    }

    return imports;
  }

  private extractJavaScriptImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // ES6 imports: import { ... } from '...'
    const es6Imports =
      /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = es6Imports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const module = match[4];
      let importedItems: string[] = [];

      if (match[1]) {
        // Named imports: { item1, item2 }
        importedItems = match[1].split(",").map((item: string) => item.trim());
      } else if (match[2]) {
        // Namespace import: * as name
        importedItems = [match[2]];
      } else if (match[3]) {
        // Default import
        importedItems = [match[3]];
      }

      imports.push({
        module,
        imports: importedItems,
        line: lineNumber,
      });
    }

    // CommonJS require: const ... = require('...')
    const requireImports =
      /(?:const|let|var)\s+(?:{([^}]+)}|(\w+))\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    while ((match = requireImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const module = match[3];
      let importedItems: string[] = [];

      if (match[1]) {
        // Destructured require: { item1, item2 }
        importedItems = match[1].split(",").map((item: string) => item.trim());
      } else if (match[2]) {
        // Direct require
        importedItems = [match[2]];
      }

      imports.push({
        module,
        imports: importedItems,
        line: lineNumber,
      });
    }

    return imports;
  }

  private extractPythonImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // Python imports: import module, from module import item
    const pythonImports = /(?:^|\n)\s*(?:from\s+(\S+)\s+)?import\s+([^\n]+)/g;
    let match;
    while ((match = pythonImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const module = match[1] || match[2].split(",")[0].trim();
      const importedItems = match[2]
        .split(",")
        .map((item: string) => item.trim());

      imports.push({
        module,
        imports: importedItems,
        line: lineNumber,
      });
    }

    return imports;
  }

  private extractJavaImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // Java imports: import package.Class;
    const javaImports = /import\s+(?:static\s+)?([^;]+);/g;
    let match;
    while ((match = javaImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const fullImport = match[1].trim();
      const parts = fullImport.split(".");
      const className = parts[parts.length - 1];
      const packageName = parts.slice(0, -1).join(".");

      imports.push({
        module: packageName,
        imports: [className],
        line: lineNumber,
      });
    }

    return imports;
  }

  private extractCSharpImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // C# using statements: using System.Collections;
    const csharpImports = /using\s+([^;]+);/g;
    let match;
    while ((match = csharpImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const namespace = match[1].trim();

      imports.push({
        module: namespace,
        imports: [namespace.split(".").pop() || namespace],
        line: lineNumber,
      });
    }

    return imports;
  }

  private extractGoImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // Go imports: import "package" or import ( "package1" "package2" )
    const goImports = /import\s+(?:"([^"]+)"|(\([^)]+\)))/g;
    let match;
    while ((match = goImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;

      if (match[1]) {
        // Single import
        const packageName = match[1];
        imports.push({
          module: packageName,
          imports: [packageName.split("/").pop() || packageName],
          line: lineNumber,
        });
      } else if (match[2]) {
        // Multiple imports
        const importBlock = match[2].slice(1, -1); // Remove parentheses
        const packageMatches = importBlock.match(/"([^"]+)"/g);
        if (packageMatches) {
          packageMatches.forEach((pkg) => {
            const packageName = pkg.slice(1, -1); // Remove quotes
            imports.push({
              module: packageName,
              imports: [packageName.split("/").pop() || packageName],
              line: lineNumber,
            });
          });
        }
      }
    }

    return imports;
  }

  private extractRustImports(content: string): Array<{
    module: string;
    imports: string[];
    line: number;
  }> {
    const imports: Array<{
      module: string;
      imports: string[];
      line: number;
    }> = [];

    // Rust use statements: use std::collections::HashMap;
    const rustImports = /use\s+([^;]+);/g;
    let match;
    while ((match = rustImports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const importPath = match[1].trim();
      const parts = importPath.split("::");
      const itemName = parts[parts.length - 1];
      const moduleName = parts.slice(0, -1).join("::");

      imports.push({
        module: moduleName || importPath,
        imports: [itemName],
        line: lineNumber,
      });
    }

    return imports;
  }

  private extractExports(
    content: string,
    filePath: string
  ): Array<{
    name: string;
    type: "default" | "named";
    line: number;
  }> {
    const exports: Array<{
      name: string;
      type: "default" | "named";
      line: number;
    }> = [];

    const language = this.detectLanguage(filePath);

    try {
      if (language === "javascript" || language === "typescript") {
        exports.push(...this.extractJavaScriptExports(content));
      }
      // Other languages don't typically have exports in the same way
    } catch (error) {
      console.error(`Error extracting exports from ${filePath}:`, error);
    }

    return exports;
  }

  private extractJavaScriptExports(content: string): Array<{
    name: string;
    type: "default" | "named";
    line: number;
  }> {
    const exports: Array<{
      name: string;
      type: "default" | "named";
      line: number;
    }> = [];

    // Default exports: export default ...
    const defaultExports =
      /export\s+default\s+(?:class\s+(\w+)|function\s+(\w+)|(\w+))/g;
    let match;
    while ((match = defaultExports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      const name = match[1] || match[2] || match[3] || "default";

      exports.push({
        name,
        type: "default",
        line: lineNumber,
      });
    }

    // Named exports: export { ... }, export const/let/var/function/class
    const namedExports =
      /export\s+(?:{([^}]+)}|(?:const|let|var|function|class)\s+(\w+))/g;
    while ((match = namedExports.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;

      if (match[1]) {
        // Export list: { item1, item2 }
        const items = match[1].split(",").map((item: string) => item.trim());
        items.forEach((item) => {
          exports.push({
            name: item,
            type: "named",
            line: lineNumber,
          });
        });
      } else if (match[2]) {
        // Direct export
        exports.push({
          name: match[2],
          type: "named",
          line: lineNumber,
        });
      }
    }

    return exports;
  }

  private detectLanguage(filePath: string): string {
    const extension = filePath.split(".").pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      mjs: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      pyx: "python",
      pyi: "python",
      java: "java",
      cpp: "cpp",
      cxx: "cpp",
      cc: "cpp",
      c: "c",
      h: "c",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      kts: "kotlin",
      scala: "scala",
      sc: "scala",
      html: "html",
      htm: "html",
      css: "css",
      scss: "scss",
      sass: "sass",
      less: "less",
      json: "json",
      xml: "xml",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown",
      markdown: "markdown",
      sh: "shell",
      bash: "shell",
      zsh: "shell",
      fish: "shell",
      sql: "sql",
      r: "r",
      R: "r",
      pl: "perl",
      pm: "perl",
      lua: "lua",
      dart: "dart",
      vue: "vue",
      svelte: "svelte",
    };

    return languageMap[extension || ""] || "text";
  }

  private detectLanguageFromContent(content: string): string {
    // Try to detect language from content patterns
    if (/^#!/.test(content)) {
      if (/python/.test(content)) return "python";
      if (/node|javascript/.test(content)) return "javascript";
      if (/bash|sh/.test(content)) return "shell";
    }

    if (/import\s+.*from/.test(content) || /export\s+/.test(content)) {
      return "javascript";
    }

    if (/def\s+\w+\s*\(/.test(content) || /import\s+\w+/.test(content)) {
      return "python";
    }

    return "text";
  }

  private parseParameters(paramString: string): string[] {
    if (!paramString.trim()) return [];

    return paramString
      .split(",")
      .map((param: string) => {
        // Remove type annotations for TypeScript/Java/C#
        const cleanParam = param.trim().split(":")[0].trim();
        // Remove default values
        return cleanParam.split("=")[0].trim();
      })
      .filter((param: string) => param.length > 0);
  }

  private extractFunctionBody(content: string, startIndex: number): string {
    let braceCount = 0;
    let i = startIndex;
    let foundFirstBrace = false;

    while (i < content.length) {
      if (content[i] === "{") {
        braceCount++;
        foundFirstBrace = true;
      } else if (content[i] === "}") {
        braceCount--;
        if (foundFirstBrace && braceCount === 0) {
          return content.substring(startIndex, i + 1);
        }
      }
      i++;
    }

    return content.substring(startIndex);
  }

  private extractArrowFunctionBody(
    content: string,
    startIndex: number
  ): string {
    let i = startIndex;

    // Find the arrow
    while (i < content.length && content.substring(i, i + 2) !== "=>") {
      i++;
    }
    i += 2; // Skip '=>'

    // Skip whitespace
    while (i < content.length && /\s/.test(content[i])) {
      i++;
    }

    if (content[i] === "{") {
      // Block body
      return this.extractFunctionBody(content, i);
    } else {
      // Expression body - find end of line or semicolon
      const start = i;
      while (i < content.length && content[i] !== "\n" && content[i] !== ";") {
        i++;
      }
      return content.substring(start, i);
    }
  }

  private extractPythonFunctionBody(
    content: string,
    startIndex: number
  ): string {
    const lines = content.split("\n");
    const startLine = content.substring(0, startIndex).split("\n").length - 1;
    let functionBody = "";
    let baseIndentation = -1;

    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === "") continue;

      const indentation = line.length - line.trimStart().length;

      if (baseIndentation === -1 && trimmedLine !== "") {
        baseIndentation = indentation;
      }

      if (indentation < baseIndentation && trimmedLine !== "") {
        break;
      }

      functionBody += line + "\n";
    }

    return functionBody;
  }

  private extractRubyFunctionBody(content: string, startIndex: number): string {
    const lines = content.split("\n");
    const startLine = content.substring(0, startIndex).split("\n").length - 1;
    let functionBody = "";
    let foundEnd = false;

    for (let i = startLine + 1; i < lines.length && !foundEnd; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === "end") {
        foundEnd = true;
        break;
      }

      functionBody += line + "\n";
    }

    return functionBody;
  }
}
