/**
 * Estimates the number of tokens in a given text string.
 * This is an approximation since different models tokenize text differently.
 * @param text The text to estimate tokens for
 * @returns Approximate number of tokens
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters or 0.75 words
  if (!text) return 0;

  // Count words and characters
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  // Take the average of word-based and character -based estimates
  const tokensFromWords = wordCount * 0.75;
  const tokensFromChars = charCount / 4;

  return Math.ceil((tokensFromWords + tokensFromChars) / 2);
}

/**
 * Splits text into chunks that don't exceed a maximum token size
 * @param text The text to split
 * @param maxTokens Maximum tokens per chunk (default: 2000)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxTokens: number = 2000): string[] {
  if (!text) return [];

  // If text is small enough, return as single chunk
  if (estimateTokenCount(text) <= maxTokens) {
    return [text];
  }

  // Simple splitting by paragraphs first
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokenCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokenCount(paragraph);

    // If single paragraph is too large, split by sentences
    if (paragraphTokens > maxTokens) {
      // Flush current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n\n"));
        currentChunk = [];
        currentTokenCount = 0;
      }

      // Split large paragraph into sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let sentenceChunk: string[] = [];
      let sentenceChunkTokens = 0;

      for (const sentence of sentences) {
        const sentenceTokens = estimateTokenCount(sentence);

        if (
          sentenceChunkTokens + sentenceTokens > maxTokens &&
          sentenceChunk.length > 0
        ) {
          chunks.push(sentenceChunk.join(" "));
          sentenceChunk = [];
          sentenceChunkTokens = 0;
        }

        sentenceChunk.push(sentence);
        sentenceChunkTokens += sentenceTokens;
      }

      // Add remaining sentences
      if (sentenceChunk.length > 0) {
        chunks.push(sentenceChunk.join(" "));
      }
    }
    // If adding this paragraph would exceed max tokens, start a new chunk
    else if (
      currentTokenCount + paragraphTokens > maxTokens &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.join("\n\n"));
      currentChunk = [paragraph];
      currentTokenCount = paragraphTokens;
    }
    // Add paragraph to current chunk
    else {
      currentChunk.push(paragraph);
      currentTokenCount += paragraphTokens;
    }
  }

  // Add the last chunk if not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  return chunks;
}

/**
 * Truncates text to a maximum number of tokens
 * @param text The text to truncate
 * @param maxTokens Maximum number of tokens (default: 1000)
 * @returns Truncated text
 */
export function truncateToTokens(
  text: string,
  maxTokens: number = 1000
): string {
  if (!text) return "";

  // If text is small enough, return as is
  if (estimateTokenCount(text) <= maxTokens) {
    return text;
  }

  // Simple truncation by characters (this is a fallback)
  const charsPerToken = 4; // Rough estimate
  const maxChars = maxTokens * charsPerToken;
  return text.length > maxChars ? text.substring(0, maxChars) + "..." : text;
}

/**
 * Summarizes large objects by truncating long strings and limiting array/object sizes
 * @param obj The object to summarize
 * @param maxStringLength Maximum length for string values
 * @param maxArrayLength Maximum number of array items to keep
 * @param maxDepth Maximum depth to traverse
 * @returns A summarized version of the object
 */
export function summarizeObject(
  obj: any,
  maxStringLength: number = 200,
  maxArrayLength: number = 10,
  maxDepth: number = 3,
  currentDepth: number = 0
): any {
  if (currentDepth > maxDepth) {
    return "[Max depth reached]";
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle strings
  if (typeof obj === "string") {
    return obj.length > maxStringLength
      ? obj.substring(0, maxStringLength) + "..."
      : obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length > maxArrayLength) {
      return [
        ...obj
          .slice(0, maxArrayLength)
          .map((item) =>
            summarizeObject(
              item,
              maxStringLength,
              maxArrayLength,
              maxDepth,
              currentDepth + 1
            )
          ),
        `[+${obj.length - maxArrayLength} more items]`,
      ];
    }
    return obj.map((item) =>
      summarizeObject(
        item,
        maxStringLength,
        maxArrayLength,
        maxDepth,
        currentDepth + 1
      )
    );
  }

  // Handle plain objects
  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = summarizeObject(
          obj[key],
          maxStringLength,
          maxArrayLength,
          maxDepth,
          currentDepth + 1
        );
      }
    }
    return result;
  }

  // Return other types as-is
  return obj;
}
