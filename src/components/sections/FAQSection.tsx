import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, HelpCircle } from "lucide-react";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the AI analysis work?",
      answer:
        "Our AI analyzes your codebase structure, team size, timeline, and project requirements using advanced machine learning models. It considers over 50 different factors including code complexity, team experience, project scope, and industry best practices to recommend the most suitable SDLC methodology and generate comprehensive documentation tailored to your specific needs.",
    },
    {
      question: "Can I change plans at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated. If you upgrade mid-cycle, you'll only pay the difference for the remaining time. If you downgrade, you'll receive a credit that applies to your next billing cycle.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with DevArc for any reason, we'll provide a full refund. No questions asked. We also offer a 14-day free trial so you can test all features before committing.",
    },
    {
      question: "Can I use DevArc for existing projects?",
      answer:
        "Yes! DevArc works with both new and existing projects. For existing projects, our AI will analyze your current codebase, team structure, and development patterns to suggest optimizations and improvements. You can also migrate existing documentation and integrate with your current workflow.",
    },
    {
      question: "What programming languages are supported?",
      answer:
        "DevArc supports all major programming languages including JavaScript, TypeScript, Python, Java, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, and many more. Our AI can also analyze polyglot projects and provide recommendations for multi-language architectures.",
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200/50 dark:border-purple-800/50 mb-4 sm:mb-6">
            <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
            <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Everything You Need to Know
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto px-4">
            Get answers to common questions about DevArc's features, pricing,
            and capabilities.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full text-left p-4 sm:p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white pr-3 sm:pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6">
                          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900/50 dark:to-blue-950/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Still have questions?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Our team is here to help. Get in touch and we'll respond within 24
              hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
