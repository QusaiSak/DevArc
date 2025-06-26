import { Loader2, Code, GitBranch } from "lucide-react";

interface ParsingLoaderProps {
  message?: string;
  progress?: number;
}

export const ParsingLoader = ({ message, progress }: ParsingLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="text-center p-8 rounded-xl bg-card border border-border shadow-2xl max-w-md w-full mx-4">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <Code className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3 font-heading">
          Parsing Repository
        </h2>

        <p className="text-muted-foreground mb-4 font-body">
          {message ||
            "Analyzing files and structure. This may take a moment..."}
        </p>

        {progress !== undefined && (
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <GitBranch className="w-4 h-4" />
          <span>Please wait while we process your repository</span>
        </div>
      </div>
    </div>
  );
};
