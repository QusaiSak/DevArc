import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MermaidDiagram from "../MermaidDiagram";
import { Badge } from "../ui/badge";

interface ReadmeViewerProps {
  readme: string;
  onStoreAnalysis?: () => void;
  hasAnalysisData?: boolean;
}

export const ReadmeViewer: React.FC<ReadmeViewerProps> = ({
  readme,
  onStoreAnalysis,
  hasAnalysisData = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            README.md
          </div>
          {hasAnalysisData && onStoreAnalysis && (
            <Button
              onClick={onStoreAnalysis}
              variant="outline"
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent"
            >
              <Save className="w-4 h-4 mr-2" />
              Store Analysis
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {readme ? (
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code: (props) => {
                  const { className, children, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";
                  const code = String(children).replace(/\n$/, "");
                  const isInline = !className || !match;

                  if (!isInline && language === "mermaid") {
                    return <MermaidDiagram chart={code} />;
                  }

                  return isInline ? (
                    <code
                      className="bg-muted/80 px-2 py-1 rounded-md text-sm font-mono text-foreground border border-border hover:bg-muted transition-colors duration-200"
                      {...rest}
                    >
                      {children}
                    </code>
                  ) : (
                    <div className="relative group">
                      <code
                        className="block bg-muted/60 p-4 rounded-lg text-sm font-mono overflow-x-auto text-foreground border border-border hover:bg-muted/80 transition-all duration-200"
                        {...rest}
                      >
                        {children}
                      </code>
                      <div className="absolute  top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Badge
                          variant="outline"
                          className="text-xs bg-card/80 backdrop-blur-sm"
                        >
                          {language || "code"}
                        </Badge>
                      </div>
                    </div>
                  );
                },
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold mb-6 text-foreground border-b border-border pb-3"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-semibold mb-4 text-foreground border-b border-border pb-2"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-semibold mb-3 text-foreground"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="mb-4 leading-relaxed text-muted-foreground"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc mb-4 space-y-2 pl-6 text-muted-foreground"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal mb-4 space-y-2 pl-6 text-muted-foreground [&>li]:pl-2"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li
                    className="mb-1 leading-relaxed hover:text-primary transition-colors duration-200"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="text-primary hover:text-primary/80 underline transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                pre: ({ children, ...props }) => (
                  <pre
                    className="bg-muted/60 p-6 rounded-xl overflow-x-auto text-sm font-mono mb-6 border border-border shadow-inner hover:shadow-lg transition-shadow duration-300 group"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table
                      className="min-w-full border border-border rounded-lg"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-muted/50" {...props} />
                ),
                th: ({ ...props }) => (
                  <th
                    className="px-4 py-2 text-left font-semibold text-foreground border-b border-border"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className="px-4 py-2 text-muted-foreground border-b border-border"
                    {...props}
                  />
                ),
                img: ({ ...props }) => (
                  <img
                    className="max-w-full h-auto rounded-lg shadow-lg my-4"
                    {...props}
                  />
                ),
              }}
            >
              {readme}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No README found</h3>
            <p className="text-base">
              This repository doesn't have a README.md file.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
