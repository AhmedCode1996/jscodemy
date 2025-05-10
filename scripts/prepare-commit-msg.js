#!/usr/bin/env node

import fs from "fs";
import path from "path";
import prompts from "prompts";
import { execSync } from "child_process";

// Configuration
const COMMIT_TYPES = [
  { title: "✨ feat", description: "A new feature", value: "feat" },
  { title: "🐛 fix", description: "A bug fix", value: "fix" },
  {
    title: "📚 docs",
    description: "Documentation only changes",
    value: "docs",
  },
  {
    title: "💄 style",
    description: "Changes that do not affect the meaning of the code",
    value: "style",
  },
  {
    title: "♻️ refactor",
    description: "A code change that neither fixes a bug nor adds a feature",
    value: "refactor",
  },
  {
    title: "⚡ perf",
    description: "A code change that improves performance",
    value: "perf",
  },
  {
    title: "🧪 test",
    description: "Adding missing tests or correcting existing tests",
    value: "test",
  },
  {
    title: "🛠️ build",
    description:
      "Changes that affect the build system or external dependencies",
    value: "build",
  },
  {
    title: "👷 ci",
    description: "Changes to our CI configuration files and scripts",
    value: "ci",
  },
  {
    title: "🧹 chore",
    description: "Other changes that don't modify src or test files",
    value: "chore",
  },
  {
    title: "⏪ revert",
    description: "Reverts a previous commit",
    value: "revert",
  },
];

// Get the commit message file path
const msgFile = process.argv[2];
const commitSource = process.argv[3];

// Skip for non-interactive commits (merge, rebase, message provided with -m, etc.)
if (
  commitSource === "message" ||
  commitSource === "template" ||
  commitSource === "merge" ||
  commitSource === "squash" ||
  fs.existsSync(path.join(".git", "MERGE_HEAD")) ||
  fs.existsSync(path.join(".git", "REBASE_HEAD")) ||
  fs.existsSync(path.join(".git", "CHERRY_PICK_HEAD"))
) {
  process.exit(0);
}

// Check if there's already content in the message file (other than comments)
const existingMessage = fs.readFileSync(msgFile, "utf8");
const nonCommentLines = existingMessage
  .split("\n")
  .filter((line) => !line.startsWith("#") && line.trim().length > 0);

// Skip if there's already a commit message (like from --amend)
if (nonCommentLines.length > 0) {
  process.exit(0);
}

// Check if script runs in a TTY to handle non-interactive environments
if (!process.stdin.isTTY) {
  process.exit(0);
}

// Fetch current branch for suggested scope
let currentBranch = "";
try {
  currentBranch = execSync("git branch --show-current").toString().trim();
} catch {
  console.log("Failed to fetch current branch");
}

// Extract scope suggestion from branch (e.g., feat/auth-login → auth)
let scopeSuggestion = "";
const branchMatch = currentBranch.match(
  /^(?:feature|feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)\/([^-]+)/,
);
if (branchMatch && branchMatch[1]) {
  scopeSuggestion = branchMatch[1];
}

// Main interactive prompts
async function promptForCommitMessage() {
  const response = await prompts(
    [
      {
        type: "select",
        name: "type",
        message: "Select the type of change you're committing:",
        choices: COMMIT_TYPES,
        initial: 0,
      },
      {
        type: "text",
        name: "scope",
        message: "What is the scope of this change (optional):",
        initial: scopeSuggestion,
      },
      {
        type: "text",
        name: "subject",
        message: "Write a short, imperative mood description of the change:",
        validate: (value) => (value.length > 0 ? true : "Subject is required"),
      },
      {
        type: "text",
        name: "body",
        message: "Provide a longer description of the change (optional):",
      },
      {
        type: "text",
        name: "breaking",
        message: "List any breaking changes (optional):",
      },
      {
        type: "text",
        name: "issues",
        message: "List any issues closed by this change (optional):",
      },
      {
        type: "confirm",
        name: "confirmed",
        message: "Confirm commit with the above details?",
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log("\n🚫 Commit creation canceled");
        process.exit(1);
      },
    },
  );

  if (!response.confirmed) {
    console.log("\n🚫 Commit creation canceled");
    process.exit(1);
  }

  // Format scope if provided
  const scope = response.scope ? `(${response.scope})` : "";

  // Capitalize first letter of subject
  const subject =
    response.subject.charAt(0).toUpperCase() + response.subject.slice(1);

  // Build commit message
  let commitMessage = `${response.type}${scope}: ${subject}`;

  // Add body if provided
  if (response.body) {
    commitMessage += `\n\n${response.body}`;
  }

  // Add breaking changes if provided
  if (response.breaking) {
    commitMessage += `\n\nBREAKING CHANGE: ${response.breaking}`;
  }

  // Add issues if provided
  if (response.issues) {
    commitMessage += `\n\nCloses: ${response.issues}`;
  }

  // Write to commit message file
  fs.writeFileSync(msgFile, commitMessage);

  console.log("\n✅ Commit message created successfully!");
  console.log("📝 Message:", commitMessage);
}

// Start the interactive prompt
promptForCommitMessage().catch((err) => {
  console.error("❌ Error creating commit message:", err);
  process.exit(1);
});
