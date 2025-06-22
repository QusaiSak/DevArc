import { motion } from "framer-motion";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Documentation", href: "#docs" },
        { name: "API Reference", href: "#api" },
        { name: "Integrations", href: "#integrations" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Careers", href: "#careers" },
        { name: "Press Kit", href: "#press" },
        { name: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "#help" },
        { name: "Community", href: "#community" },
        { name: "Tutorials", href: "#tutorials" },
        { name: "Best Practices", href: "#practices" },
        { name: "Status Page", href: "#status" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" },
        { name: "Cookie Policy", href: "#cookies" },
        { name: "Security", href: "#security" },
        { name: "Compliance", href: "#compliance" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/devarc", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/devarc", label: "Twitter" },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/devarc",
      label: "LinkedIn",
    },
    { icon: Mail, href: "mailto:hello@devarc.ai", label: "Email" },
  ];

  const contactInfo = [
    { icon: MapPin, text: "San Francisco, CA" },
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: Mail, text: "hello@devarc.ai" },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 opacity-50"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]"></div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-b border-slate-800 py-12 sm:py-16"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Stay Updated with DevArc
            </h3>
            <p className="text-lg sm:text-xl text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Get the latest updates on new features, AI improvements, and
              developer insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                Subscribe
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="sm:col-span-2 lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">DevArc</span>
              </div>
              <p className="text-slate-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Transforming software development with AI-powered project
                management. Build better, ship faster, and scale smarter with
                intelligent insights.
              </p>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 text-slate-400 text-sm sm:text-base"
                  >
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 sm:gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
                className="sm:col-span-1"
              >
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">
                  {section.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <motion.a
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith("/")) {
                            e.preventDefault();
                            navigate(link.href);
                          }
                        }}
                        className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm cursor-pointer block"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {link.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="border-t border-slate-800 py-6 sm:py-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-slate-400 text-xs sm:text-sm text-center sm:text-left">
              © 2024 DevArc. All rights reserved. Built with ❤️ for developers.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <span className="text-slate-500">
                Status:{" "}
                <span className="text-green-400">All systems operational</span>
              </span>
              <span className="text-slate-500">
                Version: <span className="text-blue-400">2.1.0</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
