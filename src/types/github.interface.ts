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
export interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  private: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
}

export interface GitHubCreateRepoResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  git_url: string
  ssh_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  private: boolean
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
  }
}

export interface GitHubSearchResponse<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}

export interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file'
  content: string
  encoding: string
}