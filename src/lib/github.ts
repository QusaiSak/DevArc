import type { GitHubFile } from '@/types/github.interface'
import { Octokit } from '@octokit/rest'

export class GitHubService {
  private octokit: Octokit

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: 'DevArc-App v1.0.0',
    })
  }

  // Direct API calls using Octokit
  async fetch(endpoint: string) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const [method, ...pathParts] = cleanEndpoint.split('/')
    
    if (method === 'repos') {
      const [owner, repo, ...rest] = pathParts
      const resource = rest.join('/')
      
      if (resource === 'commits') {
        const { data } = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          per_page: 10
        })
        return data
      } else if (resource === '') {
        const { data } = await this.octokit.rest.repos.get({
          owner,
          repo
        })
        return data
      }
    }

    return this.octokit.request(`GET /${cleanEndpoint}`)
  }

  async getRepositoryStructure(owner: string, repo: string): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: 'HEAD',
        recursive: 'true'
      })

      // Transform the GitHub tree structure to our expected format
      const files: GitHubFile[] = (data.tree || []).map(item => ({
        path: item.path || '',
        name: item.path ? item.path.split('/').pop() || item.path : '',
        type: (item.type === 'blob' ? 'file' : item.type === 'tree' ? 'dir' : 'file') as GitHubFile['type'],
        size: item.size,
        mode: item.mode,
        sha: item.sha,
        url: item.url
      }))

      console.log(`Retrieved ${files.length} files from repository structure`)
      console.log('Sample files:', files.slice(0, 5))
      
      return files
    } catch (error) {
      console.error('Error fetching repository structure:', error)
      throw error
    }
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      })

      // Handle different content types
      if (Array.isArray(data)) {
        throw new Error('Path is a directory, not a file')
      }

      if (typeof data === 'object' && data !== null && 'content' in data && data.content) {
        // Decode base64 content using browser-compatible method
        const base64Content = data.content.replace(/\n/g, '')
        try {
          // Use built-in atob for base64 decoding
          const decodedContent = atob(base64Content)
          
          // Convert to proper UTF-8 string
          const bytes = new Uint8Array(decodedContent.length)
          for (let i = 0; i < decodedContent.length; i++) {
            bytes[i] = decodedContent.charCodeAt(i) & 0xff
          }
          
          return new TextDecoder('utf-8').decode(bytes)
        } catch (decodeError) {
          // Fallback: try direct decoding
          return atob(base64Content)
        }
      }

      if (typeof data === 'object' && data !== null && 'download_url' in data && data.download_url) {
        // Fallback: fetch from download URL
        const response = await fetch(data.download_url)
        return await response.text()
      }

      throw new Error('Unable to decode file content')
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error)
      throw error
    }
  }

  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getReadme({
        owner,
        repo,
      })
      
      // Handle base64 encoded README
      if (typeof data === 'object' && data !== null && 'content' in data && data.content) {
        const base64Content = data.content.replace(/\n/g, '')
        try {
          const decodedContent = atob(base64Content)
          const bytes = new Uint8Array(decodedContent.length)
          for (let i = 0; i < decodedContent.length; i++) {
            bytes[i] = decodedContent.charCodeAt(i) & 0xff
          }
          return new TextDecoder('utf-8').decode(bytes)
        } catch (decodeError) {
          return atob(base64Content)
        }
      }
      
      return ''
    } catch (error) {
      console.error('Error fetching README:', error)
      throw error
    }
  }

  async getUserRepositories(username: string, page = 1, perPage = 30): Promise<any[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc'
      })

      return data
    } catch (error) {
      console.error('Error fetching user repositories:', error)
      throw error
    }
  }

  async getAuthenticatedUserRepositories(page = 1, perPage = 30): Promise<any[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        page,
        per_page: perPage,
        sort: 'updated',
        direction: 'desc'
      })

      return data
    } catch (error) {
      console.error('Error fetching authenticated user repositories:', error)
      throw error
    }
  }

  // This is the method your repoModal is looking for
  async getRepositories(username?: string, page = 1, perPage = 100): Promise<any[]> {
    try {
      let allRepos: any[] = []
      let currentPage = 1
      let hasMore = true

      // Fetch all repositories by paginating through all pages
      while (hasMore && currentPage <= 10) { // Limit to 10 pages (1000 repos max) to avoid infinite loops
        let pageRepos: any[]
        
        if (username) {
          const { data } = await this.octokit.rest.repos.listForUser({
            username,
            page: currentPage,
            per_page: 100, // GitHub's max per page
            sort: 'updated',
            direction: 'desc'
          })
          pageRepos = data
        } else {
          const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
            page: currentPage,
            per_page: 100,
            sort: 'updated',
            direction: 'desc'
          })
          pageRepos = data
        }

        if (pageRepos.length === 0) {
          hasMore = false
        } else {
          allRepos = allRepos.concat(pageRepos)
          currentPage++
          
          // If we got less than 100 repos, we've reached the end
          if (pageRepos.length < 100) {
            hasMore = false
          }
        }
      }

      console.log(`Fetched ${allRepos.length} total repositories`)
      return allRepos
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw error
    }
  }

  async searchRepositories(query: string, page = 1, perPage = 30): Promise<any> {
    try {
      const { data } = await this.octokit.rest.search.repos({
        q: query,
        page,
        per_page: perPage,
        sort: 'stars',
        order: 'desc'
      })

      return data
    } catch (error) {
      console.error('Error searching repositories:', error)
      throw error
    }
  }
}
