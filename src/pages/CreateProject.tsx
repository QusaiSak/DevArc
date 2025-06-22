import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  Rocket,
  GitBranch,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface GeneratedData {
  sdlc: {
    recommended: string;
    reasoning: string;
    phases?: string[];
  };
  readme: string;
  repo: {
    html_url: string;
    full_name: string;
  };
  project: {
    id: number;
  };
}

export default function CreateProjectPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "generating" | "success">("form");
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(
    null
  );
  const [recommendedSDLC, setRecommendedSDLC] = useState<string | null>(null);
  const [aiSDLCRecommendation, setAiSDLCRecommendation] = useState<{
    recommended: string;
    reasoning: string;
    phases?: string[];
  } | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect effect for success step
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
      label: "Web Application",
      description: "Frontend/Backend web application",
    },
    {
      value: "API",
      label: "API/Backend Service",
      description: "REST/GraphQL API service",
    },
    {
      value: "Mobile App",
      label: "Mobile Application",
      description: "iOS/Android mobile application",
    },
    {
      value: "Desktop App",
      label: "Desktop Application",
      description: "Cross-platform desktop application",
    },
    {
      value: "CLI Tool",
      label: "CLI Tool",
      description: "Command-line utility",
    },
    {
      value: "Library",
      label: "Library/Framework",
      description: "Reusable code library/package",
    },
  ];

  const complexityLevels = [
    {
      value: "Low",
      label: "Low",
      description: "Simple project with basic features",
    },
    {
      value: "Medium",
      label: "Medium",
      description: "Moderate complexity with multiple features",
    },
    {
      value: "High",
      label: "High",
      description: "Complex project with advanced requirements",
    },
    {
      value: "Very High",
      label: "Very High",
      description: "Highly complex with enterprise requirements",
    },
  ];

  const sdlcModels = {
    Agile: {
      description:
        "Iterative development with frequent releases and customer feedback",
      benefits: [
        "Flexible to changes",
        "Fast delivery",
        "Customer collaboration",
      ],
      bestFor:
        "Web applications, mobile apps, and projects with evolving requirements",
      icon: "🔄",
      color: "from-blue-500 to-cyan-500",
    },
    Scrum: {
      description: "Framework with sprints, daily standups, and defined roles",
      benefits: ["Clear structure", "Team accountability", "Regular delivery"],
      bestFor: "Complex projects with large teams and clear sprint goals",
      icon: "🏃‍♂️",
      color: "from-green-500 to-emerald-500",
    },
    Kanban: {
      description: "Visual workflow management with continuous delivery",
      benefits: [
        "Visual progress",
        "Flexible workflow",
        "Continuous improvement",
      ],
      bestFor: "Maintenance projects, support teams, and continuous delivery",
      icon: "📋",
      color: "from-yellow-500 to-orange-500",
    },
    Waterfall: {
      description: "Sequential phases with comprehensive documentation",
      benefits: [
        "Clear milestones",
        "Detailed documentation",
        "Predictable timeline",
      ],
      bestFor: "Projects with fixed requirements and regulatory compliance",
      icon: "🌊",
      color: "from-indigo-500 to-purple-500",
    },
    DevOps: {
      description:
        "Combines development and operations for continuous integration and delivery",
      benefits: [
        "Faster deployment",
        "Improved collaboration",
        "Automated processes",
      ],
      bestFor: "Cloud-native applications and microservices architecture",
      icon: "⚙️",
      color: "from-red-500 to-pink-500",
    },
    Lean: {
      description: "Focus on eliminating waste and maximizing customer value",
      benefits: ["Reduced waste", "Faster time-to-market", "Customer focus"],
      bestFor: "Startups and projects with limited resources",
      icon: "⚡",
      color: "from-teal-500 to-green-500",
    },
    Spiral: {
      description:
        "Risk-driven approach with iterative prototyping and evaluation",
      benefits: ["Risk management", "Early prototyping", "Flexible planning"],
      bestFor: "Large, complex projects with high uncertainty",
      icon: "🌀",
      color: "from-purple-500 to-violet-500",
    },
    "V-Model": {
      description:
        "Sequential design process with corresponding testing phases",
      benefits: [
        "Clear testing phases",
        "Quality assurance",
        "Structured approach",
      ],
      bestFor: "Safety-critical systems and regulated industries",
      icon: "📐",
      color: "from-rose-500 to-red-500",
    },
  };

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setCurrentStep(currentStep + 1);
  };

  const getAIRecommendation = async () => {
    if (!user) {
      setError("Please login to get AI recommendation");
      return;
    }

    setIsGettingRecommendation(true);
    setError(null);

    try {
      const aiAnalyzer = new AIAnalyzer();
      const sdlcResult = await aiAnalyzer.generateSDLCRecommendation(formData);

      setAiSDLCRecommendation(sdlcResult);
      setRecommendedSDLC(sdlcResult.recommended); // Set as default selection
    } catch (err: unknown) {
      console.error("❌ AI recommendation failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to get AI recommendation"
      );
    } finally {
      setIsGettingRecommendation(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Remove the old getSDLCRecommendation function since we're using AI now

  const handleFinalSubmit = async () => {
    if (!user) {
      setError("Please login to create a project");
      return;
    }

    if (!recommendedSDLC) {
      setError("Please select an SDLC methodology");
      return;
    }

    setLoading(true);
    setError(null);
    setStep("generating");

    try {
      const aiAnalyzer = new AIAnalyzer();

      // Use the selected SDLC (either AI recommended or manually chosen)
      const finalSDLC = {
        recommended: recommendedSDLC,
        reasoning:
          aiSDLCRecommendation?.reasoning ||
          `User selected ${recommendedSDLC} methodology`,
        phases: aiSDLCRecommendation?.phases || [],
      };

      // Generate SDD/README using the selected SDLC
      const sddData: SDDProjectInput = {
        ...formData,
        techStack: formData.additionalContext || "To be determined",
        sdlcModel: recommendedSDLC, // Use the selected SDLC
      };
      const sddReadme = await aiAnalyzer.generateSDDReadme(sddData);

      // Create project with GitHub integration
      const result = await createProjectWithGitHubDirect({
        ...formData,
        sdlc: finalSDLC,
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
        sdlc: finalSDLC,
        readme: sddReadme,
        repo: result.repo,
        project: result.project,
      });
      setStep("success");
    } catch (err: unknown) {
      console.error("❌ Project creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
      setStep("form");
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  if (step === "generating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black flex items-center justify-center">
        <Card className="w-full max-w-md border-0 bg-card/80 backdrop-blur-xl shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                  <div className="rounded-full h-full w-full bg-background"></div>
                </div>
                <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl"></div>
              </div>
              <h3 className="text-lg font-semibold">Creating Your Project</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
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
          <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  View Repository
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/projects/${generatedData?.project?.id}`)
                  }
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  View Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="shadow-sm hover:shadow-md transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900">
      {/* Enhanced Header with Progress */}
      <header className="bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Create New Project
              </h1>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStep} of 4
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {[
                {
                  number: 1,
                  label: "Project Info",
                  completed: currentStep > 1,
                },
                {
                  number: 2,
                  label: "Requirements",
                  completed: currentStep > 2,
                },
                {
                  number: 3,
                  label: "SDLC Selection",
                  completed: currentStep > 3,
                },
                { number: 4, label: "Setup", completed: currentStep > 4 },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center relative z-10"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                    } ${step.completed ? "scale-110" : ""}`}
                  >
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= step.number
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Step 1: Project Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-900 dark:text-white">
                      Project Information
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 text-base mt-2">
                      Tell us about your project so we can provide the best
                      recommendations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Project Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Project"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="h-12 bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="type"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Project Type *
                    </Label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        handleInputChange("type", e.target.value)
                      }
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Project Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your project does and its main goals..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleNext}
                    disabled={!formData.name || !formData.description}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Requirements */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-green-500/10 dark:shadow-green-500/5">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-900 dark:text-white">
                      Project Requirements
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 text-base mt-2">
                      Help us understand your project constraints and
                      requirements
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label
                      htmlFor="teamSize"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Team Size *
                    </Label>
                    <select
                      value={formData.teamSize}
                      onChange={(e) =>
                        handleInputChange("teamSize", e.target.value)
                      }
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select team size</option>
                      <option value="solo">Solo (1 person)</option>
                      <option value="small">Small (2-5 people)</option>
                      <option value="medium">Medium (6-15 people)</option>
                      <option value="large">Large (16+ people)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="timeline"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Timeline *
                    </Label>
                    <select
                      value={formData.timeline}
                      onChange={(e) =>
                        handleInputChange("timeline", e.target.value)
                      }
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select timeline</option>
                      <option value="short">Short (1-3 months)</option>
                      <option value="medium">Medium (3-6 months)</option>
                      <option value="long">Long (6-12 months)</option>
                      <option value="ongoing">Ongoing (12+ months)</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="complexity"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Complexity *
                    </Label>
                    <select
                      value={formData.complexity}
                      onChange={(e) =>
                        handleInputChange("complexity", e.target.value)
                      }
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <option value="">Select complexity</option>
                      {complexityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label
                      htmlFor="keyFeatures"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Key Features
                    </Label>
                    <Textarea
                      id="keyFeatures"
                      placeholder="List the main features and functionality..."
                      rows={4}
                      value={formData.keyFeatures}
                      onChange={(e) =>
                        handleInputChange("keyFeatures", e.target.value)
                      }
                      className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="requirements"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Specific Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any specific requirements, constraints, or technologies..."
                      rows={4}
                      value={formData.requirements}
                      onChange={(e) =>
                        handleInputChange("requirements", e.target.value)
                      }
                      className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="riskFactors"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Risk Factors
                  </Label>
                  <Textarea
                    id="riskFactors"
                    placeholder="Potential challenges, dependencies, or risks..."
                    rows={3}
                    value={formData.riskFactors}
                    onChange={(e) =>
                      handleInputChange("riskFactors", e.target.value)
                    }
                    className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="h-12 px-6 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={getAIRecommendation}
                      disabled={
                        !formData.teamSize ||
                        !formData.timeline ||
                        !formData.complexity ||
                        isGettingRecommendation
                      }
                      className="h-12 px-6 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                    >
                      {isGettingRecommendation ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Getting AI Recommendation...
                        </>
                      ) : (
                        <>
                          <Bot className="h-5 w-5 mr-2" />
                          Get AI Recommendation
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        !formData.teamSize ||
                        !formData.timeline ||
                        !formData.complexity
                      }
                      className="h-12 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: SDLC Selection */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {aiSDLCRecommendation && (
              <Card className="border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-green-900/50 backdrop-blur-xl shadow-2xl border-green-200/50 dark:border-green-800/50">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                        AI Recommendation
                      </CardTitle>
                      <CardDescription className="text-green-700 dark:text-green-300 text-base">
                        Based on your project requirements, we recommend the{" "}
                        <strong>{aiSDLCRecommendation.recommended}</strong>{" "}
                        methodology.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200/30 dark:border-green-800/30">
                    <p className="text-green-800 dark:text-green-200 leading-relaxed">
                      <strong>Reasoning:</strong>{" "}
                      {aiSDLCRecommendation.reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!aiSDLCRecommendation && (
              <Card className="border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-blue-900/50 backdrop-blur-xl shadow-2xl border-blue-200/50 dark:border-blue-800/50">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">
                        Choose SDLC Methodology
                      </CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300 text-base">
                        Select your preferred software development lifecycle
                        methodology, or get an AI recommendation first.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={getAIRecommendation}
                    disabled={isGettingRecommendation}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    {isGettingRecommendation ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Getting AI Recommendation...
                      </>
                    ) : (
                      <>
                        <Bot className="h-5 w-5 mr-2" />
                        Get AI Recommendation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(sdlcModels).map(([model, details]) => (
                <motion.div
                  key={model}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 border-0 backdrop-blur-xl shadow-lg hover:shadow-2xl group h-full ${
                      model === recommendedSDLC
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 ring-2 ring-green-500/50 scale-105"
                        : aiSDLCRecommendation?.recommended === model
                        ? "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 ring-2 ring-blue-500/50"
                        : "bg-white/70 dark:bg-slate-900/70 hover:bg-white/90 dark:hover:bg-slate-900/90 hover:scale-105"
                    }`}
                    onClick={() => setRecommendedSDLC(model)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${details.color} flex items-center justify-center shadow-lg text-xl`}
                        >
                          {details.icon}
                        </div>
                        {model === recommendedSDLC && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                            Selected
                          </Badge>
                        )}
                        {aiSDLCRecommendation?.recommended === model &&
                          model !== recommendedSDLC && (
                            <Badge
                              variant="outline"
                              className="border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50"
                            >
                              AI Pick
                            </Badge>
                          )}
                      </div>
                      <CardTitle className="flex items-center space-x-2 text-xl">
                        <span>{model}</span>
                        {model === recommendedSDLC && (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {details.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">
                            Benefits:
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            {details.benefits
                              .slice(0, 2)
                              .map((benefit, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                            Best For:
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {details.bestFor}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="h-12 px-6 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!recommendedSDLC}
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                Continue with {recommendedSDLC || "Selected SDLC"}{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Final Setup */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-slate-900 dark:text-white">
                      Ready to Create Project!
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 text-base mt-2">
                      Your project will be configured with the {recommendedSDLC}{" "}
                      methodology and comprehensive documentation.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-blue-900/50 p-8 rounded-2xl border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-3 text-lg">
                    <Rocket className="h-6 w-6" />
                    What happens next:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "AI will generate comprehensive documentation and README",
                      "Create a new GitHub repository for your project",
                      `Set up project structure based on ${recommendedSDLC} methodology`,
                      "Generate technical specification document",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center text-blue-800 dark:text-blue-200"
                      >
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <div className="flex">
                      <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                      <div className="ml-3">
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                          {error}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="h-12 px-6 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
