import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  addFavorite,
  removeFavorite,
  isFavorite as isFavoriteApi,
} from "@/lib/favoritesService";

interface FavoriteButtonProps {
  repository: any;
  className?: string;
  onFavoriteChange?: () => void; // Add callback to notify parent of changes
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  repository,
  className = "",
  onFavoriteChange,
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const repoId = `${repository.id}`;

  useEffect(() => {
    const checkFavorite = async () => {
      if (user?.id) {
        try {
          setIsFavorite(await isFavoriteApi(user.id, repoId));
        } catch {
          setIsFavorite(false);
        }
      }
    };
    checkFavorite();
  }, [user?.id, repoId]);

  const toggleFavorite = async () => {
    if (!user?.id) {
      toast("Authentication Required", {
        description: "Please sign in to add favorites.",
      });
      return;
    }
    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(user.id, repoId);
        setIsFavorite(false);
        toast("Removed from Favorites", {
          description: `${repository.name} has been removed from your favorites.`,
        });
      } else {
        await addFavorite(user.id, repository);
        setIsFavorite(true);
        toast("Added to Favorites", {
          description: `${repository.name} has been added to your favorites.`,
        });
      }
      // Notify parent component of the change
      onFavoriteChange?.();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast("Error", {
        description: "Failed to update favorites. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${className} ${
        isFavorite ? "bg-red-500 hover:bg-red-600" : ""
      }`}
    >
      <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorited" : "Add to Favorites"}
    </Button>
  );
};
