variable "aws_region" {
  description = "AWS region hosting the Secrets Manager secret."
  type        = string
  default     = "eu-west-1"
}

variable "github_owner" {
  description = "GitHub account/org that owns the site repository."
  type        = string
}

variable "repository" {
  description = "GitHub repository the site deploys from (without owner), e.g. \"my-site\"."
  type        = string
}

variable "name" {
  description = "Short site name, e.g. \"mysite\". Derives the IAM role name (gh-actions-<name>)."
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,18}$", var.name))
    error_message = "name must be lowercase alphanumeric/hyphens and at most 19 chars."
  }
}

variable "pages_project_name" {
  description = "Cloudflare Pages project name. Must match CLOUDFLARE_PAGES_PROJECT_NAME the deploy workflow uploads to."
  type        = string
}

variable "site_url" {
  description = "Canonical site URL, exported to the build as NEXT_PUBLIC_SITE_URL."
  type        = string
}

variable "secret_name" {
  description = "Secrets Manager secret holding the Cloudflare credentials as JSON. Container created here; value added out-of-band."
  type        = string
  default     = "cloudflare-deploy-credentials"
}
