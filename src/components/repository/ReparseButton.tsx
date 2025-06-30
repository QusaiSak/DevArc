import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { CodeParser } from "@/lib/code-parser";

interface ReparseButtonProps {
  files: any[];
  language?: string;
  onReparse?: (result: any) => void;
}

export function ReparseButton({ files, language = "javascript", onReparse }: ReparseButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReparse = async () => {
    setLoading(true);
    try {
      const result = await CodeParser.reparseCodebase(files, language);
      toast.success("Repository re-parsed and cache cleared!");
      if (onReparse) onReparse(result);
    } catch (err) {
      toast.error("Failed to re-parse repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleReparse} disabled={loading} variant="secondary" className="ml-2">
      {loading ? "Re-parsing..." : "Re-parse & Clear Cache"}
    </Button>
  );
}
