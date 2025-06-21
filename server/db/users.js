const { db } = require('./client');
const { users } = require('./schema');
const { eq } = require('drizzle-orm');

async function createOrUpdateUser(githubUser) {
  const existingUser = await db.select().from(users).where(eq(users.githubId, githubUser.id));
  
  if (existingUser.length > 0) {
    // Update existing user
    const [updatedUser] = await db.update(users)
      .set({
        username: githubUser.login,
        email: githubUser.email,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        accessToken: githubUser.access_token,
        updatedAt: new Date(),
      })
      .where(eq(users.githubId, githubUser.id))
      .returning();
    return updatedUser;
  } else {
    // Create new user
    const [newUser] = await db.insert(users).values({
      githubId: githubUser.id,
      username: githubUser.login,
      email: githubUser.email,
      name: githubUser.name,
      avatarUrl: githubUser.avatar_url,
      accessToken: githubUser.access_token,
    }).returning();
    return newUser;
  }
}

async function getUserById(id) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

async function getUserByGithubId(githubId) {
  const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
  return user;
}

module.exports = { createOrUpdateUser, getUserById, getUserByGithubId };
