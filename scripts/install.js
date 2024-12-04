const { execSync } = require('child_process');
const path = require('path');

try {
  // Configure GPG
  execSync('gpgconf --kill gpg-agent');
  execSync('gpg-agent --daemon --pinentry-program $(which pinentry-mac)');
  
  // Set up git template
  execSync('git config --global init.templatedir ~/.git-template');
  execSync('git config --global commit.gpgsign true');
  
  console.log('✓ GPG Git template installed successfully');
} catch (error) {
  console.error('Installation failed:', error.message);
  process.exit(1);
}