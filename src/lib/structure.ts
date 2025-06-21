import { type ParsedFile, type ProjectStructure, type DirectoryInfo, type CodeIssue } from "@/types/codeparser.interface"
import { type GitHubFile } from "@/types/github.interface"
import { CodeParser } from "./code-parser"
import { GitHubService } from "./github"

export class StructureAnalyzer {
  private codeParser: CodeParser
  private githubService: GitHubService

  constructor(githubToken?: string) {
    this.codeParser = new CodeParser()
    this.githubService = new GitHubService(githubToken)
  }

  async analyzeRepository(owner: string, repo: string): Promise<ProjectStructure> {
    console.log(`Starting analysis of ${owner}/${repo}`)

    try {
      // Get repository structure
      const files = await this.githubService.getRepositoryStructure(owner, repo)
      console.log(`Total files found: ${files.length}`)
      
      // Debug: Log first few files
      console.log('Sample files:', files.slice(0, 10).map(f => ({ name: f.name, type: f.type, size: f.size })))
      
      const codeFiles = files.filter(
        (file) => {
          // More inclusive filtering
          const isFile = file.type === "file" || file.type === "blob"
          const fileName = file.path || file.name
          const notIgnored = !this.isIgnoredFile(fileName)
          const hasSize = file.size !== undefined && file.size !== null && file.size > 0
          const notTooLarge = !file.size || file.size < 2000000 // 2MB limit
          const notBinary = !this.isBinaryFile(file.name)
          
          const shouldInclude = isFile && notIgnored && hasSize && notTooLarge && notBinary
          
          // Debug logging for first few files
          if (files.indexOf(file) < 5) {
            console.log(`File: ${file.name}, isFile: ${isFile}, notIgnored: ${notIgnored}, hasSize: ${hasSize}, notTooLarge: ${notTooLarge}, notBinary: ${notBinary}, shouldInclude: ${shouldInclude}`)
          }
          
          return shouldInclude
        }
      )

      console.log(`Found ${codeFiles.length} code files to analyze`)
      
      // Debug: Log first few code files
      if (codeFiles.length > 0) {
        console.log('Sample code files:', codeFiles.slice(0, 5).map(f => ({ name: f.name, path: f.path, size: f.size })))
      }

      // Parse each file
      const parsedFiles: ParsedFile[] = []
      const batchSize = 5 // Reduced batch size for better error handling

      for (let i = 0; i < codeFiles.length; i += batchSize) {
        const batch = codeFiles.slice(i, i + batchSize)
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(codeFiles.length / batchSize)}`)

        const batchPromises = batch.map(async (file) => {
          try {
            const content = await this.githubService.getFileContent(owner, repo, file.path)
            if (content && content.length > 0) {
              const parsed = this.codeParser.parseFile(file.path, content)
              console.log(`Successfully parsed ${file.path}: ${parsed.lines} lines, ${parsed.functions.length} functions`)
              return parsed
            }
            console.log(`Skipping ${file.path}: empty content`)
            return null
          } catch (error) {
            console.warn(`Failed to parse ${file.path}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        const validResults = batchResults.filter((result): result is ParsedFile => result !== null)
        parsedFiles.push(...validResults)

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < codeFiles.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      console.log(`Successfully parsed ${parsedFiles.length} files`)

      // Build project structure
      return this.buildProjectStructure(parsedFiles, files)
    } catch (error) {
      console.error(`Error analyzing repository ${owner}/${repo}:`, error)
      throw error
    }
  }

  private isBinaryFile(fileName: string): boolean {
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
      '.pdf', '.zip', '.tar', '.gz', '.7z', '.rar', '.exe', '.dll',
      '.mp3', '.mp4', '.avi', '.mov', '.wav', '.flv', '.mkv',
      '.ttf', '.otf', '.woff', '.woff2', '.eot',
      '.bin', '.dat', '.db', '.sqlite', '.pyc', '.class'
    ]
    
