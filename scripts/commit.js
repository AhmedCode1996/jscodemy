#!/usr/bin/env node

/**
 * Queezy Interactive Commit CLI
 * A stylish way to create conventional commits
 */

import prompts from "prompts";
import { execSync } from "child_process";

// ANSI color codes for styling
const styles = {
  title: (text) => `\x1b[38;5;105m${text}\x1b[0m`,
  subtitle: (text) => `\x1b[38;5;39m${text}\x1b[0m`,
  success: (text) => `\x1b[38;5;82m${text}\x1b[0m`,
  error: (text) => `\x1b[38;5;196m${text}\x1b[0m`,
  warning: (text) => `\x1b[38;5;214m${text}\x1b[0m`,
  highlight: (text) => `\x1b[38;5;226m${text}\x1b[0m`,
  muted: (text) => `\x1b[38;5;245m${text}\x1b[0m`,
};

// Commit types with emojis
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

// Common scopes
const COMMON_SCOPES = [
  { title: "api", description: "API-related changes", value: "api" },
  { title: "ui", description: "User interface related", value: "ui" },
  { title: "auth", description: "Authentication/Authorization", value: "auth" },
  { title: "core", description: "Core functionality", value: "core" },
  { title: "data", description: "Data models or handling", value: "data" },
  { title: "deps", description: "Dependencies", value: "deps" },
  { title: "config", description: "Configuration changes", value: "config" },
  { title: "other", description: "Custom scope (specify)", value: "other" },
];

