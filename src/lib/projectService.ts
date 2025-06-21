import type { CreateProjectData, UpdateProjectData } from "@/types/project.interface";
import { GitHubService } from './github';

// API service for projects
const API_BASE = 'http://localhost:4000/api';

// Create a new project
export async function createProject(data: CreateProjectData) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

// Get all user's projects
export async function getAllUserProjects() {
  const res = await fetch(`${API_BASE}/projects`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects || [];
}

// Get projects with filters
export async function getProjectsWithFilters(visibility?: string, search?: string) {
  const params = new URLSearchParams();
  if (visibility) params.append('visibility', visibility);
  if (search) params.append('search', search);
  
  const url = `${API_BASE}/projects${params.toString() ? `?${params.toString()}` : ''}`;
  
  const res = await fetch(url, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects || [];
}

// Get specific project by ID
export async function getProjectById(projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch project');
  const data = await res.json();
  return data.project;
}

// Update project
export async function updateProject(projectId: number, data: UpdateProjectData) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

// Delete project
export async function deleteProject(projectId: number) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete project');
  return res.json();
}

// Get project statistics
export async function getProjectStats() {
  const res = await fetch(`${API_BASE}/projects/stats`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch project statistics');
  const data = await res.json();
  return data.stats;
}

// Search projects
export async function searchProjects(searchTerm: string) {
  return getProjectsWithFilters(undefined, searchTerm);
}

// Get projects by visibility
export async function getProjectsByVisibility(visibility: 'private' | 'public') {
  return getProjectsWithFilters(visibility);
}

// Helper function to get GitHub access token
async function getGitHubToken(): Promise<string> {
  const res = await fetch(`${API_BASE}/github-token`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to get GitHub token');
  const data = await res.json();
  return data.access_token;
}

// Create complete project with GitHub integration using GitHubService directly
export async function createProjectWithGitHubDirect(projectData: {
  name: string;
  description: string;
  type?: string;
  teamSize?: string;
  timeline?: string;
  complexity?: string;
  techStack?: string;
  keyFeatures?: string;
  riskFactors?: string;
  requirements?: string;
  additionalContext?: string;
  sdlc: any;
  questions?: any[];
  tags?: string;
  visibility?: string;
  sddContent: string;
}) {
  try {
    // 1. Get GitHub access token
    console.log('🔗 Getting GitHub access token...');
    const token = await getGitHubToken();
    
    // 2. Initialize GitHub service with token
    console.log('🔗 Initializing GitHub service...');
    const githubService = new GitHubService(token);

    // 3. Create repository with README using GitHubService
    console.log('🚀 Creating GitHub repository with README...');
    console.log('📋 Project name:', projectData.name);
    console.log('📋 Project description:', JSON.stringify(projectData.description));
    console.log('📋 Description length:', projectData.description.length);
    console.log('📋 SDD Content type:', typeof projectData.sddContent);
    console.log('📋 SDD Content length:', projectData.sddContent.length);
    console.log('📋 SDD Content preview (first 200 chars):', projectData.sddContent.substring(0, 200));
    
    const { repo, readmeCommit } = await githubService.createRepositoryWithReadme(
      projectData.name,
      projectData.description,
      projectData.sddContent,
      true // private repo
    );

    // 4. Create project in database
    console.log('💾 Storing project data...');
    const createResult = await createProject({
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      teamSize: projectData.teamSize,
      timeline: projectData.timeline,
      complexity: projectData.complexity,
      techStack: projectData.techStack,
      keyFeatures: projectData.keyFeatures,
      riskFactors: projectData.riskFactors,
      requirements: projectData.requirements,
      additionalContext: projectData.additionalContext,
      sdlc: projectData.sdlc,
      questions: projectData.questions || [],
      repoUrl: repo.html_url,
      tags: projectData.tags || '',
      visibility: projectData.visibility || 'private'
    });

    console.log('✅ Project created successfully with GitHub integration');

    return {
      success: true,
      project: createResult.project,
      repo: repo,
      readmeCommit: readmeCommit,
      message: 'Project created successfully with GitHub repository and documentation'
    };

  } catch (error) {
    console.error('❌ Error creating project with GitHub:', error);
    throw error;
  }
}

// Additional GitHub utilities using GitHubService (for future use)
export async function getGitHubService(): Promise<GitHubService> {
  const token = await getGitHubToken();
  return new GitHubService(token);
}

// Get repository files (for importing existing repos)
export async function getRepositoryFiles(owner: string, repo: string) {
  const githubService = await getGitHubService();
  return await githubService.getRepositoryStructure(owner, repo);
}

// Get file content from repository
export async function getFileContent(owner: string, repo: string, path: string) {
  const githubService = await getGitHubService();
  return await githubService.getFileContent(owner, repo, path);
}