# Git Workflow & Best Practices (Solo Project with Codex + Local Dev)

This document describes how to keep your history clean, avoid conflicts, and smoothly switch between Codex-generated PRs and your own local development.

---

## 1. Why Conflicts Happen

- **Long-lived branches** → Codex branches diverge from `main`.
- **Mixed formatting** → different auto-formatters, line endings.
- **Generated files committed** → lockfiles, build artifacts churn often.
- **Large sweeping edits** → refactor + feature in one PR increases overlap.

### Guardrails
- Keep branches short-lived, merge quickly.
- Sync **before starting work** (Codex or local).
- Standardize formatting via `.editorconfig`, `.gitattributes`.
- Don’t commit generated artifacts.
- Prefer **rebase over merge** when updating branches.
- Enable [rerere](https://git-scm.com/docs/git-rerere) to reuse conflict resolutions:
  ```bash
  git config --global rerere.enabled true
  ```

---

## 2. Recommended Solo Flow

### A) You start new work
```bash
# 1. Sync main
git switch main
git pull --rebase

# 2. Create branch
git switch -c feat/add-widget

# 3. Work & commit atomically
git add -p
git commit -m "feat(widget): add basic render"

# 4. Keep fresh
git fetch origin
git rebase origin/main

# 5. Push & open PR
git push -u origin feat/add-widget
```

Squash-merge PRs into `main` (keeps history clean and linear).

---

### B) Taking over a Codex PR
```bash
# 1. Fetch & checkout PR
git fetch origin pull/<PR_NUMBER>/head:codex/task-123
git switch codex/task-123

# 2. Bring it up to date
git fetch origin
git rebase origin/main

# 3. Resolve conflicts, run tests, then push
git push --force-with-lease
```

Add your commits → squash-merge.

---

## 3. Git Commands Explained

### `git fetch` vs `git pull`

```
       ┌─────────────┐
       │ Remote repo │
       └──────┬──────┘
              │
              ▼
          git fetch   → downloads new commits, does NOT change working branch
              │
              ▼
          git pull    → fetch + merges (or rebases) into current branch
```

- Use **`fetch`** when you want to inspect first (safe).
- Use **`pull --rebase`** as default to keep linear history.

---

### `git checkout` vs `git switch`

```
checkout = Swiss army knife
   ├── switch branches (confusing syntax)
   ├── restore files
   └── detach HEAD

switch = modern, explicit branch commands
   ├── git switch <branch>
   └── git switch -c <new_branch>
```

- Prefer **`switch`** for branches (clearer).
- Use **`restore`** for files.
- `checkout` is older, still works, but ambiguous.

---

### Update vs Merge vs Rebase

```
   main: A─B─C─D
                 \
branch:           E─F

# merge:
A─B─C─D───────────M
                 /
              E─F

# rebase:
A─B─C─D─E'─F'
```

- **Merge**: preserves history, but creates bubbles.
- **Rebase**: rewrites branch commits on top of `main` → cleaner linear log.

---

## 4. Daily Driver Commands

- `git switch <branch>` → move to branch
- `git switch -c <new>` → create new branch
- `git pull --rebase` → update branch without merge bubbles
- `git push --force-with-lease` → safe force-push (protects others’ work)
- `git merge --ff-only` → only fast-forward into `main`
- `git add -p` → stage hunks interactively
- `git cherry-pick <sha>` → copy a commit
- `git revert <sha>` → undo commit safely
- `git worktree add ../task-xyz task-xyz` → multiple branches checked out simultaneously

---

## 5. Repo Settings That Help

- Protect `main` (require PRs, CI, linear history).
- Enable auto-merge on green checks.
- Enforce formatting in CI.
- Use branch naming conventions: `feat/*`, `fix/*`, `chore/*`.

---

## Quick Handoff Checklist (Codex → You)

1. `git switch main && git pull --rebase`
2. `git fetch origin pull/<PR>/head:branch`
3. `git switch branch && git rebase origin/main`
4. Resolve, test, push with `--force-with-lease`
5. Add your commits, squash-merge PR
```
