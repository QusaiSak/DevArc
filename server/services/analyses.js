const { db } = require("../db/client");
const { analyses } = require("../schema/schema");
const { eq, and, desc } = require("drizzle-orm");

async function saveAnalysis(userId, data) {
  const [analysis] = await db
    .insert(analyses)
    .values({
      userId,
      projectId: data.projectId,
      projectName: data.projectName,
      structure: data.structure, // Already stringified from frontend
      codeAnalysis: data.codeAnalysis, // Already stringified from frontend
      documentation: data.documentation, // Already stringified from frontend
      testCases: data.testCases, // Already stringified from frontend
    })
    .returning();
  return analysis;
}

async function getAnalysis(userId, projectId) {
  const [analysis] = await db
    .select()
    .from(analyses)
    .where(and(eq(analyses.userId, userId), eq(analyses.projectId, projectId)))
    .orderBy(desc(analyses.createdAt));

  if (!analysis) return null;

  return {
    ...analysis,
    structure: analysis.structure ? JSON.parse(analysis.structure) : null,
    codeAnalysis: analysis.codeAnalysis
      ? JSON.parse(analysis.codeAnalysis)
      : null,
    documentation: analysis.documentation
      ? JSON.parse(analysis.documentation)
      : null,
    testCases: analysis.testCases ? JSON.parse(analysis.testCases) : null,
  };
}

async function getAllUserAnalyses(userId) {
  const userAnalyses = await db
    .select()
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt));

  return userAnalyses.map((analysis) => ({
    ...analysis,
    structure: analysis.structure ? JSON.parse(analysis.structure) : null,
    codeAnalysis: analysis.codeAnalysis
      ? JSON.parse(analysis.codeAnalysis)
      : null,
    documentation: analysis.documentation
      ? JSON.parse(analysis.documentation)
      : null,
    testCases: analysis.testCases ? JSON.parse(analysis.testCases) : null,
  }));
}

module.exports = { saveAnalysis, getAnalysis, getAllUserAnalyses };
