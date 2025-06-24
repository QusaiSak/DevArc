import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, GitFork, ExternalLink, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFavorites, removeFavorite } from "@/lib/favoritesService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Favorite {
  id: string;
  repoId: string;
  repoName: string;
  owner: string;
  avatarUrl?: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  htmlUrl?: string;
}

export function useFavoritesList() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const response = await getFavorites(user.id);
        setFavorites(response.favorites || []);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return { favorites, isLoading, reloadFavorites: loadFavorites };
}

export const FavoritesList: React.FC<{ reloadKey?: number }> = ({
  reloadKey,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const response = await getFavorites(user.id);
        setFavorites(response.favorites || []);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, reloadKey]);

  const handleRemoveFavorite = async (repoId: string) => {
    if (user?.id) {
      try {
        await removeFavorite(user.id, repoId);
        setFavorites((prev) => prev.filter((fav) => fav.repoId !== repoId));
        toast("Removed from Favorites", {
          description: "Repository has been removed from your favorites.",
        });
      } catch (error) {
        console.error("Error removing favorite:", error);
        toast("Error", {
          description: "Failed to remove favorite. Please try again.",
        });
      }
    }
  };

  const openRepository = (favorite: Favorite) => {
    navigate(`/repository/${favorite.owner}/${favorite.repoName}`);
  };

  const openGitHub = (htmlUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(htmlUrl, "_blank");
  };

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Heart className="h-5 w-5 text-destructive" />
            Favorite Repositories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading">
            <Heart className="h-5 w-5 text-destructive" />
            Favorite Repositories
          </CardTitle>
          <CardDescription className="font-body">
            No favorite repositories yet. Add some by clicking the heart icon on
            repository pages.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading">
          <Heart className="h-5 w-5 text-destructive" />
          Favorite Repositories ({favorites.length})
        </CardTitle>
        <CardDescription className="font-body">
          Your starred repositories for quick access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="border border-border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors"
              onClick={() => openRepository(favorite)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {favorite.avatarUrl && (
                      <img
                        src={favorite.avatarUrl}
                        alt={favorite.owner}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <h3 className="font-semibold text-lg hover:text-primary text-foreground font-heading">
                      {favorite.repoName}
                    </h3>
                  </div>
                  {favorite.description && (
                    <p className="text-muted-foreground mb-3 line-clamp-2 font-body">
                      {favorite.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-body">
                    {favorite.language && <span>{favorite.language}</span>}
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {favorite.stars || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-4 w-4" />
                      {favorite.forks || 0}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {favorite.htmlUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => openGitHub(favorite.htmlUrl!, e)}
                      className="flex items-center gap-1 font-body"
                    >
                      <ExternalLink className="h-4 w-4" />
                      GitHub
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(favorite.repoId);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 font-body"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
