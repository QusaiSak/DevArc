import React from "react";
import MermaidDiagram from "./MermaidDiagram";
import { Badge } from "../../ui/badge";

interface CodeRendererProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  // Made children optional to match the type expected by react-markdown
  children?: React.ReactNode;
}

export const CodeRenderer: React.FC<CodeRendererProps> = (props) => {
  const { className, children, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  // Added a fallback for children to handle the optional type
  const code = String(children || "").replace(/\n$/, "");
  const isInline = !className || !match;

  if (!isInline && language === "mermaid") {
    // Render Mermaid diagram
    return <MermaidDiagram chart={code} />;
  }

  if (isInline) {
    return (
      <code
        className="bg-muted/80 px-2 py-1 rounded-md text-sm font-mono text-foreground border border-border hover:bg-muted transition-colors duration-200"
        {...rest}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group">
      <code
        className="block bg-muted/60 p-4 rounded-lg text-sm font-mono overflow-x-auto text-foreground border border-border hover:bg-muted/80 transition-all duration-200"
        {...rest}
      >
        {children}
      </code>
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
};
