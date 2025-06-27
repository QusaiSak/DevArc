const express = require("express");
const jwt = require("jsonwebtoken");
const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByVisibility,
  searchUserProjects,
  getProjectStats,
} = require("../db/project");

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret"
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// GET /api/projects - Get all user's projects
router.get("/", authenticate, async (req, res) => {
  try {
    const { visibility, search } = req.query;

    let projects;
    if (search) {
      projects = await searchUserProjects(req.user.dbId, search);
    } else if (visibility) {
      projects = await getProjectsByVisibility(req.user.dbId, visibility);
    } else {
      projects = await getUserProjects(req.user.dbId);
    }

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch projects",
    });
  }
});

// GET /api/projects/stats - Get project statistics
router.get("/stats", authenticate, async (req, res) => {
  try {
    const stats = await getProjectStats(req.user.dbId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("❌ Error fetching project stats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch project statistics",
    });
  }
});

// GET /api/projects/:id - Get specific project
router.get("/:id", authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await getProjectById(projectId, req.user.dbId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch project",
    });
  }
});

// POST /api/projects - Create new project
router.post("/", authenticate, async (req, res) => {
  try {
    console.log("📥 Received project creation request");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const {
      name,
      description,
      sdlc,
      questions,
      repoUrl,
      tags,
      visibility = "private",
    } = req.body;


    // Validate required fields
    if (!name || !description) {
      console.log("❌ Validation failed: missing name or description");
      return res.status(400).json({
        success: false,
        error: "Project name and description are required",
      });
    }

    if (!sdlc) {
      console.log("❌ Validation failed: missing SDLC");
      return res.status(400).json({
        success: false,
        error: "SDLC recommendation is required",
      });
    }

    console.log("✅ Validation passed, creating project in database...");

    // Create project in database
    const newProject = await createProject({
      userId: req.user.dbId,
      name,
      description,
      sdlc,
      questions: questions || [],
      repoUrl: repoUrl || null,
      tags: tags || "",
      visibility,
    });

    console.log("✅ Project created successfully:", newProject);

    res.json({
      success: true,
      project: newProject,
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create project",
    });
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const updateData = req.body;

    const updatedProject = await updateProject(
      projectId,
      req.user.dbId,
      updateData
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update project",
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const deleted = await deleteProject(projectId, req.user.dbId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete project",
    });
  }
});

module.exports = router;
