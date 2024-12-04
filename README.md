# Git GPG Template

Automatically configures GPG signing for git commits.

## Installation

```bash
# Install dependencies
brew install gnupg pinentry-mac

# Install template
git clone https://github.com/username/git-gpg-template ~/.git-template
cd ~/.git-template && pnpm install

# Configure git
git config --global init.templatedir ~/.git-template
git config --global commit.gpgsign true
```

## Usage

New repositories will automatically use GPG signing.
For existing repos:

```bash
git init --template=~/.git-template
```
