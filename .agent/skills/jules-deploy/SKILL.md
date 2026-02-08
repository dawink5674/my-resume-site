---
name: Jules CLI + Antigravity Deploy Workflow
description: Optimal workflow for using Google Jules CLI and Antigravity together to develop, review, and deploy changes to the resume site on Cloud Run.
---

# Jules CLI + Antigravity Deploy Workflow

This skill defines the end-to-end workflow for using **Google Jules** (async coding agent via CLI) alongside **Google Antigravity** (interactive coding agent) to manage the `my-resume-site` project.

## Prerequisites

- **Jules CLI** installed globally: `npm install -g @google/jules`
- **Jules authenticated**: `jules login`
- **GitHub repo**: `dawink5674/my-resume-site` (main branch)
- **GCP project**: `resume-ultra-2025` (Cloud Run, region `us-central1`)

## Architecture

```
┌─────────────────┐     PRs      ┌─────────────┐
│   Google Jules   │ ──────────► │   GitHub     │
│  (async tasks)   │             │   main       │
└─────────────────┘             └──────┬───────┘
                                       │
┌─────────────────┐   review +  ┌──────▼───────┐
│   Antigravity    │ ◄─────────►│  Cloud Run   │
│  (interactive)   │   deploy    │  (live site) │
└─────────────────┘             └──────────────┘
```

- **Jules** handles scoped, asynchronous coding tasks (feature branches → PRs)
- **Antigravity** handles PR review, merge conflict resolution, deployment, and interactive development

## Workflow Steps

### 1. Assign Work to Jules

Use the Jules CLI to create a task from the project directory:

```bash
cd "g:\My Drive\Google Cloud Folder\my-resume-site"

# Start a new task with a prompt
jules task start --repo dawink5674/my-resume-site --prompt "Your task description here"

# Or start from a GitHub issue
jules task start --repo dawink5674/my-resume-site --issue 12

# List active tasks
jules task list

# Check task status
jules task status <task-id>
```

**Best practices for Jules prompts:**
- Be specific about which files to modify
- Reference the tech stack: HTML5, Vanilla CSS, Vanilla JS, Node.js + Express
- Request feature branches and PRs (not direct main commits)
- Include acceptance criteria
- Mention the design system variables in `public/css/styles.css`

### 2. Review Jules PRs with Antigravity

Once Jules submits PRs, use Antigravity to review:

> "Check GitHub for any new PRs from Jules on my-resume-site and review them"

Antigravity will:
- List all open PRs via GitHub MCP
- Show file diffs and change summaries
- Approve, request changes, or leave comments
- Handle merge conflicts if multiple PRs touch the same files

### 3. Merge & Resolve Conflicts

If PRs have conflicts (common when Jules creates multiple branches from the same base):

> "Merge all open Jules PRs and resolve any conflicts"

Antigravity's strategy:
- For **clean PRs**: Merge directly via GitHub MCP
- For **conflicting PRs**: Integrate all changes into unified files and push a single commit to `main`, then close PRs with comments

### 4. Deploy to Cloud Run

After merging, deploy the updated code:

> "Deploy the latest changes to Cloud Run"

Antigravity will use the Cloud Run MCP to deploy:
- **Project**: `resume-ultra-2025`
- **Region**: `us-central1`
- **Service**: `my-resume-site`
- **Live URL**: https://my-resume-site-obgtdsdv4q-uc.a.run.app

### 5. Verify Deployment

Antigravity automatically verifies the live site after deployment by fetching the URL and confirming HTTP 200 with all expected content.

## Jules Task Templates

### Security Enhancement
```
jules task start --repo dawink5674/my-resume-site --prompt "Add CSRF protection to the Express server in server.js. Create a feature branch and submit as a PR to main."
```

### New Section
```
jules task start --repo dawink5674/my-resume-site --prompt "Add a Projects section to public/index.html after the Skills section. Use glass-card components matching the existing design system in public/css/styles.css. Create feature branch and PR."
```

### Bug Fix
```
jules task start --repo dawink5674/my-resume-site --prompt "Fix: the hamburger menu doesn't close when clicking outside of it on mobile. Modify public/js/main.js. Create feature branch and PR."
```

### Performance
```
jules task start --repo dawink5674/my-resume-site --prompt "Add lazy loading for any images and implement critical CSS inlining for above-the-fold content. Create feature branch and PR."
```

## Project Context (for reference)

| Item | Value |
|------|-------|
| **Tech Stack** | HTML5, Vanilla CSS, Vanilla JS, Node.js 18 + Express |
| **Container** | Docker (node:18-alpine) |
| **Hosting** | Google Cloud Run |
| **GCP Project** | `resume-ultra-2025` |
| **Region** | `us-central1` |
| **GitHub Repo** | `dawink5674/my-resume-site` |
| **Live URL** | https://my-resume-site-obgtdsdv4q-uc.a.run.app |
| **Dependencies** | express, helmet, compression, express-rate-limit |

## File Structure

```
my-resume-site/
├── .agent/
│   ├── skills/
│   │   └── jules-deploy/
│   │       └── SKILL.md          ← This file
│   └── workflows/
│       └── deploy-jules-changes.md
├── public/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── index.html
│   └── assets/resume.pdf
├── tests/
│   └── rate_limit.test.js
├── server.js
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```
