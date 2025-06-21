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
  name: string
  description: string
  type: string
  teamSize: string
  timeline: string
  complexity: string
  requirements: string
  keyFeatures: string
  riskFactors: string
  additionalContext: string
}

export interface SDDProjectInput {
  name: string
  description: string
  teamSize: string
  timeline: string
  techStack: string
  keyFeatures: string
  riskFactors: string
  requirements: string
  additionalContext: string
  sdlcModel: string
}