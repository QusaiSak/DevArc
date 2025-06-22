import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Loader2 } from "lucide-react";
import type { ComprehensiveDocumentation } from "@/types/codeparser.interface";
import MermaidDiagram from "@/components/MermaidDiagram";

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
  if (documentation) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Enhanced Documentation</span>
              <div className="flex space-x-2">
                <Button
                  onClick={() => onExportToWord(documentation)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={onStoreAnalysis}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Store All Data
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Project Summary */}
              {documentation.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {documentation.summary}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Architecture Overview */}
              {documentation.architecture && (
                <Card>
                  <CardHeader>
                    <CardTitle>Architecture Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Pattern</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {documentation.architecture.pattern}
                      </p>
                    </div>
                    {documentation.architecture.description && (
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {documentation.architecture.description}
                        </p>
                      </div>
                    )}
                    {documentation.architecture.technologies && (
                      <div>
                        <h4 className="font-semibold mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {documentation.architecture.technologies.map(
                            (tech, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                              >
                                {tech}
                              </span>
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
                <Card>
                  <CardHeader>
                    <CardTitle>System Architecture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MermaidDiagram chart={documentation.mermaidDiagram} />
                  </CardContent>
                </Card>
              )}

              {/* Folder Structure */}
              {documentation.folderStructure && (
                <Card>
                  <CardHeader>
                    <CardTitle>Folder Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {documentation.folderStructure.tree && (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                        {documentation.folderStructure.tree}
                      </pre>
                    )}
                    {documentation.folderStructure.directories && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold">Directory Details</h4>
                        {documentation.folderStructure.directories.map(
                          (dir, index) => (
                            <div
                              key={index}
                              className="border-l-4 border-blue-500 pl-4"
                            >
                              <h5 className="font-medium">{dir.path}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {dir.description}
                              </p>
                              <span className="text-xs text-gray-500">
                                {dir.fileCount} files • {dir.type}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Components */}
              {documentation.components &&
                documentation.components.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Components ({documentation.components.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {documentation.components.map((component, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">
                                {component.name}
                              </h4>
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {component.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {component.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              File: {component.file}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* API Endpoints */}
              {documentation.apis && documentation.apis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      API Endpoints ({documentation.apis.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documentation.apis.map((api, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                              {api.method}
                            </span>
                            <span className="font-mono text-sm">
                              {api.endpoint}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {api.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Usage Examples */}
              {documentation.examples && documentation.examples.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {documentation.examples.map((example, index) => (
                        <div key={index}>
                          <h4 className="font-semibold mb-2">
                            {example.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {example.description}
                          </p>
                          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{example.code}</code>
                          </pre>
                          {example.explanation && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <strong>Explanation:</strong>{" "}
                              {example.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Enhanced Documentation Ready
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate comprehensive documentation with code internals, SDLC
            guide, and folder structure
          </p>
          <div className="flex justify-center space-x-2">
            <Button onClick={onGenerateDocumentation} disabled={generatingDocs}>
              {generatingDocs ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Enhanced Documentation"
              )}
            </Button>
            {/* Show Store button if ANY analysis data exists */}
            {hasAnalysisData && (
              <Button
                onClick={onStoreAnalysis}
                variant="outline"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Store All Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
