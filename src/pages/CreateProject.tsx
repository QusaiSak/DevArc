import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Rocket,
  GitBranch,
  Users,
  Layers,
  Shield,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { AIAnalyzer } from "@/lib/aiService";
import { createProjectWithGitHubDirect } from "@/lib/projectService";
import type { ProjectData, SDDProjectInput } from "@/types/ai.interface";

const initialFormState: ProjectData = {
  name: "",
  description: "",
  type: "",
  teamSize: "",
  timeline: "",
  complexity: "",
  requirements: "",
  keyFeatures: "",
  riskFactors: "",
  additionalContext: "",
};

export default function CreateProjectPage() {
  const [formData, setFormData] = useState<ProjectData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "generating" | "success">("form");
  const [generatedData, setGeneratedData] = useState<any>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect effect for success step - MUST be at the top before any conditional returns
  useEffect(() => {
    if (step === "success" && generatedData?.project?.id) {
      const timer = setTimeout(() => {
        navigate(`/projects/${generatedData.project.id}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [step, generatedData, navigate]);

  const projectTypes = [
    {
      value: "Web App",
      icon: Layers,
      description: "Frontend/Backend web application",
    },
    { value: "API", icon: GitBranch, description: "REST/GraphQL API service" },
    {
      value: "Mobile App",
      icon: Rocket,
      description: "iOS/Android mobile application",
    },
    {
      value: "Desktop App",
      icon: Shield,
      description: "Cross-platform desktop application",
    },
    {
      value: "CLI Tool",
      icon: AlertCircle,
      description: "Command-line utility",
    },
    {
      value: "Library",
      icon: Star,
      description: "Reusable code library/package",
    },
  ];

  const complexityLevels = [
    {
      value: "Low",
      color: "bg-green-100 text-green-800",
      description: "Simple project with basic features",
    },
    {
      value: "Medium",
      color: "bg-yellow-100 text-yellow-800",
      description: "Moderate complexity with multiple features",
    },
    {
      value: "High",
      color: "bg-red-100 text-red-800",
      description: "Complex project with advanced requirements",
    },
  ];

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to create a project");
      return;
    }

    setLoading(true);
    setError(null);
    setStep("generating");

    try {
      const aiAnalyzer = new AIAnalyzer();

      // 1. Get SDLC recommendation
      console.log("🔄 Getting SDLC recommendation...");
      const sdlcResult = await aiAnalyzer.generateSDLCRecommendation(formData);

      // 2. Generate SDD/README
      console.log("📝 Generating SDD/README...");
      const sddData: SDDProjectInput = {
        ...formData,
        techStack: formData.additionalContext || "To be determined",
        sdlcModel: sdlcResult.recommended,
      };
      const sddReadme = await aiAnalyzer.generateSDDReadme(sddData);

      // 3. Create project with GitHub integration using the new service
      console.log("🚀 Creating project with GitHub integration...");
      const result = await createProjectWithGitHubDirect({
        ...formData,
        sdlc: sdlcResult,
        questions: [
          { question: "Project Name", answer: formData.name },
          { question: "Description", answer: formData.description },
          { question: "Type", answer: formData.type },
          { question: "Team Size", answer: formData.teamSize },
          { question: "Timeline", answer: formData.timeline },
          { question: "Complexity", answer: formData.complexity },
          { question: "Key Features", answer: formData.keyFeatures },
          { question: "Risk Factors", answer: formData.riskFactors },
          { question: "Requirements", answer: formData.requirements },
          {
            question: "Additional Context",
            answer: formData.additionalContext,
          },
        ],
        sddContent: sddReadme,
      });

      setGeneratedData({
        sdlc: sdlcResult,
        readme: sddReadme,
        repo: result.repo,
        project: result.project,
      });
      setStep("success");
    } catch (err: any) {
      console.error("❌ Project creation failed:", err);
      setError(err.message || "Failed to create project");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <h3 className="text-lg font-semibold">Creating Your Project</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🧠 Analyzing requirements and recommending SDLC...</p>
                <p>📝 Generating comprehensive documentation...</p>
                <p>🔗 Getting GitHub access token...</p>
                <p>🚀 Creating GitHub repository...</p>
                <p>📤 Pushing README to repository...</p>
                <p>💾 Storing project configuration...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                Project Created Successfully!
              </CardTitle>
              <CardDescription>
                Your project has been set up with AI-recommended SDLC and
                comprehensive documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Recommended SDLC</h4>
                  <Badge variant="secondary" className="text-sm">
                    {generatedData?.sdlc?.recommended}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {generatedData?.sdlc?.reasoning}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Repository</h4>
                  <a
                    href={generatedData?.repo?.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {generatedData?.repo?.full_name}
                  </a>
                  <p className="text-sm text-gray-600">
                    Complete with README and technical specification
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 mb-4">
                Redirecting to project view in 3 seconds...
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() =>
                    window.open(generatedData?.repo?.html_url, "_blank")
                  }
                  className="flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  View Repository
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/projects/${generatedData?.project?.id}`)
                  }
                >
                  View Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let AI recommend the perfect SDLC and generate comprehensive
            documentation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="My Awesome Project"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type...</option>
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what your project does..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Team & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Team Size
                  </label>
                  <input
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) =>
                      handleInputChange("teamSize", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1-3 developers"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) =>
                      handleInputChange("timeline", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Complexity
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) =>
                      handleInputChange("complexity", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select complexity...</option>
                    {complexityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Key Features
                </label>
                <textarea
                  value={formData.keyFeatures}
                  onChange={(e) =>
                    handleInputChange("keyFeatures", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="List the main features and functionality..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Requirements
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., Authentication, Stripe payments, real-time features..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Risk Factors
                </label>
                <textarea
                  value={formData.riskFactors}
                  onChange={(e) =>
                    handleInputChange("riskFactors", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Potential challenges, dependencies, or risks..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Context
                </label>
                <textarea
                  value={formData.additionalContext}
                  onChange={(e) =>
                    handleInputChange("additionalContext", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Any other relevant information..."
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
