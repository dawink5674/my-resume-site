---
description: How to review Jules PRs, merge changes, and deploy to Cloud Run
---

# Deploy Jules Changes

Follow these steps whenever Jules submits new PRs for the resume site.

// turbo-all

## Steps

1. Check for open PRs on `dawink5674/my-resume-site` using the GitHub MCP `list_pull_requests` tool

2. For each open PR, review the file changes using `get_pull_request_files`

3. If PRs can be merged cleanly (no conflicts), merge them one at a time using `merge_pull_request`

4. If PRs have merge conflicts (common when Jules creates multiple branches from the same base):
   - Read the current `main` branch versions of all affected files
   - Manually integrate all PR changes into unified files
   - Push the unified files to `main` using `push_files`
   - Close all integrated PRs with comments explaining the merge

5. After all changes are on `main`, deploy to Cloud Run:
   - **Project**: `resume-ultra-2025`
   - **Region**: `us-central1`  
   - **Service**: `my-resume-site`
   - Use the `deploy_local_folder` tool with path `g:\My Drive\Google Cloud Folder\my-resume-site`

6. Verify the deployment by fetching the live URL: `https://my-resume-site-obgtdsdv4q-uc.a.run.app`

7. Confirm all sections render correctly (Hero, About, Experience, Skills, Education, Certifications, Contact)
