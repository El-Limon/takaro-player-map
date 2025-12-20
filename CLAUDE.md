# Claude Code Instructions

## Git Worktrees for Parallel Development

When working on a new feature, consider using a git worktree. This allows multiple AI agent sessions to work on different features simultaneously without conflicts.

### When to use worktrees
- Starting work on a new feature that might conflict with other ongoing work
- Multiple agent sessions need to work in parallel

### When NOT to use worktrees
- Small changes or fixes
- Working on the same feature as another session
- Quick one-off tasks

### Commands
```bash
# Create a new worktree for a feature (includes copying .env)
git worktree add "../feature-name" -b feature/feature-name && cp .env "../feature-name/"

# List existing worktrees
git worktree list

# Remove a worktree when done (after merging)
git worktree remove "../feature-name"
```

### Important: .env file
The `.env` file contains API credentials and is not tracked by git. When creating a new worktree, always copy it:
```bash
cp "/home/zmedh/Takaro-Projects/Takaro Player Map/.env" ../new-worktree/
```

## GitHub Workflow

### Repository
- Main repo: https://github.com/El-Limon/takaro-player-map
- When features are complete, create Pull Requests (PRs) to submit changes

### Creating a Pull Request
```bash
# After completing work on a feature branch
git push origin feature/your-feature-name

# Then use GitHub CLI or website to create PR:
gh pr create --base main --head feature/your-feature-name --title "Feature: Description"
```

## Current Feature Request

**Goal:** Add ability to search for players by a specific item in an area.

**Details:**
- User wants to search for which players have a specific item
- Filter by area/location
- User is not experienced with GitHub workflows, so provide clear step-by-step guidance when implementing
