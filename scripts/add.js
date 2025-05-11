#!/usr/bin/env node

/**
 * JSCODEMY Interactive Add CLI
 * A stylish way to select and stage files for commit
 */

import prompts from "prompts";
import { execSync } from "child_process";
import path from "path";

// ANSI color codes for styling (matching other scripts)
const styles = {
  title: (text) => `\x1b[38;5;105m${text}\x1b[0m`,
  subtitle: (text) => `\x1b[38;5;39m${text}\x1b[0m`,
  success: (text) => `\x1b[38;5;82m${text}\x1b[0m`,
  error: (text) => `\x1b[38;5;196m${text}\x1b[0m`,
  warning: (text) => `\x1b[38;5;214m${text}\x1b[0m`,
  highlight: (text) => `\x1b[38;5;226m${text}\x1b[0m`,
  muted: (text) => `\x1b[38;5;245m${text}\x1b[0m`,
  progress: (text) => `\x1b[38;5;33m${text}\x1b[0m`,
  command: (text) => `\x1b[38;5;208m${text}\x1b[0m`,
  added: (text) => `\x1b[38;5;46m${text}\x1b[0m`,
  modified: (text) => `\x1b[38;5;214m${text}\x1b[0m`,
  deleted: (text) => `\x1b[38;5;196m${text}\x1b[0m`,
  untracked: (text) => `\x1b[38;5;39m${text}\x1b[0m`,
};

// File status indicators
const fileStatus = {
  MODIFIED: "M",
  ADDED: "A",
  DELETED: "D",
  RENAMED: "R",
  UNTRACKED: "?",
  UNMERGED: "U",
};

// Get list of changed files
function getChangedFiles() {
  try {
    // Get status of working tree
    const statusOutput = execSync("git status --porcelain", {
      encoding: "utf-8",
    });

    // Parse the status output
    const files = statusOutput
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const status = line.substring(0, 2).trim();
        const filePath = line.substring(3);

        let displayStatus = "";
        let color = styles.muted;

        if (status.includes(fileStatus.MODIFIED)) {
          displayStatus = "Modified";
          color = styles.modified;
        } else if (status.includes(fileStatus.ADDED)) {
          displayStatus = "Added";
          color = styles.added;
        } else if (status.includes(fileStatus.DELETED)) {
          displayStatus = "Deleted";
          color = styles.deleted;
        } else if (status.includes(fileStatus.RENAMED)) {
          displayStatus = "Renamed";
          color = styles.modified;
        } else if (status.includes(fileStatus.UNTRACKED)) {
          displayStatus = "Untracked";
          color = styles.untracked;
        } else if (status.includes(fileStatus.UNMERGED)) {
          displayStatus = "Unmerged";
          color = styles.error;
        }

        // Check if the file is already staged
        const isStaged = status[0] !== " " && status[0] !== "?";

        return {
          status,
          displayStatus,
          filePath,
          color,
          isStaged,
        };
      });

    return files;
  } catch (error) {
    console.error(styles.error("Error getting changed files:"), error.message);
    return [];
  }
}

// Display current branch
function getCurrentBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  } catch (error) {
    console.error(styles.error("Error getting current branch:"), error.message);
    return "unknown";
  }
}

// Display header
console.log("\n");
console.log(styles.title("╔════════════════════════════════════════════════╗"));
console.log(styles.title("║                                                ║"));
console.log(
  styles.title("║             📁 JSCODEMY ADD WIZARD 📁             ║"),
);
console.log(styles.title("║                                                ║"));
console.log(styles.title("╚════════════════════════════════════════════════╝"));
console.log("\n");
console.log(styles.subtitle("Select files to stage for your next commit"));
console.log(styles.muted("Choose which changes you want to include"));
console.log("\n");

