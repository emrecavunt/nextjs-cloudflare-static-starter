variable "cloudflare_account_id" {
  description = "Cloudflare account that owns the Pages project and the DNS zone."
  type        = string
}

variable "project_name" {
  description = "Cloudflare Pages project name. Must match the CLOUDFLARE_PAGES_PROJECT_NAME the deploy workflow uploads to."
  type        = string
}

variable "domain" {
  description = "Custom domain serving the site, e.g. \"example.com\". Gets a Pages domain attachment and a proxied CNAME."
  type        = string
}

variable "zone_name" {
  description = "Cloudflare DNS zone the domain lives in, looked up by name. Usually the same as domain; different for subdomains (site.example.com → zone example.com)."
  type        = string
}

variable "production_branch" {
  description = "Branch whose Pages deployments are production."
  type        = string
  default     = "main"
}
