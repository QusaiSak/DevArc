import {
  estimateTokenCount,
  chunkText,
  summarizeObject,
} from "./textProcessing";

interface ProcessedInput {
  content: string;
  isTruncated: boolean;
  tokenCount: number;
  chunks?: string[];
}

/**
 * Processes input for AI prompts to ensure it stays within token limits
 */
export class AIInputProcessor {
  private maxTokens: number;
  private chunkSize: number;

  /**
   * @param maxTokens Maximum tokens allowed in a single request (default: 8000 for most models)
   * @param chunkSize Maximum tokens per chunk when splitting is needed (default: 2000)
   */
  constructor(maxTokens: number = 8000, chunkSize: number = 2000) {
    this.maxTokens = maxTokens;
    this.chunkSize = Math.min(chunkSize, maxTokens);
  }

  /**
   * Process input text to ensure it's within token limits
   * @param content The input text to process
   * @returns Processed input with content and metadata
   */
  processText(content: string): ProcessedInput {
    const tokenCount = estimateTokenCount(content);

    if (tokenCount <= this.maxTokens) {
      return {
        content,
        isTruncated: false,
        tokenCount,
      };
    }

    // If content is too large, split into chunks
    const chunks = chunkText(content, this.chunkSize);
    const truncatedContent = chunks[0];

    return {
      content: truncatedContent,
      isTruncated: true,
      tokenCount: estimateTokenCount(truncatedContent),
      chunks,
    };
  }

  /**
   * Process a JSON object to ensure it's within token limits when stringified
   * @param data The data object to process
   * @param summarize Whether to summarize large objects (true) or truncate (false)
   * @returns Processed input with stringified content and metadata
   */
  processData<T extends object>(
    data: T,
    summarize: boolean = true
  ): ProcessedInput {
    let content: string;
    let isTruncated = false;

    // First try to stringify the full object
    try {
      content = JSON.stringify(data);
      if (estimateTokenCount(content) <= this.maxTokens) {
        return {
          content,
          isTruncated: false,
          tokenCount: estimateTokenCount(content),
        };
      }
    } catch (error) {
      // If stringification fails, try with a summarized version
      console.warn(
        "Failed to stringify object, falling back to summary:",
        error
      );
    }

    // If we get here, the object is too large or couldn't be stringified
    isTruncated = true;

    if (summarize) {
      // Try to create a summarized version
      const summarized = summarizeObject(data);
      content = JSON.stringify(summarized);

      // If summarized version is still too large, fall back to truncation
      if (estimateTokenCount(content) > this.maxTokens) {
        content = content.substring(0, this.chunkSize * 4); // Rough estimate of characters
      }
    } else {
      // Just truncate the string representation
      const str = JSON.stringify(data);
      content = str.substring(0, this.chunkSize * 4); // Rough estimate of characters
    }

    return {
      content,
      isTruncated,
      tokenCount: estimateTokenCount(content),
    };
  }

  /**
   * Process a folder tree or similar hierarchical structure
   * @param tree The tree structure to process
   * @param maxDepth Maximum depth to include
   * @param maxChildren Maximum number of children per node
   * @returns Processed input with stringified content
   */
  processTree(
    tree: any,
    maxDepth: number = 3,
    maxChildren: number = 20
  ): ProcessedInput {
    const processNode = (node: any, depth: number = 0): any => {
      if (depth > maxDepth) {
        return "[Max depth reached]";
      }

      if (Array.isArray(node)) {
        return node
          .slice(0, maxChildren)
          .map((item, index) =>
            index < maxChildren - 1
              ? processNode(item, depth + 1)
              : `[+${node.length - maxChildren} more]`
          );
      }

      if (node && typeof node === "object") {
        const result: Record<string, any> = {};
        for (const key in node) {
          if (Object.prototype.hasOwnProperty.call(node, key)) {
            result[key] = processNode(node[key], depth + 1);
          }
        }
        return result;
      }

      return node;
    };

    const processed = processNode(tree);
    return this.processData(processed, false);
  }

  /**
   * Process API endpoints data
   * @param endpoints Array of API endpoints
   * @param maxEndpoints Maximum number of endpoints to include
   * @returns Processed input with stringified content
   */
  processApiEndpoints(
    endpoints: Array<{
      path: string;
      method: string;
      description?: string;
      parameters?: any[];
    }>,
    maxEndpoints: number = 20
  ): ProcessedInput {
    if (!endpoints || !Array.isArray(endpoints)) {
      return {
        content: "[]",
        isTruncated: false,
        tokenCount: 2,
      };
    }

    const limitedEndpoints = endpoints.slice(0, maxEndpoints);
    const isTruncated = endpoints.length > maxEndpoints;

    // Create a simplified version of each endpoint
    const simplified = limitedEndpoints.map((endpoint) => ({
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description
        ? endpoint.description.substring(0, 200) +
          (endpoint.description.length > 200 ? "..." : "")
        : undefined,
      parameters: endpoint.parameters
        ? endpoint.parameters.slice(0, 5).map((p) => ({
            name: p.name,
            type: p.type,
            required: p.required,
          }))
        : undefined,
    }));

    return this.processData({
      endpoints: simplified,
      totalEndpoints: endpoints.length,
      truncated: isTruncated ? endpoints.length - maxEndpoints : 0,
    });
  }
}

// Default instance with standard settings
export const defaultAIInputProcessor = new AIInputProcessor();
