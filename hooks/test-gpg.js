const assert = require("assert");
const axios = require("axios");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

async function testGPGSetup() {
  try {
    // Test 1: Usernames
    const gitUsername = execSync("git config user.name", {
      encoding: "utf8",
    }).trim();
    const githubUsername = "coy247";
    console.log("✓ Git username:", gitUsername);
    console.log("✓ GitHub username:", githubUsername);

    // Test 2: Safe directory (global config)
    const repoPath = "/Volumes/TOSHIBA\\ EXT/Sites/2024";
    execSync(`git config --global --add safe.directory "${repoPath}"`, {
      encoding: "utf8",
    });
    console.log("✓ Repository marked as safe");

    // Test 3: GPG keys
    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/gpg_keys`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    console.log("✓ GPG keys found:", response.data.length);

    // Test 4: Configure GPG signing
    execSync(`git config --global commit.gpgsign true`, {
      encoding: "utf8",
    });
    console.log("✓ GPG signing enabled");

    // Test 5: Verify commit
    try {
      const signature = execSync("git log --show-signature -1", {
        encoding: "utf8",
      });
      console.log(
        signature.includes("Good signature")
          ? "✓ Signature verified"
          : "⚠️ Latest commit is not signed. Future commits will be signed."
      );
    } catch (e) {
      console.log("⚠️ Latest commit is not signed. Future commits will be signed.");
    }

    return true;
  } catch (error) {
    console.error("GPG verification failed:", error.message);
    process.exit(1);
  }
}

testGPGSetup();
