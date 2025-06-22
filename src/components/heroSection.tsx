import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Github,
  GitBranch,
  TestTube,
  FileText,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const HeroSection = () => {
  const { login, isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-3xl"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.3, 1],
              x: [0, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Enhanced Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-10"
        >
          <div className="space-y-6 mt-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent pb-4">
                Build Better Software
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                with AI Guidance
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Let AI choose the perfect SDLC model for your project, generate
              comprehensive test cases, and maintain documentation
              automatically.
              <span className="block mt-2 text-gray-500 dark:text-gray-400">
                Connect GitHub, describe your project, and watch DevArc
                architect your development process.
              </span>
            </p>
          </div>

          {/* Feature highlights */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { icon: GitBranch, text: "Smart SDLC Selection" },
              { icon: TestTube, text: "Auto Test Generation" },
              { icon: FileText, text: "Live Documentation" },
              { icon: Github, text: "GitHub Integration" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-full border border-gray-200 dark:border-white/20 shadow-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <feature.icon className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => (window.location.href = "/dashboard")}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
              >
                <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Go to Dashboard
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={login}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
              >
                <Github className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start with GitHub
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="group relative border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-white/20 text-lg px-8 py-6 backdrop-blur-sm shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              See How It Works
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Process flow indicators */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 flex justify-center items-center space-x-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                1
              </span>
            </div>
            <span>Connect GitHub</span>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">
                2
              </span>
            </div>
            <span>AI Analysis</span>
          </div>
          <ArrowRight className="w-4 h-4" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-semibold">
                3
              </span>
            </div>
            <span>Auto Generate</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
