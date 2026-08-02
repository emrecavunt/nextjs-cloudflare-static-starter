variable "project_id" {
  description = "GCP project hosting the WIF pool, deployer service account, and secrets."
  type        = string
}

variable "region" {
  description = "Default GCP region."
  type        = string
  default     = "europe-west1"
}

variable "github_owner" {
  description = "GitHub account/org that owns the site repository. Only OIDC tokens from this owner's repos may use the WIF provider."
  type        = string
}

variable "repository" {
  description = "GitHub repository the site deploys from (without owner), e.g. \"my-site\"."
  type        = string
}

variable "name" {
  description = <<-EOT
    Short site name, e.g. "mysite". Derives the deployer SA account id
    (gh-actions-<name>) and the GitHub environments' identity.
  EOT
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,18}$", var.name))
    error_message = "name must be lowercase alphanumeric/hyphens and at most 19 chars (SA id 'gh-actions-<name>' is capped at 30)."
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

variable "secret_cloudflare_api_token" {
  description = "Secret ID of the Cloudflare deploy token (Pages › Edit only). Container created here; value added out-of-band."
  type        = string
  default     = "cloudflare-api-token"
}

variable "secret_cloudflare_account_id" {
  description = "Secret ID of the Cloudflare account ID. Container created here; value added out-of-band."
  type        = string
  default     = "cloudflare-account-id"
}
