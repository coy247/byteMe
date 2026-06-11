# Git workflow

This repository deliberately uses its own history as a teaching artifact.
The pre-`v0.1.0` history shows what a learning project looks like (snapshot
branches, ad-hoc messages); everything from `v0.1.0` onward demonstrates
the discipline described in [CONTRIBUTING.md](../CONTRIBUTING.md).

## The model

```mermaid
gitGraph
    commit id: "094cb20 (legacy)"
    branch develop
    checkout develop
    branch fix/package-metadata
    commit id: "fix(meta): gitignore"
    commit id: "fix(meta): package.json"
    checkout develop
    merge fix/package-metadata
    branch feat/binary-model-tests
    commit id: "test(models): BinaryModel"
    commit id: "ci: workflow"
    checkout develop
    merge feat/binary-model-tests
    branch feat/intro-experience
    commit id: "feat(intro): retro boot"
    checkout develop
    merge feat/intro-experience
    branch release/0.1.0
    commit id: "chore(release): changelog"
    checkout main
    merge release/0.1.0 tag: "v0.1.0"
    checkout develop
    merge main
```

## Rules of the road

| Action | Rule |
|---|---|
| New work | Branch from `develop`, one feature per branch |
| Merging | `--no-ff` always — topology is documentation |
| Releasing | `release/<version>` branch → merge to `main` → annotated tag → back-merge to `develop` |
| History | Never rewrite anything that's been pushed |
| Old snapshots | Live under `archive/*`, read-only; cherry-pick with SHA citation |

## Why the old history is still here

Five weeks of an undetected stale counter taught this project's owner the
hard way: **a repo without verifiable history is unauditable by design.**
The early commits with messages like `updated readme` and `{commit_message}`
stay in the log as the "before" picture. The contrast with everything after
`v0.1.0` *is* the demonstration.
