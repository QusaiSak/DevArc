// API service for analyses
const API_BASE = "http://localhost:4000/api";

export async function saveAnalysis(userId: number, data: any) {
  const res = await fetch(`${API_BASE}/analyses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save analysis");
  return res.json();
}

export async function getAnalysis(userId: number, projectId: string) {
  const encodedProjectId = encodeURIComponent(projectId);
  const res = await fetch(`${API_BASE}/analyses/${encodedProjectId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}

export async function getAllUserAnalyses(userId: number) {
  const res = await fetch(`${API_BASE}/analyses`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch analyses");
  const data = await res.json();
  return data.analyses || [];
}
