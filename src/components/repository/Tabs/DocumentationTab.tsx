import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Loader2,
  BookOpen,
  Copy,
  FileCode,
  Folder,
  Network,
  Code,
  Lightbulb,
  CheckCircle,
  Settings,
  Zap,
  Target,
  FileX,
  Globe,
  Layers,
  GitBranch,
  Workflow,
  Play,
} from "lucide-react";
import MermaidDiagram from "@/components/repository/helper/MermaidDiagram";
import type { ComprehensiveDocumentation } from "@/types/codeparser.interface";

interface DocumentationTabProps {
  documentation?: ComprehensiveDocumentation;
  generatingDocs: boolean;
  onGenerateDocumentation: () => void;
  onStoreAnalysis: () => void;
  onExportToWord: (documentation: ComprehensiveDocumentation) => void;
  hasAnalysisData: boolean;
}

export const DocumentationTab: React.FC<DocumentationTabProps> = ({
  documentation,
  generatingDocs,
  onGenerateDocumentation,
  onStoreAnalysis,
  onExportToWord,
  hasAnalysisData,
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const formatCode = (code: string): string => {
    if (!code) return "";

    return code
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\{/g, " {\n  ")
      .replace(/\}/g, "\n}")
      .replace(/;/g, ";\n  ")
      .replace(/,/g, ",\n  ")
      .replace(/\n\s*\n/g, "\n")
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        let indent = "";
        if (trimmed.startsWith("}")) {
          indent = "";
        } else if (trimmed.includes("{")) {
          indent = "";
        } else {
          indent = "  ";
        }

        return indent + trimmed;
      })
      .filter((line) => line.length > 0)
      .join("\n");
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "POST":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getDirectoryTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "source":
        return <Code className="w-4 h-4 text-blue-500" />;
      case "config":
        return <Settings className="w-4 h-4 text-gray-500" />;
      case "test":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "docs":
        return <FileText className="w-4 h-4 text-purple-500" />;
      case "assets":
        return <FileX className="w-4 h-4 text-orange-500" />;
      default:
        return <Folder className="w-4 h-4 text-primary" />;
    }
  };

  // This is the view when documentation has been generated
  if (documentation) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Generated Documentation
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onExportToWord(documentation)}
                  size="sm"
                  variant="outline"
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to Word
                </Button>
                <Button
                  onClick={onStoreAnalysis}
                  size="sm"
                  variant="secondary"
                  className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Store All Data
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="text-base">
              Comprehensive documentation generated with AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Project Summary */}
            {documentation.summary && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Project Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-foreground leading-relaxed">
                    {documentation.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Architecture Overview */}
            {documentation.architecture && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Architecture Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                    <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Pattern
                    </h4>
                    <p className="text-muted-foreground">
                      {documentation.architecture.pattern}
                    </p>
                  </div>
                  {documentation.architecture.description && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Description
                      </h4>
                      <p className="text-muted-foreground">
                        {documentation.architecture.description}
                      </p>
                    </div>
                  )}
                  {documentation.architecture.technologies && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {documentation.architecture.technologies.map(
                          (tech, index) => (
                            <Badge
                              key={index}
                              className="px-3 py-1 bg-primary/10 text-primary border-primary/20"
                            >
                              {tech}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {documentation.architecture.layers &&
                    documentation.architecture.layers.length > 0 && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                          Architecture Layers
                        </h4>
                        <div className="space-y-3">
                          {documentation.architecture.layers.map(
                            (layer, index) => (
                              <div
                                key={index}
                                className="p-3 bg-background/50 rounded border border-border/20"
                              >
                                <h5 className="font-medium text-foreground mb-1">
                                  {layer.name}
                                </h5>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {layer.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {layer.components.map(
                                    (component, compIndex) => (
                                      <Badge
                                        key={compIndex}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {component}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Mermaid Diagram */}
            {documentation.mermaidDiagram && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-primary" />
                    Architecture Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                    <MermaidDiagram chart={documentation.mermaidDiagram} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Folder Structure */}
            {documentation.folderStructure && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-primary" />
                    Folder Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {documentation.folderStructure.tree && (
                    <div className="relative mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          Directory Tree
                        </span>
                        <Button
                          onClick={() =>
                            copyToClipboard(documentation.folderStructure.tree)
                          }
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-slate-900 rounded-lg border border-border/30 p-5 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                        <pre className="text-slate-100 whitespace-pre-wrap">
                          {documentation.folderStructure.tree}
                        </pre>
                      </div>
                    </div>
                  )}
                  {documentation.folderStructure.directories &&
                    documentation.folderStructure.directories.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          Directory Details
                        </h4>
                        <div className="grid gap-3">
                          {documentation.folderStructure.directories.map(
                            (dir, index) => (
                              <div
                                key={index}
                                className="p-4 bg-secondary/50 rounded-lg border border-border/30 border-l-4 border-l-primary hover:bg-secondary/60 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  {getDirectoryTypeIcon(dir.type)}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                        {dir.path}
                                      </code>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {dir.fileCount} files
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1 font-medium">
                                      {dir.purpose}
                                    </p>
                                    <p className="text-sm text-foreground/80">
                                      {dir.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Code Internals */}
            {documentation.codeInternals && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Code Internals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {documentation.codeInternals.codeFlow && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                      <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                        <Workflow className="w-4 h-4 text-primary" />
                        Code Flow
                      </h4>
                      <p className="text-muted-foreground">
                        {documentation.codeInternals.codeFlow}
                      </p>
                    </div>
                  )}

                  {documentation.codeInternals.keyAlgorithms &&
                    documentation.codeInternals.keyAlgorithms.length > 0 && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          Key Algorithms
                        </h4>
                        <div className="space-y-3">
                          {documentation.codeInternals.keyAlgorithms.map(
                            (algorithm, index) => (
                              <div
                                key={index}
                                className="p-3 bg-background/50 rounded border border-border/20"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-foreground">
                                    {algorithm.name}
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    {algorithm.complexity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {algorithm.description}
                                </p>
                                <p className="text-xs text-muted-foreground/80 font-mono">
                                  File: {algorithm.file}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {documentation.codeInternals.designPatterns &&
                    documentation.codeInternals.designPatterns.length > 0 && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          Design Patterns
                        </h4>
                        <div className="space-y-3">
                          {documentation.codeInternals.designPatterns.map(
                            (pattern, index) => (
                              <div
                                key={index}
                                className="p-3 bg-background/50 rounded border border-border/20"
                              >
                                <h5 className="font-medium text-foreground mb-1">
                                  {pattern.pattern}
                                </h5>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {pattern.description}
                                </p>
                                <p className="text-sm text-foreground/80 mb-2">
                                  {pattern.usage}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {pattern.files.map((file, fileIndex) => (
                                    <Badge
                                      key={fileIndex}
                                      variant="outline"
                                      className="text-xs font-mono"
                                    >
                                      {file}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Components */}
            {documentation.components &&
              documentation.components.length > 0 && (
                <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                  <CardHeader className="pb-4 border-b border-border/20">
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-primary" />
                      Components ({documentation.components.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {documentation.components.map((component, index) => (
                        <div
                          key={index}
                          className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-primary" />
                              {component.name}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {component.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                            {component.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
                            <span className="font-mono">
                              File: {component.file}
                            </span>
                            {component.dependencies &&
                              component.dependencies.length > 0 && (
                                <span>
                                  Dependencies: {component.dependencies.length}
                                </span>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* API Endpoints */}
            {documentation.apis && documentation.apis.length > 0 && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    API Endpoints ({documentation.apis.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {documentation.apis.map((api, index) => (
                      <div
                        key={index}
                        className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={`font-mono text-xs border ${getMethodColor(
                              api.method
                            )}`}
                          >
                            {api.method}
                          </Badge>
                          <code className="font-mono text-sm text-foreground bg-muted px-2 py-1 rounded">
                            {api.endpoint}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {api.description}
                        </p>
                        {api.parameters && api.parameters.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground/80">
                              Parameters: {api.parameters.length}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SDLC Guide */}
            {documentation.sdlc && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    SDLC Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {documentation.sdlc.setupInstructions &&
                    documentation.sdlc.setupInstructions.length > 0 && (
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                          <Play className="w-4 h-4 text-primary" />
                          Setup Instructions
                        </h4>
                        <div className="space-y-3">
                          {documentation.sdlc.setupInstructions.map(
                            (instruction, index) => (
                              <div
                                key={index}
                                className="p-3 bg-background/50 rounded border border-border/20"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    Step {instruction.step}
                                  </Badge>
                                  <h5 className="font-medium text-foreground">
                                    {instruction.title}
                                  </h5>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {instruction.description}
                                </p>
                                {instruction.commands &&
                                  instruction.commands.length > 0 && (
                                    <div className="bg-slate-900 rounded border p-3 mt-2">
                                      {instruction.commands.map(
                                        (command, cmdIndex) => (
                                          <code
                                            key={cmdIndex}
                                            className="text-slate-100 text-xs block font-mono"
                                          >
                                            {command}
                                          </code>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Usage Examples */}
            {documentation.examples && documentation.examples.length > 0 && (
              <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="pb-4 border-b border-border/20">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Usage Examples
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-6">
                    {documentation.examples.map((example, index) => (
                      <div key={index} className="space-y-3">
                        <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                          <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            {example.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {example.description}
                          </p>
                        </div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">
                              Code Example
                            </span>
                            <Button
                              onClick={() =>
                                copyToClipboard(formatCode(example.code))
                              }
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="bg-slate-900 rounded-lg border border-border/30 p-5 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                            <pre className="text-slate-100 whitespace-pre-wrap">
                              {formatCode(example.code)}
                            </pre>
                          </div>
                        </div>
                        {example.explanation && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <span>
                                <strong>Explanation:</strong>{" "}
                                {example.explanation}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // This is the initial empty state before generation
  return (
    <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
      <CardContent className="pt-6">
        <div className="text-center py-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl"></div>
            </div>
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border border-border/30">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Generate Documentation
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Generate comprehensive documentation with code internals, SDLC
            guide, architecture diagrams, and detailed component analysis.
          </p>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={onGenerateDocumentation}
              disabled={generatingDocs}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {generatingDocs ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Documentation...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>

            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="secondary"
                size="lg"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-5 h-5 mr-2" />
                Store Analysis Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
