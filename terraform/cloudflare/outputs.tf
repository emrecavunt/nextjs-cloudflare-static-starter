output "pages_project_name" {
  description = "Set this as CLOUDFLARE_PAGES_PROJECT_NAME in the repo's Actions variables."
  value       = cloudflare_pages_project.this.name
}

output "pages_dev_subdomain" {
  description = "The project's built-in <name>.pages.dev hostname."
  value       = cloudflare_pages_project.this.subdomain
}
