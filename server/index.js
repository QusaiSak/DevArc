require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { createOrUpdateUser } = require("./db/users");

const app = express();
const PORT = process.env.PORT;

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); // Increase payload limit for large analysis data
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/favorites", require("./api/favorites"));
app.use("/api/analyses", require("./api/analyses"));
app.use("/api/projects", require("./api/project"));

// Routes
app.get("/auth/github", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GitHub Client ID not configured" });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email,repo&redirect_uri=${process.env.CLIENT_URL}/auth/callback`;
  res.redirect(githubAuthUrl);
});

app.post("/auth/github/callback", async (req, res) => {
  const { code } = req.body;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      error: "GitHub credentials not properly configured",
      debug: {
        clientId: GITHUB_CLIENT_ID ? "Present" : "Missing",
        clientSecret: GITHUB_CLIENT_SECRET ? "Present" : "Missing",
      },
    });
  }

  try {
    // Exchange code for access token
    const tokenRequestData = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: code,
    };

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      tokenRequestData,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "DevArc-App",
        },
      }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      console.error("GitHub token exchange error:", error, error_description);
      return res.status(400).json({
        success: false,
        error: `GitHub OAuth error: ${error_description || error}`,
      });
    }

    if (!access_token) {
      console.error("No access token received");
      return res.status(400).json({
        success: false,
        error: "No access token received from GitHub",
      });
    }

    // Get user information
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "User-Agent": "DevArc-App",
      },
    });

    // Get user emails
    const emailResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "User-Agent": "DevArc-App",
        },
      }
    );

    const user = userResponse.data;
    const emails = emailResponse.data;
    const primaryEmail =
      emails.find((email) => email.primary)?.email || user.email;

    // Save/update user in database
    const dbUser = await createOrUpdateUser({
      id: user.id,
      login: user.login,
      email: primaryEmail,
      name: user.name,
      avatar_url: user.avatar_url,
      access_token: access_token,
    });

    // Create JWT token with database user ID
    const token = jwt.sign(
      {
        id: user.id,
        dbId: dbUser.id, // Database user ID
        username: user.login,
        email: primaryEmail,
        avatar_url: user.avatar_url,
        access_token: access_token,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: dbUser.id, // Use database ID
        username: user.login,
        email: primaryEmail,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error.response?.data || error.message);
    res.status(400).json({
      success: false,
      error: "Authentication failed",
      details: error.response?.data || error.message,
    });
  }
});

// Get current user
app.get("/auth/me", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: {
        id: decoded.dbId, // Use database ID
        username: decoded.username,
        email: decoded.email,
        avatar_url: decoded.avatar_url,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

// Logout
app.post("/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ success: true });
});

// Get GitHub access token for frontend use
app.get("/api/github-token", (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      access_token: decoded.access_token,
    });
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