// Check for staged files
function getStagedFiles() {
  try {
    return execSync("git diff --cached --name-only", { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean);
  } catch (error) {
    console.error(
      styles.error("Error checking for staged files:"),
      error.message,
    );
    return [];
  }
}

// Extract scope suggestion from branch
function getScopeSuggestion() {
  try {
    const currentBranch = execSync("git branch --show-current", {
      encoding: "utf-8",
    })
      .toString()
      .trim();
    const branchMatch = currentBranch.match(
      /^(?:feature|feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)\/([^-]+)/,
    );
    return branchMatch && branchMatch[1] ? branchMatch[1] : "";
  } catch {
    return "";
  }
}

// Display header
console.log("\n");
console.log(styles.title("╔════════════════════════════════════════════════╗"));
console.log(styles.title("║                                                ║"));
console.log(styles.title("║          ✨ QUEEZY COMMIT WIZARD ✨           ║"));
console.log(styles.title("║                                                ║"));
console.log(styles.title("╚════════════════════════════════════════════════╝"));
console.log("\n");
console.log(
  styles.subtitle("Create beautiful conventional commit messages with ease"),
);
console.log(styles.muted("Follow the prompts to craft your commit message"));
console.log("\n");

async function main() {
  // Check for staged files
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log(
      styles.warning(
        "⚠️  No staged files found. Please stage your changes with:",
      ),
    );
    console.log(styles.muted("  git add <files>"));
    process.exit(1);
  }

  console.log(styles.highlight("🔍 Files to be committed:"));
  stagedFiles.forEach((file) => console.log(styles.muted(`  - ${file}`)));
  console.log("\n");

  // Scope suggestion
  const scopeSuggestion = getScopeSuggestion();

  // Interactive prompts
  const response = await prompts(
    [
      {
        type: "select",
        name: "type",
        message: "Select the type of change:",
        choices: COMMIT_TYPES,
        initial: 0,
      },
      {
        type: "select",
        name: "useCommonScope",
        message: "Select a scope type:",
        choices: [
          { title: "Common scope", value: true },
          { title: "Custom scope", value: false },
          { title: "No scope", value: null },
        ],
        initial: 0,
      },
      {
        type: (prev) => (prev === true ? "select" : null),
        name: "commonScope",
        message: "Select scope:",
        choices: COMMON_SCOPES,
        initial: 0,
      },
      {
        type: (prev) => (prev === false ? "text" : null),
        name: "customScope",
        message: "Enter custom scope:",
        initial: scopeSuggestion,
      },
      {
        type: "text",
        name: "subject",
        message: "Enter a short description:",
        validate: (value) => {
          if (!value) return "Description is required";
          if (value[0] !== value[0].toUpperCase())
            return "Description must start with uppercase letter";
          if (value.endsWith("."))
            return "Description should not end with a period";
          return true;
        },
      },
      {
        type: "text",
        name: "body",
        message: "Provide a longer description (optional):",
      },
      {
        type: "confirm",
        name: "breaking",
        message: "Does this change contain breaking changes?",
        initial: false,
      },
      {
        type: (prev) => (prev ? "text" : null),
        name: "breakingBody",
        message: "Describe the breaking changes:",
      },
      {
        type: "confirm",
        name: "issues",
        message: "Does this change affect any open issues?",
        initial: false,
      },
      {
        type: (prev) => (prev ? "text" : null),
        name: "issuesBody",
        message: 'Add issue references (e.g., "Fixes #123"):',
      },
    ],
    {
      onCancel: () => {
        console.log(styles.error("\n🚫 Commit creation canceled"));
        process.exit(1);
      },
    },
  );

  // Handle scope selection
  let scope = "";
  if (response.useCommonScope === true) {
    scope = response.commonScope;
    if (scope === "other") {
      // If they selected "other" from common scopes but didn't provide a custom one
      const { otherScope } = await prompts({
        type: "text",
        name: "otherScope",
        message: "Enter custom scope:",
        initial: scopeSuggestion,
      });
      scope = otherScope;
    }
  } else if (response.useCommonScope === false) {
    scope = response.customScope;
  }

  // Format scope if provided
  const scopeText = scope ? `(${scope})` : "";

  // Build commit message
  let commitMessage = `${response.type}${scopeText}: ${response.subject}`;

  // Add body if provided
  if (response.body) {
    commitMessage += `\n\n${response.body}`;
  }

  // Add breaking change note if applicable
  if (response.breaking) {
    commitMessage += `\n\nBREAKING CHANGE: ${response.breakingBody || "Breaking changes introduced"}`;
  }

  // Add issue reference if applicable
  if (response.issues && response.issuesBody) {
    commitMessage += `\n\n${response.issuesBody}`;
  }

  // Preview the commit message
  console.log("\n");
  console.log(styles.highlight("📝 Generated Commit Message:"));
  console.log("╭─" + "─".repeat(50) + "╮");
  console.log(
    "│ " + styles.success(commitMessage.split("\n")[0].padEnd(49)) + "│",
  );

  if (commitMessage.split("\n").length > 1) {
    const bodyLines = commitMessage.split("\n").slice(1);
    bodyLines.forEach((line) => {
      if (line === "") {
        console.log("│ " + " ".repeat(49) + "│");
      } else {
        // Truncate and handle long lines
        const chunks = [];
        for (let i = 0; i < line.length; i += 48) {
          chunks.push(line.substring(i, i + 48));
        }
        chunks.forEach((chunk) => {
          console.log("│ " + styles.muted(chunk.padEnd(49)) + "│");
        });
      }
    });
  }
  console.log("╰─" + "─".repeat(50) + "╯");

  // Confirm commit
  const { confirmCommit } = await prompts({
    type: "confirm",
    name: "confirmCommit",
    message: "Create commit with this message?",
    initial: true,
  });

  if (confirmCommit) {
    try {
      // Execute git commit with the formatted message
      execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, {
        stdio: "inherit",
      });
      console.log(styles.success("\n✅ Commit created successfully!"));
    } catch (error) {
      console.error(
        styles.error("\n❌ Failed to create commit:"),
        error.message,
      );
      process.exit(1);
    }
  } else {
    console.log(styles.error("\n❌ Commit cancelled"));
    process.exit(1);
  }
}

// Execute main function
main().catch((err) => {
  console.error(styles.error("❌ Error:"), err);
  process.exit(1);
});
