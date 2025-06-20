export interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir" | "blob" | "tree"
  size?: number
  download_url?: string
  content?: string
  mode?: string
  sha?: string
  url?: string
}

export interface GitHubRepo {
  name: string
  full_name: string
  description: string
  language: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  private: boolean
}