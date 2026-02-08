# Security and Operational Audit Report

## Executive Summary
This report presents the findings of a security and operational audit performed on the personal resume website repository. Overall, the application demonstrates good baseline security practices, including the use of security headers (Helmet), rate limiting, and response compression. However, several critical operational and container security improvements are required to ensure the application is production-ready for a Cloud Run deployment. The most significant findings include running the container as root, the lack of health check endpoints, and the absence of graceful shutdown handling.

---

## Findings Summary Table

| ID | Area | Finding | Severity |
|:---|:---|:---|:---|
| 1 | Security | HTTP Security Headers | INFO |
| 2 | Security | Express Static File Serving | INFO |
| 3 | Security | Dockerfile Security (Root User) | MEDIUM |
| 4 | Security | Base Image Vulnerabilities | INFO |
| 5 | Security | Dependency Security | INFO |
| 6 | Security | PII Exposure | MEDIUM |
| 7 | Security | External Resource Integrity (SRI) | LOW |
| 8 | Security | Input Validation & Rate Limiting | INFO |
| 9 | Operational | Health Check Endpoints | MEDIUM |
| 10 | Operational | Error Handling | LOW |
| 11 | Operational | Graceful Shutdown | MEDIUM |
| 12 | Operational | Request Logging | LOW |
| 13 | Operational | Response Compression | INFO |
| 14 | Operational | Static Asset Caching | INFO |
| 15 | Operational | Production Readiness Assessment | MEDIUM |

---

## Detailed Findings

### 1. HTTP Security Headers
*   **Finding**: The application uses `helmet` (v8.1.0) and `app.disable('x-powered-by')` in `server.js`. This provides a strong set of default security headers, including CSP, HSTS, and X-Frame-Options.
*   **Severity**: **INFO**
*   **Recommendation**: Periodically review the Content Security Policy (CSP) to ensure it remains as restrictive as possible as new features are added.

### 2. Express Static File Serving
*   **Finding**: Static files are served from the `public` directory using `express.static`. Directory listing is disabled by default.
*   **Severity**: **INFO**
*   **Recommendation**: Explicitly set `dotfiles: 'ignore'` in the `express.static` configuration for better defense-in-depth, although this is the default behavior.

### 3. Dockerfile Security
*   **Finding**: The `Dockerfile` lacks a `USER` directive, meaning the container runs as the `root` user. Additionally, the `.agent/` directory is not excluded in `.dockerignore`.
*   **Severity**: **MEDIUM**
*   **Recommendation**:
    1. Add `USER node` to the `Dockerfile` before the `CMD` to run the process as a non-privileged user.
    2. Update `.dockerignore` to include `.agent/` and other sensitive or unnecessary files.
    3. Implement a multi-stage build to reduce the final image size and attack surface.

### 4. Base Image Vulnerabilities
*   **Finding**: The image uses `node:18-alpine`. Alpine is a secure, lightweight base. Node 18 is a current LTS version.
*   **Severity**: **INFO**
*   **Recommendation**: Pin the base image to a more specific version or digest (e.g., `node:18.20.7-alpine`) to ensure reproducible builds and avoid unintentional updates to newer, potentially unstable versions.

### 5. Dependency Security
*   **Finding**: `express` is version `^4.18.2`, which resolves to `4.22.1` in the `package-lock.json`. `npm audit` returned 0 vulnerabilities.
*   **Severity**: **INFO**
*   **Recommendation**: Regularly run `npm audit` and keep dependencies updated. Consider migrating to `express` 5.x when it reaches stable maturity for modern security features.

### 6. PII Exposure
*   **Finding**: `index.html` contains personal email, phone number, and physical location information.
*   **Severity**: **MEDIUM**
*   **Recommendation**: While common for resume sites, this increases the risk of scraping and social engineering. Consider using a contact form (which is already present) and obfuscating email/phone strings using JavaScript or CSS to hinder automated scrapers.

### 7. External Resource Integrity
*   **Finding**: Google Fonts are loaded via `<link>` tags without Subresource Integrity (SRI) hashes.
*   **Severity**: **LOW**
*   **Recommendation**: While Google Fonts are dynamic and SRI is difficult to implement for them, consider hosting the fonts locally or using a service that supports SRI to prevent potential supply chain attacks if the CDN is compromised.

### 8. Input Validation & Rate Limiting
*   **Finding**: `express-rate-limit` is used. The `/api/contact` endpoint has basic server-side validation for required fields and email format.
*   **Severity**: **INFO**
*   **Recommendation**: Continue to apply strict server-side validation and sanitization for any new endpoints added to the application.

### 9. Health Check Endpoints
*   **Finding**: There are no health check (`/healthz` or `/readyz`) endpoints defined. Cloud Run and other orchestrators use these for liveness and readiness probes.
*   **Severity**: **MEDIUM**
*   **Recommendation**: Implement a simple GET endpoint at `/healthz` that returns a 200 OK status.

### 10. Error Handling
*   **Finding**: The application lacks a global Express error-handling middleware.
*   **Severity**: **LOW**
*   **Recommendation**: Add a global error handler at the end of the middleware stack (e.g., `app.use((err, req, res, next) => { ... })`) to prevent unhandled exceptions from leaking stack traces and to ensure the process remains stable.

### 11. Graceful Shutdown
*   **Finding**: The application does not handle `SIGTERM` or `SIGINT` signals, which are used by Cloud Run to signal a process to shut down.
*   **Severity**: **MEDIUM**
*   **Recommendation**: Add signal handlers to close the server and any open connections gracefully:
    ```javascript
    process.on('SIGTERM', () => {
      server.close(() => {
        console.log('Process terminated');
      });
    });
    ```

### 12. Request Logging
*   **Finding**: Logging is minimal, consisting of a single `console.log` on startup and on contact form submissions.
*   **Severity**: **LOW**
*   **Recommendation**: Implement a request logging middleware such as `morgan` to log incoming requests, which is essential for monitoring and incident response.

### 13. Response Compression
*   **Finding**: The `compression` middleware is correctly implemented.
*   **Severity**: **INFO**
*   **Recommendation**: None.

### 14. Static Asset Caching
*   **Finding**: Cache-Control headers are appropriately set for different file types (e.g., `immutable` for JS/CSS, `no-cache` for HTML).
*   **Severity**: **INFO**
*   **Recommendation**: None.

### 15. Production Readiness Assessment
*   **Finding**: While functional, the application is not fully production-ready for Cloud Run due to the identified operational gaps (Health checks, Graceful shutdown, Non-root user).
*   **Severity**: **MEDIUM**
*   **Recommendation**: Address the "P1" items in the remediation roadmap before deploying to a production environment.

---

## Prioritized Remediation Roadmap

### Priority 1: High Impact / Low Effort (Immediate Action)
1.  **Non-Root User**: Add `USER node` to the `Dockerfile`.
2.  **Health Checks**: Implement a `/healthz` endpoint in `server.js`.
3.  **Graceful Shutdown**: Implement `SIGTERM` and `SIGINT` handlers.

### Priority 2: Security Hardening (Short Term)
1.  **PII Obfuscation**: Use JavaScript/CSS to hide email and phone from scrapers.
2.  **Global Error Handling**: Add a global catch-all error handler in Express.
3.  **Dockerignore**: Add `.agent/` to `.dockerignore`.

### Priority 3: Best Practices (Maintenance)
1.  **Request Logging**: Integrate `morgan` or a similar logging library.
2.  **Image Pinning**: Pin the `node:alpine` image to a specific version.
3.  **SRI Hashes**: Implement SRI for external assets where possible.
