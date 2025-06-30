import { useMemo, memo } from "react";
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
  Workflow,
  Cpu,
  Database,
  Users,
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

export const DocumentationTab = memo<DocumentationTabProps>(
  function DocumentationTab({
    documentation,
    generatingDocs,
    onGenerateDocumentation,
    onStoreAnalysis,
    onExportToWord,
    hasAnalysisData,
  }) {
    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    };

    const getMethodColor = useMemo(() => {
      const colorMap = {
        GET: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
        POST: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
        PUT: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
        PATCH:
          "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
        DELETE:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
        default:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
      };
      return (method: string) =>
        colorMap[method?.toUpperCase() as keyof typeof colorMap] ||
        colorMap.default;
    }, []);

    const getDirectoryTypeIcon = useMemo(() => {
      const iconMap = {
        source: <Code className="w-4 h-4 text-blue-500" />,
        config: <Settings className="w-4 h-4 text-gray-500" />,
        test: <CheckCircle className="w-4 h-4 text-green-500" />,
        docs: <FileText className="w-4 h-4 text-purple-500" />,
        assets: <FileX className="w-4 h-4 text-orange-500" />,
        default: <Folder className="w-4 h-4 text-primary" />,
      };
      return (type: string) =>
        iconMap[type as keyof typeof iconMap] || iconMap.default;
    }, []);

    // Enhanced documentation view
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
                      <BookOpen className="w-5 h-5 text-primary" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-foreground/90 leading-relaxed">
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                          Pattern
                        </h4>
                        <p className="text-foreground font-medium">
                          {documentation.architecture.pattern}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {documentation.architecture.technologies?.map(
                            (tech, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        Description
                      </h4>
                      <p className="text-foreground/90 leading-relaxed">
                        {documentation.architecture.description}
                      </p>
                    </div>
                    {documentation.architecture.layers &&
                      documentation.architecture.layers.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Architecture Layers
                          </h4>
                          <div className="grid gap-3">
                            {documentation.architecture.layers.map(
                              (layer, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-secondary/50 rounded-lg border border-border/30 border-l-4 border-l-primary hover:bg-secondary/60 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <Cpu className="w-4 h-4 text-primary mt-1" />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-foreground mb-1">
                                        {layer.name}
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {layer.description}
                                      </p>
                                      {layer.components &&
                                        layer.components.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {layer.components.map(
                                              (component, idx) => (
                                                <Badge
                                                  key={idx}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {component}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        )}
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

              {/* Mermaid Diagram */}
              {documentation.mermaidDiagram && (
                <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                  <CardHeader className="pb-4 border-b border-border/20">
                    <CardTitle className="flex items-center gap-2">
                      <Network className="w-5 h-5 text-primary" />
                      Architecture Flow Diagram
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
                      Project Structure
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
                              copyToClipboard(
                                documentation.folderStructure.tree
                              )
                            }
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="bg-slate-900 rounded-lg border border-border/30 p-5 overflow-x-auto">
                          <pre
                            className="text-slate-100 font-mono text-sm leading-normal whitespace-pre"
                            style={{
                              fontFamily:
                                'Menlo, Monaco, Consolas, "Courier New", monospace',
                              fontSize: "13px",
                              lineHeight: "1.6",
                              tabSize: 2,
                            }}
                          >
                            {documentation.folderStructure.tree
                              .replace(/\\n/g, "\n")
                              .replace(/\\\\/g, "\\")
                              .trim()}
                          </pre>
                        </div>
                      </div>
                    )}
                    {documentation.folderStructure.directories &&
                      documentation.folderStructure.directories.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            Directory Analysis (
                            {documentation.folderStructure.directories.length})
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
                      <Cpu className="w-5 h-5 text-primary" />
                      Code Internals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Workflow className="w-4 h-4" />
                          Code Flow
                        </h4>
                        <p className="text-foreground/90 text-sm leading-relaxed">
                          {documentation.codeInternals.codeFlow}
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg border border-border/30">
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Data Flow
                        </h4>
                        <p className="text-foreground/90 text-sm leading-relaxed">
                          {documentation.codeInternals.dataFlow}
                        </p>
                      </div>
                    </div>

                    {documentation.codeInternals.keyAlgorithms &&
                      documentation.codeInternals.keyAlgorithms.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Key Algorithms (
                            {documentation.codeInternals.keyAlgorithms.length})
                          </h4>
                          <div className="grid gap-3">
                            {documentation.codeInternals.keyAlgorithms.map(
                              (algo, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <Lightbulb className="w-4 h-4 text-primary mt-1" />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-foreground mb-1">
                                        {algo.name}
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {algo.description}
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span className="text-muted-foreground">
                                          File:{" "}
                                          <code className="bg-muted px-1 py-0.5 rounded">
                                            {algo.file}
                                          </code>
                                        </span>
                                        <span className="text-muted-foreground">
                                          Complexity:{" "}
                                          <code className="bg-muted px-1 py-0.5 rounded">
                                            {algo.complexity}
                                          </code>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {documentation.codeInternals.designPatterns &&
                      documentation.codeInternals.designPatterns.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Design Patterns (
                            {documentation.codeInternals.designPatterns.length})
                          </h4>
                          <div className="grid gap-3">
                            {documentation.codeInternals.designPatterns.map(
                              (pattern, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <Target className="w-4 h-4 text-primary mt-1" />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-foreground mb-1">
                                        {pattern.pattern}
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {pattern.description}
                                      </p>
                                      <p className="text-sm text-foreground/80 mb-2">
                                        Usage: {pattern.usage}
                                      </p>
                                      {pattern.files &&
                                        pattern.files.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {pattern.files.map((file, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {file}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {documentation.codeInternals.businessLogic &&
                      documentation.codeInternals.businessLogic.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Business Logic (
                            {documentation.codeInternals.businessLogic.length})
                          </h4>
                          <div className="grid gap-3">
                            {documentation.codeInternals.businessLogic.map(
                              (logic, index) => (
                                <div
                                  key={index}
                                  className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <Users className="w-4 h-4 text-primary mt-1" />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-foreground mb-1">
                                        {logic.module}
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {logic.purpose}
                                      </p>
                                      <p className="text-sm text-foreground/80 mb-2">
                                        Workflow: {logic.workflow}
                                      </p>
                                      {logic.files &&
                                        logic.files.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {logic.files.map((file, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {file}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
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

              {/* API Endpoints */}
              {Array.isArray(documentation.apis) &&
                documentation.apis.length > 0 && (
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
                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                className={`font-mono text-xs border ${getMethodColor(
                                  api.method
                                )}`}
                              >
                                {api.method}
                              </Badge>
                              <code className="font-mono text-sm text-foreground bg-muted px-2 py-1 rounded">
                                {api.path}
                              </code>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {api.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Components */}
              {Array.isArray(documentation.components) &&
                documentation.components.length > 0 && (
                  <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardHeader className="pb-4 border-b border-border/20">
                      <CardTitle className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary" />
                        Components ({documentation.components.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-4">
                        {documentation.components.map((component, index) => (
                          <div
                            key={index}
                            className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <FileCode className="w-4 h-4 text-primary mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-semibold text-foreground">
                                    {component.name}
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    {component.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {component.description}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                  File:{" "}
                                  <code className="bg-muted px-1 py-0.5 rounded">
                                    {component.file}
                                  </code>
                                </div>
                                {component.dependencies &&
                                  component.dependencies.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs text-muted-foreground">
                                        Dependencies:{" "}
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {component.dependencies.map(
                                          (dep, idx) => (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {dep}
                                            </Badge>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Functions */}
              {Array.isArray(documentation.functions) &&
                documentation.functions.length > 0 && (
                  <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardHeader className="pb-4 border-b border-border/20">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Functions ({documentation.functions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="grid gap-4">
                        {documentation.functions.map((func, index) => (
                          <div
                            key={index}
                            className="p-4 bg-secondary/50 rounded-lg border border-border/30 hover:bg-secondary/60 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <Zap className="w-4 h-4 text-primary mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-semibold text-foreground">
                                    {func.name}
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    {func.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {func.description}
                                </p>
                                <div className="text-xs text-muted-foreground mb-2">
                                  File:{" "}
                                  <code className="bg-muted px-1 py-0.5 rounded">
                                    {func.file}
                                  </code>
                                </div>
                                {func.parameters &&
                                  func.parameters.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs text-muted-foreground">
                                        Parameters:{" "}
                                      </span>
                                      <div className="mt-1 space-y-1">
                                        {func.parameters.map((param, idx) => (
                                          <div key={idx} className="text-xs">
                                            <code className="bg-muted px-1 py-0.5 rounded">
                                              {param.name}: {param.type}
                                            </code>
                                            <span className="text-muted-foreground ml-2">
                                              - {param.description}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                {func.returns && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">
                                      Returns:{" "}
                                    </span>
                                    <code className="bg-muted px-1 py-0.5 rounded">
                                      {func.returns.type}
                                    </code>
                                    <span className="text-muted-foreground ml-2">
                                      - {func.returns.description}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Data Models */}
              {Array.isArray(documentation.dataModels) &&
                documentation.dataModels.length > 0 && (
                  <Card className="border-border/30 bg-gradient-to-br from-muted/20 to-muted/30 hover:from-muted/30 hover:to-muted/40 transition-all duration-300 shadow-sm hover:shadow-md">
                    <CardHeader className="pb-4 border-b border-border/20">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Data Models ({documentation.dataModels.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-4">
                        {documentation.dataModels.map((model, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-secondary/50 rounded-lg border border-border/30"
                          >
                            <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Database className="w-4 h-4 text-primary" />
                              {model.name}
                            </h5>
                            {model.type && (
                              <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded-full mr-2 mb-1">
                                {model.type}
                              </span>
                            )}
                            {model.file && (
                              <span className="inline-block text-xs bg-muted px-2 py-0.5 rounded-full mb-1">
                                File: {model.file}
                              </span>
                            )}
                            {model.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {model.description}
                              </p>
                            )}
                            {Array.isArray(model.properties) &&
                              model.properties.length > 0 && (
                                <div className="mb-2">
                                  <strong>Properties:</strong>
                                  <ul className="list-disc list-inside ml-4">
                                    {model.properties.map((prop, i) => (
                                      <li key={i}>
                                        <span className="font-mono font-semibold">
                                          {prop.name}
                                        </span>
                                        : {prop.type} - {prop.description}
                                      </li>
                                    ))}
                                  </ul>
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

    // Initial empty state before documentation generation
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
              Generate comprehensive documentation with architecture diagrams,
              API endpoints, code internals, SDLC guide, and detailed component
              analysis.
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
  }
);
