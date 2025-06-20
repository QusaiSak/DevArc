export interface ParsedFile {
  path: string
  content: string
  lines: number
  complexity: number
  functions: Array<{
    name: string
    line: number
    complexity: number
    parameters: string[]
    returnType?: string
  }>
  imports: Array<{
    module: string
    imports: string[]
    line: number
  }>
  exports: Array<{
    name: string
    type: 'default' | 'named'
    line: number
  }>
  language: string
  size: number
}

export interface CodeStructure {
  totalFiles: number
  totalLines: number
  languages: Record<string, number>
  testCoverage: number
  complexity: {
    average: number
    max: number
    min: number
  }
  patterns: {
    architecture: string
    framework: string[]
  }
  issues: Array<{
    file: string
    line: number
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
}

export interface ProjectStructure {
  totalFiles: number
  totalLines: number
  languages: Record<string, number>
  complexity: {
    average: number
    max: number
    min: number
  }
  testCoverage: number
  issues: CodeIssue[]
  directories: DirectoryInfo[]
  patterns: {
    architecture: string
    framework: string[]
    patterns: string[]
  }
  files: ParsedFile[]
}

export interface DirectoryInfo {
  name: string
  path: string
  type: 'source' | 'test' | 'documentation' | 'configuration' | 'assets' | 'build' | 'scripts' | 'other'
  purpose: string
}

export interface CodeIssue {
  type: string
  severity: 'error' | 'warning' | 'info' | 'low' | 'medium' | 'high'
  message: string
  file: string
  line: number
}