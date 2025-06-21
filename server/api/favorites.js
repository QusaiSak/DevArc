const express = require('express');
const { addFavorite, removeFavorite, isFavorite, getFavorites } = require('../db/favorites');
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
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/favorites - get user's favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const favorites = await getFavorites(req.user.dbId);
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/favorites - add a favorite
router.post('/', authenticate, async (req, res) => {
  try {
    await addFavorite({ userId: req.user.dbId, repo: req.body.repo });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/favorites - remove a favorite
router.delete('/', authenticate, async (req, res) => {
  try {
    await removeFavorite({ userId: req.user.dbId, repoId: req.body.repoId });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/favorites/check/:repoId - check if repo is favorited
router.get('/check/:repoId', authenticate, async (req, res) => {
  try {
    const repoId = decodeURIComponent(req.params.repoId);
    const isFav = await isFavorite({ userId: req.user.dbId, repoId: repoId });
    res.json({ isFavorite: isFav });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
