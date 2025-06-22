import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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
              className="bg-green-600 hover:bg-green-700 text-white border-green-600"
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
                  const { className, children } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      customStyle={{
                        backgroundColor: "#282c34",
                        padding: "1rem",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc mb-4 space-y-2 pl-6 text-slate-700 dark:text-slate-300"
                    {...props}
                  />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="list-decimal mb-4 space-y-2 pl-6 text-slate-700 dark:text-slate-300 [&>li]:pl-2"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li
                    className="mb-1 leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-950/30 italic text-slate-700 dark:text-slate-300"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table
                      className="min-w-full border border-slate-200 dark:border-slate-700 rounded-lg"
                      {...props}
                    />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-slate-50 dark:bg-slate-800" {...props} />
                ),
                th: ({ ...props }) => (
                  <th
                    className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700"
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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
