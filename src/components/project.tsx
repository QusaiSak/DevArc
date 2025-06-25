import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderOpen,
  GitBranch,
  Calendar,
  ExternalLink,
  Eye,
  Sparkles,
  ArrowRight,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { RepoImportModal } from "./repoModal";
import { getAllUserProjects } from "@/lib/projectService";
import type { Repository } from "@/types/github.interface";
import type { Project } from "@/types/project.interface";
import { motion } from "motion/react";

export const Dashboard = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentProjects();
  }, []);

  const loadRecentProjects = async () => {
    try {
      const projects = await getAllUserProjects();
      // Get the 3 most recent projects
      setRecentProjects(projects.slice(0, 3));
    } catch (error) {
      console.error("Failed to load recent projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportRepository = (repo: Repository) => {
    console.log("Importing repository:", repo);
    alert(`Successfully imported ${repo.name}!`);
  };

  const handleCreateProject = () => {
    navigate("/create-project");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Title Section */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                whileHover={{ rotate: 12 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-8 h-8 text-white relative z-10" />
              </motion.div>
            </motion.div>
          </div>
          <motion.h1
            className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Welcome to Your Dashboard
          </motion.h1>
          <motion.p
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Create intelligent projects or import from GitHub with AI-powered
            insights and comprehensive analysis
          </motion.p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Project */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8 }}
          >
            <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                 onClick={handleCreateProject}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/20 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
              />
              <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/60 dark:to-blue-800/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl"
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Create New Project
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    Start from scratch with AI-powered SDLC recommendations, smart
                    configuration, and guided setup
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Import from GitHub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -8 }}
          >
            <div className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                 onClick={() => setIsImportModalOpen(true)}>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-green-50/30 dark:from-emerald-950/30 dark:via-transparent dark:to-green-950/20 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
              />
              <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/60 dark:to-green-800/60 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl group-hover:shadow-2xl"
                    whileHover={{ rotate: 12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FolderOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 blur-xl"
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    Import from GitHub
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                    Analyze existing repositories with AI-powered structure
                    analysis, documentation generation, and insights
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-8 py-3 rounded-xl font-semibold bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 group/btn"
                  >
                    <motion.div
                      whileHover={{ rotate: 12 }}
                      transition={{ duration: 0.3 }}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                    </motion.div>
                    Import Repository
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.h2
                className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                Recent Projects
              </motion.h2>
              <motion.p
                className="text-slate-600 dark:text-slate-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your latest work and ongoing development
              </motion.p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={() => navigate("/projects")}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                View All
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Card className="animate-pulse bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="flex gap-2">
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden relative"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 dark:from-slate-900/50 dark:via-transparent dark:to-blue-950/30 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.5 }}
                    />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {project.name}
                          </h3>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            variant="secondary"
                            className="capitalize font-medium shadow-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 border-0 ml-3"
                          >
                            {project.visibility}
                          </Badge>
                        </motion.div>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {formatDate(project.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {project.repoUrl && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(project.repoUrl, "_blank");
                                }}
                                className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 rounded-xl group/btn"
                              >
                                <motion.div
                                  whileHover={{ rotate: 12 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </motion.div>
                              </Button>
                            </motion.div>
                          )}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/projects/${project.id}`)}
                              className="h-9 w-9 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 rounded-xl group/btn"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.div>
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="text-center py-16">
                  <motion.div
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-6 shadow-inner group hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <FolderOpen className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-all duration-300" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    No projects yet
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
                    Create your first project to start building amazing things
                    with AI-powered development workflows
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleCreateProject}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-xl font-semibold group"
                    >
                      <motion.div
                        whileHover={{ rotate: 12 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                      </motion.div>
                      Create Your First Project
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal */}
      <RepoImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRepository}
      />
    </div>
  );
};