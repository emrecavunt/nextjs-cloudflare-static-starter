# Security Policy

## Supported versions

The latest release (and `main`) is supported. This is a starter template:
once you clone it, keeping dependencies patched is on you. Dependabot config
ships in `.github/dependabot.yml` to help.

## Reporting a vulnerability

Please report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/emrecavunt/nextjs-cloudflare-static-starter/security/advisories/new)
rather than opening a public issue. You should get a response within a week.

## What's already in place

- CodeQL static analysis on every PR and weekly (`codeql.yml`)
- Dependency review blocking known-vulnerable dependencies on PRs
  (`dependency-review.yml`)
- Security headers (CSP, HSTS, `nosniff`, frame denial) shipped via
  `public/_headers` and verified by the smoke test suite
- Keyless deploy options so no long-lived Cloudflare token needs to live in CI
