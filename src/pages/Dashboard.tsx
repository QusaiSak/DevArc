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
    <div className="mx-auto px-4 py-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Analyze repositories, generate tests, and improve your code quality.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Analyses
            </CardTitle>
            <FileCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              Repositories analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFavorites}</div>
            <p className="text-xs text-muted-foreground">
              Starred repositories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestCases}</div>
            <p className="text-xs text-muted-foreground">
              Generated test cases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Start analyzing repositories and improving your code quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={navigateToSearch}
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Search className="h-6 w-6" />
              <span>Search Repositories</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => navigate("/search?tab=trending")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Trending Repos</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => navigate("/search?tab=popular")}
            >
              <GitBranch className="h-6 w-6" />
              <span>Popular Projects</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => navigate("/documentation")}
            >
              <BookOpen className="h-6 w-6" />
              <span>Documentation</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favorites List */}
        <FavoritesList reloadKey={reloadKey} />
        {/* Recent Analyses */}
        <Card className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
            <CardDescription>
              Your recently analyzed repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No analyses yet</p>
                <p className="text-sm">
                  Start by searching for a repository to analyze
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAnalyses.map((analysis, index) => (
                  <div
                    key={`${analysis.projectId}-${index}`}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() =>
                      analysis.projectId &&
                      navigateToAnalysis(analysis.projectId)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {analysis.projectName || analysis.projectId}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Analyzed{" "}
                          {analysis.createdAt
                            ? new Date(analysis.createdAt).toLocaleDateString()
                            : ""}
                        </p>
                        {analysis.structure && (
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{analysis.structure.totalFiles} files</span>
                            <span>{analysis.structure.totalLines} lines</span>
                            {analysis.structure.languages && (
                              <span>
                                {Object.keys(analysis.structure.languages)[0]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
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
  );
}
