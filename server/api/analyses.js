const express = require('express');
const { saveAnalysis, getAnalysis, getAllUserAnalyses } = require('../db/analyses');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/analyses - get all user's analyses
router.get('/', authenticate, async (req, res) => {
  try {
    const analyses = await getAllUserAnalyses(req.user.dbId);
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analyses/:projectId - get specific analysis
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const projectId = decodeURIComponent(req.params.projectId);
    const analysis = await getAnalysis(req.user.dbId, projectId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analyses - save analysis
router.post('/', authenticate, async (req, res) => {
  try {
    const analysis = await saveAnalysis(req.user.dbId, req.body);
    res.json({ analysis });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
