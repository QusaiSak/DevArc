import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Layers,
  Workflow,
  Github,
  GitBranch,
  TestTube,
  FileText,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/authAndError/AuthContext";

export const HeroSection = () => {
  const { login, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Intelligent code analysis with contextual recommendations",
      color: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      icon: Workflow,
      title: "SDLC Optimization",
      description: "Personalized development lifecycle recommendations",
      color: "from-purple-500 to-pink-500",
      delay: 0.2,
    },
    {
      icon: Layers,
      title: "Architecture Insights",
      description: "Deep structural analysis and improvement suggestions",
      color: "from-green-500 to-emerald-500",
      delay: 0.3,
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Automated testing and quality metrics",
      color: "from-orange-500 to-red-500",
      delay: 0.4,
    },
  ];

  const stats = [
    { value: "10k+", label: "Projects Analyzed", delay: 0.1 },
    { value: "500+", label: "Teams Enhanced", delay: 0.2 },
    { value: "99.9%", label: "Uptime SLA", delay: 0.3 },
    { value: "50%", label: "Faster Delivery", delay: 0.4 },
  ];

  const processSteps = [
    { icon: Github, text: "Connect GitHub", color: "blue", delay: 0.1 },
    { icon: Brain, text: "AI Analysis", color: "purple", delay: 0.2 },
    { icon: Zap, text: "Auto Generate", color: "green", delay: 0.3 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs with Motion */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 backdrop-blur-3xl"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              ease: "easeInOut",
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.slate.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.200)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,theme(colors.slate.800)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.800)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        {/* Hero Content */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 mb-6 sm:mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-full shadow-lg"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              AI-Powered Development Platform
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <motion.span
              className="block bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent pb-2"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              Transform Your
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              initial={{ backgroundPosition: "100% 50%" }}
              animate={{ backgroundPosition: "0% 50%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1.5,
              }}
            >
              Development Workflow
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Leverage cutting-edge AI to analyze, optimize, and accelerate your
            software development process with intelligent insights and
            personalized recommendations.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { icon: GitBranch, text: "Smart SDLC Selection", delay: 0.1 },
              { icon: TestTube, text: "Auto Test Generation", delay: 0.2 },
              { icon: FileText, text: "Live Documentation", delay: 0.3 },
              { icon: Github, text: "GitHub Integration", delay: 0.4 },
              { icon: BarChart3, text: "Analytics & Insights", delay: 0.5 },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center px-3 sm:px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
                initial={{ opacity: 0, x: -20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: feature.delay,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  whileHover={{ rotate: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400 mr-2" />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur opacity-0 group-hover:opacity-100"
                    initial={false}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    Go to Dashboard
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={login}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur opacity-0 group-hover:opacity-100"
                    initial={false}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                    Start with GitHub
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="group relative border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-700 dark:text-slate-300 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  See How It Works
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-16 sm:mb-20 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: stat.delay }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: stat.delay + 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mb-16 sm:mb-20 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="group relative border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-500 h-full overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50 opacity-0 group-hover:opacity-100"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
                <CardContent className="p-4 sm:p-6 text-center relative z-10">
                  <motion.div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Process Flow */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          {processSteps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: step.delay }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${
                    step.color === "blue"
                      ? "from-blue-500 to-cyan-500"
                      : step.color === "purple"
                      ? "from-purple-500 to-pink-500"
                      : "from-green-500 to-emerald-500"
                  } flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  {step.text}
                </span>
              </div>
              {index < processSteps.length - 1 && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 hidden sm:block" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <motion.div
            className="text-sm text-slate-500 dark:text-slate-400 mb-4"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Join thousands of developers who trust our platform
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-4 h-4" />
            </motion.div>
            <span>Enterprise-grade security</span>
            <span>•</span>
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            <span>Lightning fast</span>
            <span>•</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            <span>AI-powered insights</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
