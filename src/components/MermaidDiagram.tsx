import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (elementRef.current && !renderedRef.current) {
      // Configure theme based on current mode using hex colors (Mermaid doesn't support OKLCH)
      const theme = isDarkMode ? "dark" : "default";
      const themeVariables = isDarkMode
        ? {
            primaryColor: "#6366f1", // Convert from OKLCH to hex equivalent
            primaryTextColor: "#f1f5f9",
            primaryBorderColor: "#6366f1",
            lineColor: "#94a3b8",
            sectionBkgColor: "#1e293b",
            altSectionBkgColor: "#334155",
            gridColor: "#475569",
            secondaryColor: "#8b5cf6",
            tertiaryColor: "#a855f7",
            background: "#0f172a",
            mainBkg: "#1e293b",
            secondBkg: "#334155",
            tertiaryBkg: "#475569",
          }
        : {
            primaryColor: "#6366f1", // Convert from OKLCH to hex equivalent
            primaryTextColor: "#1e293b",
            primaryBorderColor: "#6366f1",
            lineColor: "#64748b",
            sectionBkgColor: "#f8fafc",
            altSectionBkgColor: "#f1f5f9",
            gridColor: "#e2e8f0",
            secondaryColor: "#8b5cf6",
            tertiaryColor: "#a855f7",
            background: "#ffffff",
            mainBkg: "#f9fafb",
            secondBkg: "#f3f4f6",
            tertiaryBkg: "#e5e7eb",
          };

      mermaid.initialize({
        startOnLoad: true,
        theme,
        themeVariables,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        er: {
          useMaxWidth: true,
        },
      });

      const diagramId =
        id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

      // Clean and validate the chart syntax
      const cleanChart = chart.trim();

      // Basic validation for common issues
      if (!cleanChart) {
        setError("Empty diagram content");
        return;
      }

      try {
        mermaid
          .render(diagramId, cleanChart)
          .then(({ svg }) => {
            if (elementRef.current) {
              elementRef.current.innerHTML = svg;
              renderedRef.current = true;
              setError(null);
            }
          })
          .catch((error) => {
            console.error("Mermaid rendering error:", error);
            setError(error.message || "Unknown rendering error");
          });
      } catch (error) {
        console.error("Mermaid initialization error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Unknown initialization error"
        );
      }
    }
  }, [chart, id, isDarkMode]);

  // Reset rendered state when chart changes
  useEffect(() => {
    renderedRef.current = false;
    setError(null);
  }, [chart]);

  if (error) {
    return (
      <div className="bg-gradient-to-br from-destructive/5 to-destructive/10 border border-destructive/20 rounded-xl p-6 text-destructive my-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive shadow-sm">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold mb-3 text-foreground">
              Mermaid Diagram Error
            </p>
            <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
              The diagram could not be rendered due to a syntax error:
            </p>
            <code className="text-xs bg-muted/60 px-3 py-2 rounded-lg block overflow-x-auto mb-4 font-mono text-foreground border border-border/30">
              {error}
            </code>
            <details className="text-sm">
              <summary className="cursor-pointer text-primary hover:text-primary/80 font-medium transition-colors mb-3">
                Show diagram source
              </summary>
              <pre className="text-xs bg-muted/40 p-4 rounded-lg overflow-x-auto font-mono border border-border/30 text-foreground">
                {chart}
              </pre>
            </details>
            <div className="mt-4 text-xs text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/20">
              <p className="font-semibold text-foreground mb-2">
                Common fixes:
              </p>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>Check for missing arrows or connections</li>
                <li>Ensure all node names are properly formatted</li>
                <li>Verify diagram type syntax (flowchart, sequence, etc.)</li>
                <li>Remove any special characters that might break parsing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className="mermaid-diagram bg-gradient-to-br from-background to-muted/10 rounded-xl p-6 border border-border/30 overflow-x-auto my-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-black dark:text-white"
      style={{ minHeight: "200px" }}
    />
  );
};

export default MermaidDiagram;
