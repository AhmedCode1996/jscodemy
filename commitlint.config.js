export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce conventional commit types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Code style/formatting
        "refactor", // Code restructure (no fixes/features)
        "perf", // Performance improvements
        "test", // Test-related changes
        "build", // Build system/dependencies
        "ci", // CI configuration
        "chore", // Maintenance tasks
        "revert", // Revert changes
      ],
    ],
    // Enforce type is not empty
    "type-empty": [2, "never"],
    // Enforce scope format if provided
    "scope-case": [2, "always", "kebab-case"],
    // First letter of subject should be capitalized
    "subject-case": [2, "always", "sentence-case"],
    // Subject cannot be empty
    "subject-empty": [2, "never"],
    // Subject should not end with period
    "subject-full-stop": [2, "never", "."],
    // Body should use proper line wrapping
    "body-max-line-length": [2, "always", 100],
    // No leading blank lines in body or footer
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [2, "always"],
  },
};
