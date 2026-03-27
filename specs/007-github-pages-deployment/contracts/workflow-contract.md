# GitHub Actions Workflow Contract

**Feature**: GitHub Pages Automated Deployment (007-github-pages-deployment)
**File**: `.github/workflows/deploy.yml`
**Version**: 1.0
**Date**: 2026-03-27

## Contract Overview

This contract defines the interface and behavior of the GitHub Actions workflow that automates deployment to GitHub Pages.

## Trigger Specification

**Event**: Push event

**Condition**: Push to `main` branch only

**Schema**:
```yaml
on:
  push:
    branches:
      - main
```

**Behavior**:
- Workflow runs automatically when a commit is pushed to the main branch
- Does NOT run for pushes to other branches
- Does NOT run for force pushes (but should be idempotent if it does)
- Runs once per push event (not per commit if multiple commits in push)

## Job Specification

**Job Name**: `deploy`

**Runner**: `ubuntu-latest`

**Permissions Required**:
- `contents: read` - Read repository source code
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Use GitHub-provided deployment token

## Step Specification

### Step 1: Checkout Repository

**Action**: `actions/checkout@v4`

**Input**:
- `ref`: Not specified (defaults to current branch)

**Output**:
- Repository content available in runner filesystem at current working directory

**Contract**:
- Must complete successfully
- Fails: Workflow stops, GitHub Pages not updated
- Expected time: < 10 seconds

### Step 2: Setup Node.js

**Action**: `actions/setup-node@v4`

**Input**:
- `node-version`: `18` (latest LTS available)
- `cache`: `npm` (enable npm cache)

**Output**:
- Node.js 18.x available in PATH
- npm package cache restored (if cache hit)

**Contract**:
- Must complete successfully
- Fails: Workflow stops, GitHub Pages not updated
- Expected time: 5-30 seconds (depends on cache)

### Step 3: Install Dependencies

**Action**: `run`

**Command**: `npm install`

**Input**:
- package.json (from checked-out repository)

**Output**:
- node_modules/ directory populated with dependencies
- package-lock.json verified

**Contract**:
- Must complete successfully (exit code 0)
- Fails: Workflow stops, GitHub Pages not updated
- Success: All dependencies installed exactly as specified in package-lock.json

### Step 4: Type Check & Build

**Action**: `run`

**Command**: `npm run build`

**Input**:
- TypeScript source files (src/)
- Build configuration (vite.config.ts, tsconfig.json)
- Installed dependencies (node_modules/)

**Output**:
- dist/ folder with compiled and optimized assets
- TypeScript validation passed (no type errors)
- Vite build completed successfully

**Contract**:
- Must complete successfully (exit code 0)
- Fails: Exit code non-zero, workflow stops, GitHub Pages not updated
- Success: dist/ folder exists and contains index.html and all assets
- Side effects: May create build cache files (node_modules/.vite/)

### Step 5: Upload Build Artifact

**Action**: `actions/upload-artifact@v4`

**Input**:
- `name`: `github-pages`
- `path`: `dist/`
- `retention-days`: 1 (default, sufficient for deployment)

**Output**:
- Build artifact registered with GitHub
- Artifact available for deployment step

**Contract**:
- Must complete successfully
- Fails: Workflow stops, GitHub Pages not updated
- Success: Artifact ID assigned and available to next step

### Step 6: Deploy to GitHub Pages

**Action**: `actions/deploy-pages@v2`

**Input**:
- Artifact from previous step (automatically provided)

**Output**:
- GitHub Pages deployment triggered
- Site updated at GitHub Pages URL

**Contract**:
- Must complete successfully
- Fails: Deployment fails (GitHub Pages service error)
- Success: Site accessible at GitHub Pages URL within 5 minutes
- Automatic authentication: Uses GITHUB_TOKEN from GitHub Actions context

## Workflow Outputs

### Success State

**Conditions**:
1. Checkout succeeds
2. Node.js setup succeeds
3. `npm install` succeeds with exit code 0
4. `npm run build` succeeds with exit code 0 and produces dist/
5. Artifact upload succeeds
6. GitHub Pages deployment succeeds

**Result**:
- Website deployed to GitHub Pages URL
- Workflow marked as ✓ (success) in GitHub Actions UI
- Logs show all steps completed
- Site reflects changes from the pushed commit

### Failure States

**Build Failure** (TypeScript errors or Vite error):
- `npm run build` exits with non-zero code
- Workflow marked as ✗ (failure) in GitHub Actions UI
- GitHub Pages not updated (previous version remains live)
- Error logs available showing which file/line failed

**Dependency Failure** (npm install fails):
- `npm install` exits with non-zero code
- Workflow marked as ✗ (failure)
- GitHub Pages not updated
- Error logs show dependency resolution error

**GitHub Pages Unavailable** (rare):
- All build steps succeed
- `actions/deploy-pages` fails (GitHub service issue)
- Workflow marked as ✗ (failure)
- Error logs indicate GitHub Pages service error

## Logging & Debugging

**Log Visibility**: All step outputs visible in GitHub Actions "Run" tab

**Captured Logs**:
- Node.js version information
- npm package list (install success)
- TypeScript compiler output (type check results)
- Vite build output (bundle composition)
- Artifact upload confirmation
- GitHub Pages deployment status

**Debugging**: Developers can view full logs by:
1. Navigate to Actions tab in GitHub repo
2. Click on the workflow run
3. Expand "Deploy" job
4. View each step's output

## Performance Targets

| Step | Target | Rationale |
|------|--------|-----------|
| Checkout | < 10s | Fresh clone with depth 1 |
| Node setup | 5-30s | Depends on cache; npm cache should be warm |
| npm install | 10-60s | First run uncached; subsequent runs cached |
| npm run build | 30-120s | TypeScript compilation + Vite optimization |
| Artifact upload | 10-30s | Network dependent |
| GitHub Pages deploy | 5-300s | GitHub Pages service scheduling |
| **Total** | **5 minutes** | From push to live update |

## Dependencies

**External Dependencies**:
- GitHub Actions service (platform)
- GitHub Pages service (deployment target)
- ubuntu-latest runner (compute)
- npm registry (for dependencies, assumed available)

**Repository Dependencies**:
- main branch exists
- package.json with defined build script
- npm packages locked in package-lock.json
- vite.config.ts with valid configuration

## Compliance

**Requirement Coverage**:
- ✅ FR-001: Executes automatically on main branch push
- ✅ FR-002: Runs `npm run build` (includes TypeScript compilation)
- ✅ FR-003: Builds with Vite (part of npm run build)
- ✅ FR-004: Deploys dist/ folder to GitHub Pages
- ✅ FR-005: Prevents deployment if build fails (non-zero exit code)
- ✅ FR-006: Uses GitHub's deploy-pages action (native mechanism)
- ✅ FR-007: Configured in .github/workflows/deploy.yml
- ✅ FR-008: Logs all steps (automatic in GitHub Actions)

## Change Management

**Modification Process**:
1. Update `.github/workflows/deploy.yml`
2. Commit to feature branch
3. Test with pull request (workflow can be triggered manually)
4. Review changes with team
5. Merge to main when approved

**Backward Compatibility**:
- Workflow is idempotent (can run multiple times safely)
- Does not modify repository state (read-only to source code)
- Previous deployments preserved (GitHub Pages versioning)

---

**Status**: Draft → Ready for implementation when approved
