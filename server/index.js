require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/auth/github', (req, res) => {
  console.log('=== GITHUB REDIRECT DEBUG ===');
  console.log('Client ID being used:', GITHUB_CLIENT_ID);
  console.log('Client URL:', process.env.CLIENT_URL);
  
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: 'GitHub Client ID not configured' });
  }
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email,repo&redirect_uri=${process.env.CLIENT_URL}/auth/callback`;
  console.log('Redirect URL:', githubAuthUrl);
  res.redirect(githubAuthUrl);
});

app.post('/auth/github/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      error: 'GitHub credentials not properly configured',
      debug: {
        clientId: GITHUB_CLIENT_ID ? 'Present' : 'Missing',
        clientSecret: GITHUB_CLIENT_SECRET ? 'Present' : 'Missing'
      }
    });
  }
  
  try {
    // Exchange code for access token
    const tokenRequestData = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
    };
    
    console.log('Token request data:', {
      client_id: tokenRequestData.client_id,
      client_secret: tokenRequestData.client_secret ? 'Present' : 'Missing',
      code: tokenRequestData.code ? 'Present' : 'Missing'
    });

    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', tokenRequestData, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DevArc-App',
      },
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response data:', tokenResponse.data);

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      console.error('GitHub token exchange error:', error, error_description);
      return res.status(400).json({
        success: false,
        error: `GitHub OAuth error: ${error_description || error}`,
      });
    }

    if (!access_token) {
      console.error('No access token received');
      return res.status(400).json({
        success: false,
        error: 'No access token received from GitHub',
      });
    }

    console.log('Access token received, fetching user info...');

    // Get user information
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'DevArc-App',
      },
    });

    // Get user emails
    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'DevArc-App',
      },
    });

    const user = userResponse.data;
    const emails = emailResponse.data;
    const primaryEmail = emails.find(email => email.primary)?.email || user.email;

    console.log('User authenticated successfully:', user.login);

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.login,
        email: primaryEmail,
        avatar_url: user.avatar_url,
        access_token: access_token,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.login,
        email: primaryEmail,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('GitHub OAuth error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      error: 'Authentication failed',
      details: error.response?.data || error.message,
    });
  }
});

// Get current user
app.get('/auth/me', (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        avatar_url: decoded.avatar_url,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});