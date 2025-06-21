export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  sdlc: any;
  questions: any[];
  tags: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  total: number;
  private: number;
  public: number;
}

export interface CreateProjectData {
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
  repoUrl?: string;
  tags?: string;
  visibility?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  sdlc?: any;
  questions?: any[];
  tags?: string;
  visibility?: string;
}

export interface Project {
  id: number;
  userId: number;
  name: string;
  description: string;
  sdlc: any;
  questions: any[];
  tags: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
    repoUrl?: string;
    type?: string;
    teamSize?: string;
    timeline?: string;
    complexity?: string;
    techStack?: string;
    keyFeatures?: string;
    riskFactors?: string;
    requirements?: string;
    additionalContext?: string;
}

export interface ProjectStats {
  total: number;
  private: number;
  public: number;
}