    return binaryExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  private isIgnoredFile(fileName: string): boolean {
    const ignoredExtensions = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".pdf", ".zip", ".tar", ".gz"]
    const ignoredFiles = ["package-lock.json", "yarn.lock", ".DS_Store", "Thumbs.db"]
    const ignoredDirs = ["node_modules", ".git", "dist", "build", ".next", "coverage", "__pycache__"]

    // Don't ignore if it's a code file we want to analyze
    const codeExtensions = [
      ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".cpp", ".c", ".cs", 
      ".php", ".rb", ".go", ".rs", ".swift", ".kt", ".scala", ".html", 
      ".css", ".scss", ".sass", ".less", ".vue", ".svelte", ".json", 
      ".xml", ".yaml", ".yml", ".md", ".sql", ".sh", ".bash", ".dockerfile"
    ]
    
    const hasCodeExtension = codeExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
    
    // If it's a code file, only ignore if it's in an ignored directory
    if (hasCodeExtension) {
      return ignoredDirs.some((dir) => fileName.includes(dir))
    }

    return (
      ignoredExtensions.some((ext) => fileName.toLowerCase().endsWith(ext)) ||
      ignoredFiles.includes(fileName) ||
      ignoredDirs.some((dir) => fileName.includes(dir))
    )
  }

  private buildProjectStructure(parsedFiles: ParsedFile[], allFiles: GitHubFile[]): ProjectStructure {
    // Calculate metrics
    const totalFiles = parsedFiles.length
    const totalLines = parsedFiles.reduce((sum, file) => sum + file.lines, 0)

    // Language analysis
    const languages: Record<string, number> = {}
    parsedFiles.forEach((file) => {
      const ext = file.path.split(".").pop()?.toLowerCase()
      if (ext) {
        const lang = this.getLanguageFromExtension(ext)
        languages[lang] = (languages[lang] || 0) + file.lines
      }
    })

    // Complexity analysis
    const complexities = parsedFiles.map((file) => file.complexity).filter((c) => c > 0)
    const complexity = {
      average: complexities.length > 0 ? complexities.reduce((a, b) => a + b, 0) / complexities.length : 0,
      max: complexities.length > 0 ? Math.max(...complexities) : 0,
      min: complexities.length > 0 ? Math.min(...complexities) : 0,
    }

    // Test coverage analysis
    const testFiles = parsedFiles.filter(
      (file) =>
        file.path.includes("test") ||
        file.path.includes("spec") ||
        file.path.includes("__tests__") ||
        file.path.includes(".test.") ||
        file.path.includes(".spec.")
    )
    const testCoverage = totalFiles > 0 ? (testFiles.length / totalFiles) * 100 : 0

    // Issues analysis
    const issues: CodeIssue[] = []
    parsedFiles.forEach((file) => {
      if (file.complexity > 15) {
        issues.push({
          type: "complexity",
          severity: file.complexity > 25 ? "high" : "medium",
          message: `High complexity (${file.complexity}) in ${file.path}`,
          file: file.path,
          line: 1,
        })
      }
      if (file.lines > 500) {
        issues.push({
          type: "maintainability",
          severity: file.lines > 1000 ? "medium" : "low",
          message: `Large file (${file.lines} lines): ${file.path}`,
          file: file.path,
          line: 1,
        })
      }
      if (file.functions.length > 20) {
        issues.push({
          type: "maintainability",
          severity: "low",
          message: `Many functions (${file.functions.length}) in ${file.path}`,
          file: file.path,
          line: 1,
        })
      }
    })

    // Directory structure analysis
    const directories = this.analyzeDirectoryStructure(allFiles)

    // Architecture patterns
    const patterns = this.detectArchitecturePatterns(parsedFiles, allFiles)

    return {
      totalFiles,
      totalLines,
      languages,
      complexity,
      testCoverage: Math.round(testCoverage),
      issues,
      directories,
      patterns,
      files: parsedFiles,
    }
  }

  private getLanguageFromExtension(ext: string): string {
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "JavaScript",
      ts: "TypeScript",
      tsx: "TypeScript",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      cs: "C#",
      php: "PHP",
      rb: "Ruby",
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      dart: "Dart",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "Sass",
      less: "Less",
      vue: "Vue",
      svelte: "Svelte",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
      yml: "YAML",
      md: "Markdown",
      sql: "SQL",
      sh: "Shell",
      bash: "Bash",
      dockerfile: "Dockerfile",
    }
    return languageMap[ext] || "Other"
  }

  private analyzeDirectoryStructure(files: GitHubFile[]): DirectoryInfo[] {
    const directories = new Map<string, DirectoryInfo>()

    files.forEach((file) => {
      if (file.type === "dir" || file.type === "tree") {
        const dirInfo: DirectoryInfo = {
          name: file.name,
          path: file.path,
          type: this.classifyDirectory(file.path),
          purpose: this.getDirectoryPurpose(file.path),
        }
        directories.set(file.path, dirInfo)
      }
    })

    return Array.from(directories.values())
  }

  private classifyDirectory(path: string): DirectoryInfo["type"] {
    const lowerPath = path.toLowerCase()

    if (lowerPath.includes("src") || lowerPath.includes("source")) return "source"
    if (lowerPath.includes("test") || lowerPath.includes("spec") || lowerPath.includes("__tests__")) return "test"
    if (lowerPath.includes("doc") || lowerPath.includes("documentation") || lowerPath.includes("docs")) return "documentation"
    if (lowerPath.includes("config") || lowerPath.includes("conf") || lowerPath.includes(".config")) return "configuration"
    if (lowerPath.includes("asset") || lowerPath.includes("static") || lowerPath.includes("public") || lowerPath.includes("media")) return "assets"
    if (lowerPath.includes("build") || lowerPath.includes("dist") || lowerPath.includes("output") || lowerPath.includes("target")) return "build"
    if (lowerPath.includes("script") || lowerPath.includes("tool") || lowerPath.includes("bin")) return "scripts"

    return "other"
  }

  private getDirectoryPurpose(path: string): string {
    const lowerPath = path.toLowerCase()

    if (lowerPath.includes("component")) return "UI Components"
    if (lowerPath.includes("service")) return "Business Logic Services"
    if (lowerPath.includes("util") || lowerPath.includes("helper") || lowerPath.includes("lib")) return "Utility Functions"
    if (lowerPath.includes("model") || lowerPath.includes("entity") || lowerPath.includes("schema")) return "Data Models"
    if (lowerPath.includes("controller") || lowerPath.includes("handler") || lowerPath.includes("api")) return "Request Handlers"
    if (lowerPath.includes("middleware")) return "Middleware Functions"
    if (lowerPath.includes("route") || lowerPath.includes("router") || lowerPath.includes("endpoint")) return "Routing Logic"
    if (lowerPath.includes("test") || lowerPath.includes("spec")) return "Test Files"
    if (lowerPath.includes("config") || lowerPath.includes("settings")) return "Configuration Files"
    if (lowerPath.includes("style") || lowerPath.includes("css") || lowerPath.includes("scss")) return "Styling"
    if (lowerPath.includes("asset") || lowerPath.includes("image") || lowerPath.includes("icon")) return "Static Assets"
    if (lowerPath.includes("doc") || lowerPath.includes("readme")) return "Documentation"

    return "General Purpose"
  }

  private detectArchitecturePatterns(parsedFiles: ParsedFile[], allFiles: GitHubFile[]): {
    architecture: string
    framework: string[]
    patterns: string[]
  } {
    const frameworks: string[] = []
    const patterns: string[] = []
    let architecture = "Unknown"

    // Detect frameworks based on file names and imports
    const fileNames = allFiles.map((f) => f.name?.toLowerCase() || "")
    const filePaths = allFiles.map((f) => f.path?.toLowerCase() || "")

    // Package.json analysis for better framework detection
    const hasPackageJson = fileNames.includes("package.json")
    const packageJsonContent = parsedFiles.find(f => f.path.toLowerCase().includes("package.json"))?.content

    // React
    if (fileNames.some((name) => name.endsWith(".jsx") || name.endsWith(".tsx")) ||
        packageJsonContent?.includes('"react"') ||
        parsedFiles.some(f => f.imports.some(imp => imp.module === 'react'))) {
      frameworks.push("React")
    }

    // Vue
    if (fileNames.some((name) => name.endsWith(".vue")) ||
        packageJsonContent?.includes('"vue"')) {
      frameworks.push("Vue.js")
    }

    // Angular
    if (fileNames.some((name) => name.includes("angular") || name.endsWith(".component.ts")) ||
        packageJsonContent?.includes('"@angular/')) {
      frameworks.push("Angular")
    }

    // Next.js
    if (fileNames.includes("next.config.js") || 
        filePaths.some((path) => path.includes("pages") || path.includes("app")) ||
        packageJsonContent?.includes('"next"')) {
      frameworks.push("Next.js")
    }

    // Node.js/Express
    if (hasPackageJson || filePaths.some((path) => path.includes("node_modules"))) {
      frameworks.push("Node.js")
    }

    // Vite
    if (fileNames.includes("vite.config.js") || fileNames.includes("vite.config.ts") ||
        packageJsonContent?.includes('"vite"')) {
      frameworks.push("Vite")
    }

    // Spring Boot (Java)
    if (fileNames.includes("pom.xml") || fileNames.includes("build.gradle") ||
        parsedFiles.some(f => f.imports.some(imp => imp.module.includes('springframework')))) {
      frameworks.push("Spring Boot")
    }

    // Django (Python)
    if (fileNames.includes("manage.py") || fileNames.includes("wsgi.py") ||
        parsedFiles.some(f => f.imports.some(imp => imp.module === 'django'))) {
      frameworks.push("Django")
    }

    // Flask (Python)
    if (parsedFiles.some(f => f.imports.some(imp => imp.module === 'flask'))) {
      frameworks.push("Flask")
    }

    // Go frameworks
    if (fileNames.includes("go.mod") || fileNames.includes("go.sum")) {
      frameworks.push("Go")
    }

    // Rust frameworks
    if (fileNames.includes("cargo.toml")) {
      frameworks.push("Rust")
    }

    // Detect architecture patterns
    if (filePaths.some((path) => path.includes("components") && path.includes("pages"))) {
      architecture = "Component-Based"
      patterns.push("Component Architecture")
    }

    if (filePaths.some((path) => path.includes("controllers") && path.includes("models") && path.includes("views"))) {
      architecture = "MVC"
      patterns.push("Model-View-Controller")
    }

    if (filePaths.some((path) => path.includes("services") && path.includes("components"))) {
      patterns.push("Service Layer Pattern")
    }

    if (filePaths.some((path) => path.includes("store") || path.includes("redux") || path.includes("vuex"))) {
      patterns.push("State Management")
    }

    if (filePaths.some((path) => path.includes("middleware"))) {
      patterns.push("Middleware Pattern")
    }

    if (filePaths.some((path) => path.includes("api") || path.includes("routes"))) {
      patterns.push("REST API")
    }

    if (filePaths.some((path) => path.includes("graphql"))) {
      patterns.push("GraphQL")
    }

    // Microservices pattern
    if (filePaths.filter((path) => path.includes("service")).length > 3) {
      patterns.push("Microservices")
    }

    // Clean Architecture
    if (filePaths.some((path) => path.includes("domain") && path.includes("infrastructure") && path.includes("application"))) {
      architecture = "Clean Architecture"
      patterns.push("Clean Architecture")
    }

    return {
      architecture,
      framework: frameworks,
      patterns,
    }
  }
}
