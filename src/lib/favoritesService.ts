// This service will call the backend API for favorites

interface Repository {
  id: number | string;
  name: string;
  owner: {
    login: string;
    avatar_url?: string;
  };
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  html_url?: string;
}

interface Favorite {
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

const API_BASE = "http://localhost:4000/api";

export async function addFavorite(userId: number, repo: Repository) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repo }),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function removeFavorite(userId: number, repoId: string) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ repoId }),
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
  return res.json();
}

export async function getFavorites(userId: number) {
  const res = await fetch(`${API_BASE}/favorites`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function isFavorite(userId: number, repoId: string) {
  const encodedRepoId = encodeURIComponent(repoId);
  const res = await fetch(`${API_BASE}/favorites/check/${encodedRepoId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to check favorite status");
  const data = await res.json();
  return data.isFavorite;
}
