# -----------------------------------------------------------------------------
# The Cloudflare half of the site: the Pages project deploys land in, the
# custom domain attached to it, and the DNS record pointing at it. (The Pages
# attachment and the CNAME are separate resources: a domain without its DNS
# record never goes live.)
#
# Content is NOT managed here. GitHub Actions uploads builds with
# `wrangler pages deploy` (direct upload), so Terraform owns the project's
# identity and routing, never its deployments.
# -----------------------------------------------------------------------------

# Zones are created once by hand (they are tied to the domain's registrar and
# nameservers) and looked up by name; only records inside them are managed.
data "cloudflare_zone" "this" {
  filter = {
    name    = var.zone_name
    account = { id = var.cloudflare_account_id }
  }
}

resource "cloudflare_pages_project" "this" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = var.production_branch

  lifecycle {
    # Direct-upload projects have no build config, and CI owns the runtime
    # settings it uploads with. Without this, every apply after a deploy would
    # try to reset them.
    ignore_changes = [build_config, deployment_configs]
  }
}

resource "cloudflare_pages_domain" "this" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.this.name
  name         = var.domain
}

# Cloudflare provider v5 note: cloudflare_record is now cloudflare_dns_record,
# and the record's `value` field is now `content`. Two-year-old snippets fail
# to apply for exactly this reason.
resource "cloudflare_dns_record" "this" {
  zone_id = data.cloudflare_zone.this.id
  name    = var.domain
  type    = "CNAME"
  content = cloudflare_pages_project.this.subdomain # <project>.pages.dev
  proxied = true
  ttl     = 1 # 1 = automatic; required (and the only valid value) when proxied
  comment = "Cloudflare Pages: ${var.project_name} (managed by Terraform)"

  # The record is only useful once Cloudflare knows the hostname belongs to the
  # project; creating it first serves a dangling CNAME.
  depends_on = [cloudflare_pages_domain.this]
}
