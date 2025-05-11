#!/usr/bin/env node

/**
 * JSCODEMY Interactive Push CLI
 * A stylish way to push your commits to remote
 */

import prompts from "prompts";
import { execSync, spawn } from "child_process";

// ANSI color codes for styling (matching commit.js style)
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
};

// Loading animation characters
const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// Get current branch
function getCurrentBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf-8" }).trim();
  } catch (error) {
    console.error(styles.error("Error getting current branch:"), error.message);
    return null;
  }
}

// Get remote branches
function getRemoteBranches() {
  try {
    const output = execSync("git remote", { encoding: "utf-8" });
    return output.split("\n").filter(Boolean);
  } catch (error) {
    console.error(styles.error("Error getting remotes:"), error.message);
    return ["origin"];
  }
}

// Check for unpushed commits
function getUnpushedCommits(branch, remote) {
  try {
    const output = execSync(
      `git log ${remote}/${branch}..${branch} --oneline`,
      { encoding: "utf-8" },
    ).trim();

    return output ? output.split("\n") : [];
  } catch {
    // This can fail if the branch doesn't exist on the remote yet
    return ["new-branch"];
  }
}

// Display header
console.log("\n");
console.log(styles.title("╔════════════════════════════════════════════════╗"));
console.log(styles.title("║                                                ║"));
console.log(
  styles.title("║             🚀 JSCODEMY PUSH WIZARD 🚀            ║"),
);
console.log(styles.title("║                                                ║"));
console.log(styles.title("╚════════════════════════════════════════════════╝"));
console.log("\n");
console.log(
  styles.subtitle("Push your commits to remote with interactive feedback"),
);
console.log(styles.muted("Follow the prompts to push your changes"));
console.log("\n");

async function main() {
  // Get current branch
  const currentBranch = getCurrentBranch();
  if (!currentBranch) {
    console.log(
      styles.error("❌ Not in a git repository or no branches exist"),
    );
    process.exit(1);
  }

  // Get available remotes
  const remotes = getRemoteBranches();
  const defaultRemote = remotes.includes("origin") ? "origin" : remotes[0];

  // Interactive prompts
  const response = await prompts(
    [
      {
        type: "select",
        name: "remote",
        message: "Select remote to push to:",
        choices: remotes.map((remote) => ({ title: remote, value: remote })),
        initial: remotes.indexOf(defaultRemote),
      },
      {
        type: "text",
        name: "branch",
        message: "Branch to push to remote:",
        initial: currentBranch,
      },
      {
        type: "confirm",
        name: "forcePush",
        message: "Use force push? (--force)",
        initial: false,
      },
    ],
    {
      onCancel: () => {
        console.log(styles.error("\n🚫 Push canceled"));
        process.exit(1);
      },
    },
  );

  // Show unpushed commits if any
  const unpushedCommits = getUnpushedCommits(currentBranch, response.remote);

  if (unpushedCommits.length > 0 && unpushedCommits[0] !== "new-branch") {
    console.log(styles.highlight("\n📦 Commits to be pushed:"));
    unpushedCommits.forEach((commit, i) => {
      // Limit to show max 5 commits
      if (i < 5) {
        console.log(styles.muted(`  - ${commit}`));
      } else if (i === 5) {
        console.log(
          styles.muted(
            `  - ... and ${unpushedCommits.length - 5} more commits`,
          ),
        );
      }
    });
    console.log("\n");
  } else if (unpushedCommits[0] === "new-branch") {
    console.log(
      styles.highlight("📦 This appears to be a new branch on the remote"),
    );
  } else {
    console.log(styles.warning("⚠️  No unpushed commits detected"));

    const { confirmPush } = await prompts({
      type: "confirm",
      name: "confirmPush",
      message: "Continue with push anyway?",
      initial: false,
    });

    if (!confirmPush) {
      console.log(styles.error("\n🚫 Push canceled"));
      process.exit(0);
    }
  }

  // Build push command
  const pushCommand = `git push ${response.forcePush ? "--force " : ""}${response.remote} ${currentBranch}:${response.branch}`;

  // Show push command
  console.log(styles.highlight("\n🔄 Executing:"));
  console.log(styles.command(`  ${pushCommand}`));
  console.log("\n");

  // Confirm push
  const { confirmPush } = await prompts({
    type: "confirm",
    name: "confirmPush",
    message: `Push ${currentBranch} to ${response.remote}/${response.branch}?${response.forcePush ? " (FORCE PUSH)" : ""}`,
    initial: true,
  });

  if (!confirmPush) {
    console.log(styles.error("\n🚫 Push canceled"));
    process.exit(0);
  }

  // Execute git push with real-time output
  console.log("");

  const pushProcess = spawn(
    "git",
    [
      "push",
      ...(response.forcePush ? ["--force"] : []),
      response.remote,
      `${currentBranch}:${response.branch}`,
    ],
    { stdio: "pipe" },
  );

  let spinnerInterval;
  let spinnerIndex = 0;
  let stillRunning = true;

  // Start spinner animation
  spinnerInterval = setInterval(() => {
    if (stillRunning) {
      process.stdout.write(
        `\r${styles.progress(spinnerFrames[spinnerIndex])} Pushing to ${response.remote}/${response.branch}...`,
      );
      spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
    }
  }, 80);

  let output = "";

  pushProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pushProcess.stderr.on("data", (data) => {
    output += data.toString();
  });

  pushProcess.on("close", (code) => {
    stillRunning = false;
    clearInterval(spinnerInterval);

    // Clear spinner line
    process.stdout.write("\r" + " ".repeat(80) + "\r");

    if (code === 0) {
      console.log(styles.success("✅ Push successful!\n"));

      // Format the output with colors
      const formattedOutput = formatGitOutput(output);
      console.log(formattedOutput);

      console.log(
        styles.success("\n🎉 Changes pushed successfully to remote!\n"),
      );
    } else {
      console.log(styles.error("\n❌ Push failed!\n"));
      console.log(output);
      console.log(
        styles.error("\nTry resolving the issues and pushing again.\n"),
      );
    }
  });
}

// Format git push output with colors
function formatGitOutput(output) {
  const lines = output.split("\n");
  let formattedOutput = "";

  for (const line of lines) {
    if (line.includes("Enumerating objects")) {
      formattedOutput += styles.highlight(line) + "\n";
    } else if (line.includes("Counting objects")) {
      formattedOutput += styles.progress(line) + "\n";
    } else if (line.includes("Compressing objects")) {
      formattedOutput += styles.progress(line) + "\n";
    } else if (line.includes("Writing objects")) {
      formattedOutput += styles.progress(line) + "\n";
    } else if (line.includes("Total")) {
      formattedOutput += styles.highlight(line) + "\n";
    } else if (line.includes("remote:")) {
      formattedOutput += styles.muted(line) + "\n";
    } else if (line.match(/[a-f0-9]+\.\.[a-f0-9]+ +/)) {
      formattedOutput += styles.success(line) + "\n";
    } else if (line.trim()) {
      formattedOutput += line + "\n";
    }
  }

  return formattedOutput;
}

// Execute main function
main().catch((err) => {
  console.error(styles.error("❌ Error:"), err);
  process.exit(1);
});
