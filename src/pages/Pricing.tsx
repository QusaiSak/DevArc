import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  Github,
  Brain,
  Shield,
  Users,
  Clock,
  HeadphonesIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PricingPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual developers and small projects",
      price: "$0",
      period: "forever",
      icon: Zap,
      popular: false,
      gradient: "from-green-500 to-emerald-500",
      features: [
        "3 AI-powered project analyses per month",
        "Basic SDLC recommendations",
        "GitHub integration",
        "Standard documentation generation",
        "Community support",
        "Basic code quality insights",
      ],
      limitations: [
        "Limited to 3 repositories",
        "Basic AI features only",
        "Standard response time",
      ],
    },
    {
      name: "Professional",
      description: "Ideal for growing teams and professional developers",
      price: "$29",
      period: "per month",
      icon: Sparkles,
      popular: true,
      gradient: "from-blue-500 to-purple-500",
      features: [
        "Unlimited AI project analyses",
        "Advanced SDLC optimization",
        "Priority GitHub integration",
        "Enhanced documentation with diagrams",
        "Advanced test case generation",
        "Code architecture insights",
        "Custom project templates",
        "Priority email support",
        "API access",
      ],
      limitations: [],
    },
    {
      name: "Team",
      description: "Built for collaborative teams and larger organizations",
      price: "$99",
      period: "per month",
      icon: Users,
      popular: false,
      gradient: "from-purple-500 to-pink-500",
      features: [
        "Everything in Professional",
        "Team collaboration tools",
        "Shared project workspaces",
        "Advanced team analytics",
        "Custom SDLC workflows",
        "Enterprise integrations",
        "Role-based access control",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      limitations: [],
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large-scale enterprise deployments",
      price: "Custom",
      period: "contact us",
      icon: Building2,
      popular: false,
      gradient: "from-slate-700 to-slate-900",
      features: [
        "Everything in Team",
        "On-premise deployment",
        "Custom AI model training",
        "Advanced security & compliance",
        "Custom integrations",
        "Dedicated infrastructure",
        "SLA guarantees",
        "White-label solutions",
        "24/7 dedicated support",
      ],
      limitations: [],
    },
  ];

  const handleGetStarted = (planName: string) => {
    if (!isAuthenticated) {
      login();
    } else {
      if (planName === "Starter") {
        navigate("/dashboard");
      } else if (planName === "Enterprise") {
        window.open("mailto:enterprise@devarch.com", "_blank");
      } else {
        // For Professional and Team plans, redirect to a subscription flow
        navigate("/subscribe", { state: { plan: planName } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Choose Your Plan
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="block bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Plans That Scale
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                With Your Ambitions
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From individual developers to enterprise teams, we have the
              perfect plan to accelerate your development workflow with
              AI-powered insights.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`relative h-full border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 group ${
                    plan.popular ? "ring-2 ring-blue-500/50 scale-105" : ""
                  }`}
                >
                  <CardHeader className="text-center pb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {plan.description}
                    </p>
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        {plan.price !== "Custom" && (
                          <span className="text-slate-500 dark:text-slate-400 ml-2">
                            /{plan.period}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-8">
                    <Button
                      onClick={() => handleGetStarted(plan.name)}
                      className={`w-full mb-6 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-blue-300 dark:hover:border-blue-600"
                      } transition-all duration-300 shadow-lg hover:shadow-xl`}
                      size="lg"
                    >
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          What's Included
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="flex items-start text-sm text-slate-600 dark:text-slate-400"
                            >
                              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
