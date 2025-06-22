import type {
  GitHubFile,
  Repository,
  GitHubCreateRepoResponse,
  GitHubCommit,
  GitHubSearchResponse,
} from "@/types/github.interface";
import { Octokit } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: "DevArc-App v1.0.0",
    });
  }

  // Helper function to sanitize GitHub repository descriptions
  private sanitizeDescription(description: string): string {
    return (
      description
        // Remove control characters using Unicode ranges
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
        // Remove newlines, tabs, carriage returns specifically
        .replace(/[\r\n\t\f\v]/g, " ")
        // Replace multiple spaces with single space
        .replace(/\s+/g, " ")
        // Remove leading/trailing whitespace
        .trim()
        // Limit to GitHub's description length limit
        .substring(0, 350)
    );
  }

  // Helper function to sanitize GitHub repository names
  private sanitizeName(name: string): string {
    let sanitizedName = name
      .replace(/[^a-zA-Z0-9\-_.]/g, "-") // Replace invalid characters with hyphens
      .replace(/^[^a-zA-Z0-9]/, "") // Remove leading special characters
      .replace(/[^a-zA-Z0-9]$/, "") // Remove trailing special characters
      .toLowerCase(); // Convert to lowercase

    // Ensure name is not empty and has valid length
    if (!sanitizedName || sanitizedName.length === 0) {
      sanitizedName = "project-" + Date.now();
    }
    if (sanitizedName.length > 100) {
      sanitizedName = sanitizedName.substring(0, 100);
    }

    return sanitizedName;
  }

  // Direct API calls using Octokit
  async fetch(endpoint: string) {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    const [method, ...pathParts] = cleanEndpoint.split("/");

    if (method === "repos") {
      const [owner, repo, ...rest] = pathParts;
      const resource = rest.join("/");

      if (resource === "commits") {
        const { data } = await this.octokit.rest.repos.listCommits({
          owner,
          repo,
          per_page: 10,
        });
        return data;
      } else if (resource === "") {
        const { data } = await this.octokit.rest.repos.get({
          owner,
          repo,
        });
        return data;
      }
    }

    return this.octokit.request(`GET /${cleanEndpoint}`);
  }

  async getRepositoryStructure(
    owner: string,
    repo: string
  ): Promise<GitHubFile[]> {
    try {
      const { data } = await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: "HEAD",
        recursive: "true",
      });

      // Transform the GitHub tree structure to our expected format
      const files: GitHubFile[] = (data.tree || []).map((item) => ({
        path: item.path || "",
        name: item.path ? item.path.split("/").pop() || item.path : "",
        type: (item.type === "blob"
          ? "file"
          : item.type === "tree"
          ? "dir"
          : "file") as GitHubFile["type"],
        size: item.size,
        mode: item.mode,
        sha: item.sha,
        url: item.url,
      }));

      console.log(`Retrieved ${files.length} files from repository structure`);
      console.log("Sample files:", files.slice(0, 5));

      return files;
    } catch (error) {
      console.error("Error fetching repository structure:", error);
      throw error;
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string
  ): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      // Handle different content types
      if (Array.isArray(data)) {
        throw new Error("Path is a directory, not a file");
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "content" in data &&
        data.content
      ) {
        // Decode base64 content using browser-compatible method
        const base64Content = data.content.replace(/\n/g, "");
        try {
          // Use built-in atob for base64 decoding
          const decodedContent = atob(base64Content);

          // Convert to proper UTF-8 string
          const bytes = new Uint8Array(decodedContent.length);
          for (let i = 0; i < decodedContent.length; i++) {
            bytes[i] = decodedContent.charCodeAt(i) & 0xff;
          }

          return new TextDecoder("utf-8").decode(bytes);
        } catch (decodeError) {
          // Fallback: try direct decoding
          return atob(base64Content);
        }
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "download_url" in data &&
        data.download_url
      ) {
        // Fallback: fetch from download URL
        const response = await fetch(data.download_url);
        return await response.text();
      }

      throw new Error("Unable to decode file content");
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error);
      throw error;
    }
  }

  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getReadme({
        owner,
        repo,
      });

      // Handle base64 encoded README
      if (
        typeof data === "object" &&
        data !== null &&
        "content" in data &&
        data.content
      ) {
        const base64Content = data.content.replace(/\n/g, "");
        try {
          const decodedContent = atob(base64Content);
          const bytes = new Uint8Array(decodedContent.length);
          for (let i = 0; i < decodedContent.length; i++) {
            bytes[i] = decodedContent.charCodeAt(i) & 0xff;
          }
          return new TextDecoder("utf-8").decode(bytes);
        } catch (decodeError) {
          return atob(base64Content);
        }
      }

      return "";
    } catch (error) {
      console.error("Error fetching README:", error);
      throw error;
    }
  }
  async getUserRepositories(
    username: string,
    page = 1,
    perPage = 30
  ): Promise<Repository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        page,
        per_page: perPage,
        sort: "updated",
        direction: "desc",
      });

      // Transform GitHub API response to our Repository interface
      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || "",
        html_url: repo.html_url,
        clone_url: repo.clone_url || "",
        language: repo.language || "",
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        updated_at: repo.updated_at || "",
        private: repo.private,
        owner: {
          login: repo.owner?.login || "",
          avatar_url: repo.owner?.avatar_url || "",
        },
      }));
    } catch (error) {
      console.error("Error fetching user repositories:", error);
      throw error;
    }
  }
  async getAuthenticatedUserRepositories(
    page = 1,
    perPage = 30
  ): Promise<Repository[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        page,
        per_page: perPage,
        sort: "updated",
        direction: "desc",
      });

      // Transform GitHub API response to our Repository interface
      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description || "",
        html_url: repo.html_url,
        clone_url: repo.clone_url || "",
        language: repo.language || "",
        stargazers_count: repo.stargazers_count || 0,
        forks_count: repo.forks_count || 0,
        updated_at: repo.updated_at || "",
        private: repo.private,
        owner: {
          login: repo.owner?.login || "",
          avatar_url: repo.owner?.avatar_url || "",
        },
      }));
    } catch (error) {
      console.error("Error fetching authenticated user repositories:", error);
      throw error;
    }
  }

  // This is the method your repoModal is looking for
  async getRepositories(username?: string): Promise<Repository[]> {
    try {
      let allRepos: Repository[] = [];
      let currentPage = 1;
      let hasMore = true;

      // Fetch all repositories by paginating through all pages
      while (hasMore && currentPage <= 10) {
        // Limit to 10 pages (1000 repos max) to avoid infinite loops
        let pageRepos: Repository[];

        if (username) {
          pageRepos = await this.getUserRepositories(
            username,
            currentPage,
            100
          );
        } else {
          pageRepos = await this.getAuthenticatedUserRepositories(
            currentPage,
            100
          );
        }

        if (pageRepos.length === 0) {
          hasMore = false;
        } else {
          allRepos = allRepos.concat(pageRepos);
          currentPage++;

          // If we got less than 100 repos, we've reached the end
          if (pageRepos.length < 100) {
            hasMore = false;
          }
        }
      }

      console.log(`Fetched ${allRepos.length} total repositories`);
      return allRepos;
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw error;
    }
  }

  async searchRepositories(
    query: string,
    page = 1,
    perPage = 30
  ): Promise<GitHubSearchResponse<Repository>> {
    try {
      const { data } = await this.octokit.rest.search.repos({
        q: query,
        page,
        per_page: perPage,
        sort: "stars",
        order: "desc",
      });

      return data;
    } catch (error) {
      console.error("Error searching repositories:", error);
      throw error;
    }
  }

  /**
   * Create a new repository under the authenticated user.
   */
  async createRepository(
    name: string,
    description = "",
    isPrivate = false
  ): Promise<GitHubCreateRepoResponse> {
    try {
      // Use helper functions to sanitize inputs
      const sanitizedName = this.sanitizeName(name);
      const sanitizedDescription = this.sanitizeDescription(description);

      console.log(`🔧 Creating repository "${sanitizedName}"`);
      console.log(`📝 Sanitized description: "${sanitizedDescription}"`);

      const { data } = await this.octokit.rest.repos.createForAuthenticatedUser(
        {
          name: sanitizedName,
          description: sanitizedDescription,
          private: isPrivate,
          auto_init: false, // Don't auto-initialize since we'll push our own README
          has_issues: true,
          has_projects: true,
          has_wiki: false,
        }
      );
      console.log(`✅ Repository "${sanitizedName}" created successfully.`);
      return data;
    } catch (error) {
      console.error("❌ Error creating repository:", error);

      // Provide more helpful error messages
      if (
        error instanceof Error &&
        error.message.includes("name already exists")
      ) {
        const timestamp = Date.now();
        console.log(
          `🔄 Repository name exists, trying with timestamp: ${name}-${timestamp}`
        );
        return this.createRepository(
          `${name}-${timestamp}`,
          description,
          isPrivate
        );
      }

      throw error;
    }
  }

  /**
   * Push a file (create/update) to a repository.
   */
  async pushFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch = "main"
  ): Promise<any> {
    try {
      console.log(`🔍 Pushing file "${path}" to "${repo}"`);
      console.log(`📄 Content type: ${typeof content}`);
      console.log(`📄 Content length: ${content.length}`);
      console.log(
        `📄 Content preview (first 200 chars):`,
        content.substring(0, 200)
      );

      // Check if the file already exists to fetch its SHA
      let sha: string | undefined = undefined;
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });

        if (!Array.isArray(data) && "sha" in data && data.sha) {
          sha = data.sha;
        }
      } catch (err: any) {
        if (err.status !== 404) {
          console.error("Error checking file existence:", err);
          throw err;
        }
        // File doesn't exist — this is a create operation
      }

      // Encode content to base64 (browser-compatible)
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents(
        {
          owner,
          repo,
          path,
          message,
          content: encodedContent,
          sha, // Include SHA if updating existing file
          branch,
          committer: {
            name: "DevArc Bot",
            email: "bot@devarc.app",
          },
        }
      );

      console.log(
        `✅ File "${path}" pushed to "${repo}" on branch "${branch}"`
      );
      return data;
    } catch (error) {
      console.error(`❌ Error pushing file to ${repo}/${path}:`, error);
      throw error;
    }
  }

  /**
   * Create a repository and push initial README
   */
  async createRepositoryWithReadme(
    name: string,
    description: string,
    readmeContent: string,
    isPrivate = true
  ): Promise<{ repo: any; readmeCommit: any }> {
    try {
      // 1. Create the repository
      const repo = await this.createRepository(name, description, isPrivate);

      // 2. Push README.md to the repository
      const readmeCommit = await this.pushFile(
        repo.owner.login,
        repo.name,
        "README.md",
        readmeContent,
        "🚀 Initial commit: Add comprehensive Software Design Document"
      );

      console.log(`✅ Repository "${name}" created with README successfully`);

      return { repo, readmeCommit };
    } catch (error) {
      console.error("❌ Error creating repository with README:", error);
      throw error;
    }
  }
}
