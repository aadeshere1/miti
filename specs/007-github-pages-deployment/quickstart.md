# Quickstart: GitHub Pages Automated Deployment

**Feature**: GitHub Pages Automated Deployment (007-github-pages-deployment)
**Date**: 2026-03-27

## Overview

This guide provides developers with the essential information needed to understand and work with the GitHub Pages automated deployment feature.

## What This Feature Does

Automatically builds and deploys the Miti calendar website to GitHub Pages whenever code is pushed to the main branch.

**Workflow**:
```
Developer pushes code
        ↓
GitHub Actions triggered
        ↓
TypeScript compiled
        ↓
Vite builds optimized assets
        ↓
dist/ folder deployed to GitHub Pages
        ↓
Site live and updated
```

## For Developers

### Pushing Code (No Changes Needed)

Simply push your code normally:

```bash
git add .
git commit -m "feat: add calendar features"
git push origin main
```

The deployment happens automatically - no manual action required.

### Checking Deployment Status

1. **In GitHub UI**:
   - Go to repository → **Actions** tab
   - See list of workflow runs
   - Click on latest run to see status (✓ = success, ✗ = failure)

2. **View Logs** (if deployment failed):
   - Click on the workflow run
   - Click on "Deploy" job
   - Expand individual steps to see errors
   - TypeScript errors and build errors shown in logs

### Monitoring Website Updates

After a successful deployment:
1. GitHub Pages site URL is: `https://<username>.github.io/<repo>/`
2. Site usually updates within 1-2 minutes of deployment
3. Hard-refresh browser (Ctrl+Shift+R or Cmd+Shift+R) if changes not visible

### Common Issues

**Problem**: Site didn't update after pushing

**Solutions**:
1. Check if push was to `main` branch (workflow only runs on main)
2. Check Actions tab to confirm workflow ran and succeeded
3. Check browser cache - hard refresh (Ctrl+Shift+R)
4. Wait 1-2 minutes for GitHub Pages to propagate

**Problem**: Deployment failed (workflow shows ✗)

**Solutions**:
1. Click on the failed workflow run
2. Expand "Deploy" job and review step logs
3. Common failures:
   - **Build failed**: Check TypeScript errors in logs, fix and push again
   - **Dependencies failed**: Check npm error message, verify package.json is valid
   - **GitHub Pages unavailable**: Rare - check repo settings that Pages is enabled

**Problem**: I see old code on the live site

**Solutions**:
1. Verify the latest code is on main branch
2. Check that your commit was pushed (not just in local git)
3. Wait 2-3 minutes and hard-refresh browser
4. Check Actions tab to confirm your commit triggered deployment

## For Maintainers

### Ensuring GitHub Pages Is Configured

Before this feature works, the repository must have GitHub Pages enabled:

1. Go to repository **Settings**
2. Find **Pages** section (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions" (or "Deploy from a branch" if not available yet)
4. Save - this enables the workflow to deploy

### Monitoring Deployments

Regular tasks:
- Check Actions tab weekly to ensure deployments are succeeding
- If workflow fails consistently, investigate build issues
- Review error logs to identify common problems

### Manual Deployment (If Needed)

If you need to redeploy without code changes:

1. Go to **Actions** tab
2. Click on "Deploy" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow" button

The workflow will re-run immediately and redeploy the current main branch code.

### Updating Deployment Configuration

The workflow is configured in `.github/workflows/deploy.yml`. To modify:

1. Edit `.github/workflows/deploy.yml` in your preferred editor
2. Make changes (e.g., change Node version, add new build steps)
3. Commit and push to feature branch
4. Test with pull request (manually trigger workflow if desired)
5. Merge to main when reviewed and tested

### Disabling Deployment Temporarily

If you need to stop automatic deployments:

1. Go to repository **Actions** → **All workflows**
2. Click on "Deploy" workflow
3. Click "..." (more) menu
4. Select "Disable workflow"
5. Workflow will no longer run automatically

To re-enable:
1. Go back to Actions → Workflows
2. Click on "Deploy" workflow
3. Click "..." → "Enable workflow"

## Understanding Deployment Timing

**Typical Timeline**:
- 0s: You push code to main
- 0-5s: GitHub detects push
- 5-10s: GitHub Actions runner starts
- 10-20s: Node.js and npm cache set up
- 20-80s: Dependencies installed (or cached)
- 80-200s: TypeScript compiled and Vite build runs
- 200-230s: Build artifact uploaded
- 230-300s: GitHub Pages deployment initiated
- 300-360s: Site live and accessible

**Total**: Typically 5-6 minutes from push to live update

Note: Subsequent pushes may be faster if npm cache remains warm.

## Architecture Decisions

Why these choices?

**GitHub Actions** (not Jenkins/CircleCI/etc.):
- Native GitHub integration, no additional services needed
- Free tier sufficient for our scale
- Automatic GITHUB_TOKEN for authentication

**Using existing `npm run build`**:
- Reuses proven build process
- No duplication of build logic
- Changes to build only need to be made in one place

**Deploying only dist/ folder**:
- Smaller deployment, faster updates
- Doesn't expose source code
- Standard practice for static sites

**Main branch only**:
- Keeps production separate from development
- Allows testing in feature branches before deployment
- Reduces risk of deploying incomplete work

## Next Steps

### For New Developers
1. ✅ Clone the repository
2. ✅ Read this quickstart
3. ✅ Make a test commit and push to main
4. ✅ Check Actions tab to see deployment succeed
5. ✅ Visit GitHub Pages URL to see your changes live

### For Adding Features
1. Create feature branch from main
2. Make changes and test locally
3. Push to feature branch (no automatic deployment)
4. Create pull request (automatic checks run)
5. Merge to main (automatic deployment runs)
6. Verify changes on live site

## Troubleshooting Checklist

If deployment isn't working:

- [ ] Code was pushed to `main` branch (not feature branch)
- [ ] GitHub Pages is enabled in repository settings
- [ ] Actions tab shows workflow run (not just scheduled)
- [ ] Workflow shows ✓ (success), not ✗ (failure)
- [ ] 5+ minutes have passed since push
- [ ] Tried hard-refresh (Ctrl+Shift+R) of browser
- [ ] Checked workflow logs for error messages
- [ ] `npm run build` works locally (test this first)

If all checks pass but site still not updated, check GitHub status page (https://www.githubstatus.com/) for service outages.

## Resources

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **GitHub Pages Documentation**: https://docs.github.com/en/pages
- **Workflow File Location**: `.github/workflows/deploy.yml`
- **Contract Details**: See `contracts/workflow-contract.md` in this feature spec

---

**Ready to deploy?** Just push to main and let GitHub Actions do the work! 🚀
