const {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
  json,
} = require("drizzle-orm/pg-core");

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    repoId: text("repo_id").notNull(),
    repoName: text("repo_name").notNull(),
    owner: text("owner").notNull(),
    avatarUrl: text("avatar_url"),
    description: text("description"),
    language: text("language"),
    stars: integer("stars"),
    forks: integer("forks"),
    htmlUrl: text("html_url"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userRepoUnique: uniqueIndex("user_repo_unique").on(
      table.userId,
      table.repoId
    ),
  })
);

const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  projectId: text("project_id").notNull(),
  projectName: text("project_name"),
  structure: text("structure"), // JSON stringified
  codeAnalysis: text("code_analysis"), // JSON stringified
  documentation: text("documentation"), // JSON stringified
  testCases: text("test_cases"), // JSON stringified
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced projects table
const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  sdlc: json("sdlc").notNull(), // Store SDLC as JSON for structure
  questions: json("questions"), // Store onboarding Q&A as JSON
  repoUrl: text("repo_url"), // GitHub repository URL
  tags: text("tags"), // Optional: comma-separated or JSON array
  visibility: text("visibility").default("private"), // Optional: 'private' or 'public'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

module.exports = { users, favorites, analyses, projects };