async function main() {
  // Get current branch
  const currentBranch = getCurrentBranch();
  console.log(
    styles.highlight(`🔍 Current branch:`),
    styles.command(currentBranch),
  );
  console.log("");

  // Get changed files
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log(
      styles.warning("⚠️  No changes detected in the working directory"),
    );
    console.log(styles.muted("Make some changes before running this command"));
    process.exit(0);
  }

  // Group files by status for better presentation
  const stagedFiles = changedFiles.filter((file) => file.isStaged);
  const unstagedFiles = changedFiles.filter((file) => !file.isStaged);

  // Show already staged files
  if (stagedFiles.length > 0) {
    console.log(styles.success("🎯 Files already staged:"));
    stagedFiles.forEach((file) => {
      console.log(
        `  ${file.color(`[${file.displayStatus}]`)} ${styles.muted(file.filePath)}`,
      );
    });
    console.log("");
  }

  // Show files available for staging
  if (unstagedFiles.length > 0) {
    console.log(styles.highlight("📄 Changes available to stage:"));
    unstagedFiles.forEach((file, i) => {
      console.log(
        `  ${i + 1}. ${file.color(`[${file.displayStatus}]`)} ${file.filePath}`,
      );
    });
    console.log("");
  } else {
    console.log(styles.warning("⚠️  No unstaged changes available"));
    console.log(styles.muted("All changes are already staged"));

    // Ask if user wants to proceed to commit
    const { proceedToCommit } = await prompts({
      type: "confirm",
      name: "proceedToCommit",
      message: "All changes are staged. Would you like to proceed to commit?",
      initial: true,
    });

    if (proceedToCommit) {
      console.log(styles.success("\n🚀 Launching commit wizard...\n"));
      execSync("node scripts/commit.js", { stdio: "inherit" });
    }

    process.exit(0);
  }

  // Selection options
  const options = [
    { title: "Stage all files", value: "all" },
    { title: "Select individual files", value: "individual" },
    { title: "Stage by file type", value: "type" },
    { title: "Stage by pattern", value: "pattern" },
  ];

  // Ask user how they want to select files
  const { selectionMode } = await prompts({
    type: "select",
    name: "selectionMode",
    message: "How would you like to select files?",
    choices: options,
    initial: 0,
  });

  let filesToStage = [];

  // Handle different selection modes
  if (selectionMode === "all") {
    filesToStage = unstagedFiles.map((file) => file.filePath);
  } else if (selectionMode === "individual") {
    const { selectedFiles } = await prompts({
      type: "multiselect",
      name: "selectedFiles",
      message: "Select files to stage",
      choices: unstagedFiles.map((file) => ({
        title: `${file.color(`[${file.displayStatus}]`)} ${file.filePath}`,
        value: file.filePath,
      })),
      min: 1,
    });

    filesToStage = selectedFiles;
  } else if (selectionMode === "type") {
    // Extract file extensions
    const extensions = Array.from(
      new Set(
        unstagedFiles
          .map((file) => path.extname(file.filePath))
          .filter(Boolean)
          .map((ext) => ext.toLowerCase()),
      ),
    );

    if (extensions.length === 0) {
      console.log(styles.warning("⚠️  No file extensions detected"));
      return;
    }

    const { selectedExtensions } = await prompts({
      type: "multiselect",
      name: "selectedExtensions",
      message: "Select file types to stage",
      choices: extensions.map((ext) => ({
        title: ext,
        value: ext,
      })),
      min: 1,
    });

    filesToStage = unstagedFiles
      .filter((file) =>
        selectedExtensions.includes(path.extname(file.filePath).toLowerCase()),
      )
      .map((file) => file.filePath);
  } else if (selectionMode === "pattern") {
    const { pattern } = await prompts({
      type: "text",
      name: "pattern",
      message: "Enter a glob pattern (e.g., src/*.js)",
    });

    if (!pattern) {
      console.log(styles.error("❌ No pattern entered"));
      process.exit(1);
    }

    try {
      const patternOutput = execSync(
        `git ls-files --modified --others --exclude-standard | grep -E "${pattern}"`,
        {
          encoding: "utf-8",
        },
      ).trim();

      filesToStage = patternOutput.split("\n").filter(Boolean);

      if (filesToStage.length === 0) {
        console.log(
          styles.warning(`⚠️  No files match the pattern: ${pattern}`),
        );
        process.exit(1);
      }
    } catch {
      console.log(styles.warning(`⚠️  No files match the pattern: ${pattern}`));
      process.exit(1);
    }
  }

  if (filesToStage.length === 0) {
    console.log(styles.error("❌ No files selected"));
    process.exit(1);
  }

  // Preview selected files
  console.log(styles.highlight("\n📋 Files selected for staging:"));
  filesToStage.forEach((file) => {
    console.log(styles.muted(`  - ${file}`));
  });
  console.log("");

  const { confirmStage } = await prompts({
    type: "confirm",
    name: "confirmStage",
    message: `Stage ${filesToStage.length} file(s)?`,
    initial: true,
  });

  if (!confirmStage) {
    console.log(styles.error("\n🚫 Staging canceled"));
    process.exit(0);
  }

  // Execute git add for each file
  console.log(styles.progress("\n🔄 Staging files..."));

  try {
    // Stage all selected files with a single command
    execSync(`git add ${filesToStage.map((file) => `"${file}"`).join(" ")}`, {
      stdio: "pipe",
    });

    console.log(styles.success("✅ Files staged successfully!\n"));

    const statusOutput = execSync("git status -s", { encoding: "utf-8" });
    console.log(styles.highlight("📦 Current staging area:"));

    statusOutput
      .split("\n")
      .filter(Boolean)
      .forEach((line) => {
        const status = line.substring(0, 2);

        let lineStyle = styles.muted;

        if (status[0] === "M") lineStyle = styles.modified;
        else if (status[0] === "A") lineStyle = styles.added;
        else if (status[0] === "D") lineStyle = styles.deleted;
        else if (status[0] === "R") lineStyle = styles.modified;

        console.log(lineStyle(`  ${line}`));
      });

    console.log("");

    const { proceedToCommit } = await prompts({
      type: "confirm",
      name: "proceedToCommit",
      message: "Would you like to proceed to commit?",
      initial: true,
    });

    if (proceedToCommit) {
      console.log(styles.success("\n🚀 Launching commit wizard...\n"));
      execSync("node scripts/commit.js", { stdio: "inherit" });
    } else {
      console.log(
        styles.muted(
          "\nRun 'pnpm commit' when you're ready to commit your changes.",
        ),
      );
    }
  } catch (error) {
    console.error(styles.error("\n❌ Failed to stage files:"), error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(styles.error("❌ Error:"), err);
  process.exit(1);
});
