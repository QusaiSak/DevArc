const { db } = require('./client');
const { projects } = require('./schema');
const { eq, desc, and } = require('drizzle-orm');

async function createProject(projectData) {
  try {
    const {
      userId,
      name,
      description,
      sdlc,
      questions,
      repoUrl,
      tags,
      visibility = 'private'
    } = projectData;

    const [newProject] = await db.insert(projects).values({
      userId,
      name,
      description,
      sdlc,
      questions: questions || [],
      repoUrl: repoUrl || null,
      tags: tags || '',
      visibility,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log(`✅ Project created: ${newProject.name} (ID: ${newProject.id})`);
    return newProject;
  } catch (error) {
    console.error('❌ Error creating project:', error);
    throw error;
  }
}

async function getUserProjects(userId) {
  try {
    const userProjects = await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));

    return userProjects;
  } catch (error) {
    console.error('❌ Error fetching user projects:', error);
    throw error;
  }
}


async function getProjectById(projectId, userId) {
  try {
    const [project] = await db.select().from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.userId, userId)
      ));

    return project || null;
  } catch (error) {
    console.error('❌ Error fetching project by ID:', error);
    throw error;
  }
}

async function updateProject(projectId, userId, updateData) {
  try {
    // First check if project exists and belongs to user
    const existingProject = await getProjectById(projectId, userId);
    if (!existingProject) {
      return null;
    }

    const {
      name,
      description,
      sdlc,
      questions,
      tags,
      visibility
    } = updateData;

    // Update project
    const [updatedProject] = await db.update(projects)
      .set({
        name: name !== undefined ? name : existingProject.name,
        description: description !== undefined ? description : existingProject.description,
        sdlc: sdlc !== undefined ? sdlc : existingProject.sdlc,
        questions: questions !== undefined ? questions : existingProject.questions,
        tags: tags !== undefined ? tags : existingProject.tags,
        visibility: visibility !== undefined ? visibility : existingProject.visibility,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    console.log(`✅ Project updated: ${updatedProject.name} (ID: ${updatedProject.id})`);
    return updatedProject;
  } catch (error) {
    console.error('❌ Error updating project:', error);
    throw error;
  }
}

async function deleteProject(projectId, userId) {
  try {
    // First check if project exists and belongs to user
    const existingProject = await getProjectById(projectId, userId);
    if (!existingProject) {
      return false;
    }

    // Delete project
    await db.delete(projects)
      .where(eq(projects.id, projectId));

    console.log(`✅ Project deleted: ${existingProject.name} (ID: ${existingProject.id})`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    throw error;
  }
}

async function getProjectsByVisibility(userId, visibility) {
  try {
    const filteredProjects = await db.select().from(projects)
      .where(and(
        eq(projects.userId, userId),
        eq(projects.visibility, visibility)
      ))
      .orderBy(desc(projects.createdAt));

    return filteredProjects;
  } catch (error) {
    console.error('❌ Error fetching projects by visibility:', error);
    throw error;
  }
}

async function searchUserProjects(userId, searchTerm) {
  try {
    // Note: This uses a simple LIKE search. For production, consider using full-text search
    const { ilike } = require('drizzle-orm');
    
    const matchingProjects = await db.select().from(projects)
      .where(and(
        eq(projects.userId, userId),
        or(
          ilike(projects.name, `%${searchTerm}%`),
          ilike(projects.description, `%${searchTerm}%`)
        )
      ))
      .orderBy(desc(projects.createdAt));

    return matchingProjects;
  } catch (error) {
    console.error('❌ Error searching projects:', error);
    throw error;
  }
}

async function getProjectStats(userId) {
  try {
    const { count } = require('drizzle-orm');
    
    const totalProjects = await db.select({
      count: count()
    }).from(projects)
      .where(eq(projects.userId, userId));

    const privateProjects = await db.select({
      count: count()
    }).from(projects)
      .where(and(
        eq(projects.userId, userId),
        eq(projects.visibility, 'private')
      ));

    const publicProjects = await db.select({
      count: count()
    }).from(projects)
      .where(and(
        eq(projects.userId, userId),
        eq(projects.visibility, 'public')
      ));

    return {
      total: totalProjects[0]?.count || 0,
      private: privateProjects[0]?.count || 0,
      public: publicProjects[0]?.count || 0
    };
  } catch (error) {
    console.error('❌ Error fetching project stats:', error);
    throw error;
  }
}

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByVisibility,
  searchUserProjects,
  getProjectStats
};