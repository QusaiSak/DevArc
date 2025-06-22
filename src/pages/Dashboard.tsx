import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  TrendingUp,
  GitBranch,
  BookOpen,
  FileCode,
  Star,
  TestTube,
  Clock,
} from "lucide-react";
import { getFavorites } from "@/lib/favoritesService";
import { getAllUserAnalyses } from "@/lib/analysesService";
import { FavoritesList } from "@/components/FavoritesList";

interface Analysis {
  testCases?: { testCases?: any[] };
  projectId?: string;
  projectName?: string;
  date?: string;
  summary?: string;
  savedAt?: string;
  createdAt?: string;
  structure?: {
    totalFiles?: number;
    totalLines?: number;
    languages?: Record<string, number>;
  };
}

export default function Dashboard1() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalFavorites: 0,
    totalTestCases: 0,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      setRecentAnalyses([]);
      setStats({ totalAnalyses: 0, totalFavorites: 0, totalTestCases: 0 });
    }
  }, [user?.id, reloadKey]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      const [analysesResponse, favoritesResponse] = await Promise.all([
        getAllUserAnalyses(user.id),
        getFavorites(user.id),
      ]);

      const analyses = analysesResponse || [];
      const favorites = favoritesResponse.favorites || [];

      setRecentAnalyses(analyses.slice(0, 5)); // Show latest 5
      setStats({
        totalAnalyses: analyses.length,
        totalFavorites: favorites.length,
        totalTestCases: analyses.reduce(
          (total: number, analysis: Analysis) =>
            total + (analysis.testCases?.testCases?.length || 0),
          0
        ),
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setRecentAnalyses([]);
      setStats({ totalAnalyses: 0, totalFavorites: 0, totalTestCases: 0 });
    }
  };

  const navigateToSearch = () => {
    navigate("/search");
  };

  const navigateToAnalysis = (projectId: string) => {
    const [owner, repo] = projectId.split("/");
    navigate(`/repository/${owner}/${repo}`);
  };

  // Reload favorites when they change
  const handleFavoriteChange = () => {
    setReloadKey((k) => k + 1);
  };

  // Use user.name or user.email for displayName
  const displayName = user?.username || user?.email || "Developer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      {/* Header Section */}
      <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Welcome back, {displayName}!
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Analyze repositories, generate tests, and improve your code
                quality with AI-powered insights.
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <FileCode className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Analyses
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileCode className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.totalAnalyses}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Repositories analyzed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Favorites
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.totalFavorites}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Starred repositories
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Test Cases
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TestTube className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {stats.totalTestCases}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generated test cases
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Search className="w-4 h-4 text-white" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Start analyzing repositories and improving your code quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={navigateToSearch}
                className="flex flex-col items-center gap-3 h-auto py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Search className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Search Repositories</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => navigate("/search?tab=trending")}
              >
                <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Trending Repos
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => navigate("/search?tab=popular")}
              >
                <GitBranch className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Popular Projects
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 border-2 border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 group"
                onClick={() => navigate("/documentation")}
              >
                <BookOpen className="h-6 w-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Documentation
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Favorites List */}
          <FavoritesList reloadKey={reloadKey} />

          {/* Recent Analyses */}
          <Card className="border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Recent Analyses
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your recently analyzed repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FileCode className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Start by searching for a repository to analyze
                  </p>
                  <Button
                    onClick={navigateToSearch}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start Analyzing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis, index) => (
                    <div
                      key={`${analysis.projectId}-${index}`}
                      className="border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 cursor-pointer transition-all duration-300 hover:shadow-lg group"
                      onClick={() =>
                        analysis.projectId &&
                        navigateToAnalysis(analysis.projectId)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {analysis.projectName || analysis.projectId}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            Analyzed{" "}
                            {analysis.createdAt
                              ? new Date(
                                  analysis.createdAt
                                ).toLocaleDateString()
                              : ""}
                          </p>
                          {analysis.structure && (
                            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <FileCode className="w-3 h-3" />
                                {analysis.structure.totalFiles} files
                              </span>
                              <span>{analysis.structure.totalLines} lines</span>
                              {analysis.structure.languages && (
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md font-medium">
                                  {Object.keys(analysis.structure.languages)[0]}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
