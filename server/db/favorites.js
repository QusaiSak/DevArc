const { db } = require("./client");
const { favorites } = require("./schema");
const { eq, and } = require("drizzle-orm");

async function addFavorite({ userId, repo }) {
  // Defensive: ensure required fields
  if (!repo || !repo.id || !repo.name || !repo.owner?.login)
    throw new Error("Invalid repo object");
  await db
    .insert(favorites)
    .values({
      userId,
      repoId: repo.id.toString(),
      repoName: repo.name,
      owner: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
      description: repo.description || "",
      language: repo.language || "",
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      htmlUrl: repo.html_url || "",
    })
    .onConflictDoNothing();
}

async function removeFavorite({ userId, repoId }) {
  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.repoId, repoId)));
}

async function isFavorite({ userId, repoId }) {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.repoId, repoId)));
  return result.length > 0;
}

async function getFavorites(userId) {
  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

module.exports = { addFavorite, removeFavorite, isFavorite, getFavorites };
