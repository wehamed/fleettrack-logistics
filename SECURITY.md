# Security Policy

## Supported Versions

Security updates are provided for the latest release and the current development branch (`main`).

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| older   | :x:                |

## Reporting a Vulnerability

Please do **not** open a public issue for security vulnerabilities. Instead, report them privately:

- **Email:** qef0@hotmail.com
- **Subject prefix:** `[SECURITY] <project name>`

Include as much detail as possible:

- The affected version(s) and commit(s).
- Steps to reproduce the vulnerability.
- Potential impact.
- Any suggested fix or mitigation (optional).

You will receive an acknowledgement within 3 business days and a status update on the fix timeline.

## Security Practices

- Never commit secrets, tokens, API keys, or `.env` files to the repository.
- Keep dependencies updated and run the project's dependency checks regularly.
- Use environment variables or secure secret stores for all credentials.
- Report any dependency vulnerability you discover, even if it is not yet exploitable.

## Disclosure Policy

We will acknowledge valid reports, coordinate a fix, and publish details after a patch is available. Security researchers acting in good faith are welcome to test against local or staging environments only.
