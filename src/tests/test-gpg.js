const assert = require("assert");
const axios = require("axios");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { before, after, describe, it } = require("mocha");

describe("GPG Verification", () => {
  const testRepoPath = path.join(__dirname, "test-repo");
  let gitUsername;
  let gpgKeys;

  before(async function () {
    this.timeout(10000);

    // Configure GPG environment
    process.env.GPG_TTY = "/dev/ttys000";
    process.env.GNUPGHOME = path.join(process.env.HOME, ".gnupg");

    // Configure GPG with cached passphrase
    execSync(
      "gpgconf --kill gpg-agent && gpg-agent --daemon --pinentry-program $(which pinentry-mac)"
    );

    // Setup test repo
    execSync("rm -rf " + testRepoPath);
    execSync("mkdir -p " + testRepoPath);
    execSync("cd " + testRepoPath + " && git init");

    // Get GitHub GPG keys
    gitUsername = execSync("git config user.name", { encoding: "utf8" }).trim();
    const response = await axios.get(
      "https://api.github.com/users/coy247/gpg_keys"
    );
    gpgKeys = response.data;

    // Configure test repo
    execSync(
      "cd " +
        testRepoPath +
        " && " +
        'git config user.name "' +
        gitUsername +
        '" && ' +
        "git config user.signingkey " +
        gpgKeys[0].key_id +
        " && " +
        "git config commit.gpgsign true"
    );
  });

  it("should sign test commit", function () {
    this.timeout(10000);

    execSync("cd " + testRepoPath + ' && echo "test" > test.txt');
    execSync("cd " + testRepoPath + " && git add test.txt");

    execSync(
      "cd " + testRepoPath + ' && git commit -S -m "test signed commit"',
      {
        env: {
          ...process.env,
          GPG_TTY: "/dev/ttys000",
        },
      }
    );

    const verification = execSync(
      "cd " + testRepoPath + " && git log --show-signature -1",
      { encoding: "utf8" }
    );
    assert(verification.toLowerCase().includes("good signature"));
  });

  after(() => {
    execSync("rm -rf " + testRepoPath);
  });
});
