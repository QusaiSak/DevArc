export interface AiResponseOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
export interface ProjectData {
  name: string;
  description: string;
  type: string; // <-- Add this (e.g., "Web App", "API", "Mobile App")
  teamSize: string;
  timeline: string;
  complexity: string; // <-- Add this (e.g., "Low", "Medium", "High")
  requirements: string;
  keyFeatures: string;
  riskFactors: string;
  additionalContext: string;
}

export interface SDDProjectInput {
  name: string;
  description: string;
  type: string; // <-- Add this
  teamSize: string;
  timeline: string;
  complexity: string; // <-- Add this
  techStack: string;
  keyFeatures: string;
  riskFactors: string;
  requirements: string;
  additionalContext: string;
  sdlcModel: string;
}
