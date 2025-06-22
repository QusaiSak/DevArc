import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight, Sparkles, Users, Shield, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (plan?: string) => {
    if (user) {
      navigate("/dashboard");
    } else {
      // Trigger OAuth login, potentially with plan parameter
      const url = plan ? `/api/auth/github?plan=${plan}` : "/api/auth/github";
      window.location.href = url;
    }
  };

  const handleTalkToSales = () => {
    // Open calendar booking or contact form
    window.open("mailto:sales@devarc.ai?subject=Sales Inquiry", "_blank");
  };

  const stats = [
    { icon: Users, value: "10K+", label: "Active Developers" },
    { icon: Zap, value: "99.9%", label: "Uptime SLA" },
    { icon: Shield, value: "SOC 2", label: "Compliant" },
    { icon: Github, value: "50K+", label: "Projects Created" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>
      </div>

      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-20 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-3xl backdrop-blur-xl hidden lg:block"
      />

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-20 left-20 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl backdrop-blur-xl hidden lg:block"
      />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 mb-6 sm:mb-8"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            <span className="text-xs sm:text-sm font-medium text-white">
              Join the AI Revolution
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4"
          >
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Development Workflow?
            </span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            Join thousands of developers who have accelerated their projects
            with AI-powered insights. Start your free trial today and experience
            the future of project management.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
          >
            <Button
              size="lg"
              onClick={() => handleGetStarted("Professional")}
              className="h-14 sm:h-16 px-8 sm:px-10 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl group text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              <Github className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              {user ? "Go to Dashboard" : "Start Free Trial"}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              onClick={handleTalkToSales}
              variant="outline"
              className="h-14 sm:h-16 px-8 sm:px-10 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl group text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              Talk to Sales
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 backdrop-blur-xl">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-blue-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/20"
          >
            <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
              Trusted by teams at leading companies
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="text-white font-semibold text-sm sm:text-base">
                TechCorp
              </div>
              <div className="text-white font-semibold text-sm sm:text-base">
                DevStudio
              </div>
              <div className="text-white font-semibold text-sm sm:text-base">
                BuildCo
              </div>
              <div className="text-white font-semibold text-sm sm:text-base">
                CodeLab
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
