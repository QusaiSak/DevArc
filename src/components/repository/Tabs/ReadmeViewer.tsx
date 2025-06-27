import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import MermaidDiagram from "../helper/MermaidDiagram";
import { Badge } from "../../ui/badge";

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-gradient-to-br from-background via-background to-accent/5 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                README.md
              </span>
            </div>
            {hasAnalysisData && onStoreAnalysis && (
              <Button
                onClick={onStoreAnalysis}
                size="sm"
                variant="secondary"
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Download className="w-4 h-4 mr-2" />
                Store Analysis
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                        <div className="bg-slate-900 rounded-lg border border-border/30 p-5 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
                          <pre className="text-slate-100 whitespace-pre-wrap">
                            {children}
                          </pre>
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                    <div className="bg-slate-900 rounded-lg border border-border/30 p-5 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner mb-6 group">
                      <pre
                        className="text-slate-100 whitespace-pre-wrap"
                        {...props}
                      >
                        {children}
                      </pre>
                    </div>
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
            <div className="text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-muted/20 to-muted/30 rounded-full blur-xl"></div>
                </div>
                <div className="relative bg-gradient-to-br from-muted/10 to-muted/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto border border-border/30">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                No README found
              </h3>
              <p className="text-muted-foreground">
                This repository doesn't have a README.md file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
