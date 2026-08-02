# -----------------------------------------------------------------------------
# Keyless deploys for GitHub Actions, the GCP way:
#
#   * ONE Workload Identity pool + GitHub OIDC provider;
#   * a deployer service account, assumable only by workflows running in this
#     exact repo (the binding pins attribute.repository);
#   * the Cloudflare credentials as Secret Manager containers, with values
#     added out-of-band so they never touch Terraform state;
#   * the GitHub production/preview environments carrying only non-secret
#     Actions variables (secret *names*, not values).
#
# The deploy workflow (deploy-keyless-gcp.yml) mints an OIDC token, exchanges
# it through the pool for the deployer SA, and reads the Cloudflare token at
# deploy time. Nothing long-lived is stored in GitHub.
# -----------------------------------------------------------------------------

locals {
  required_apis = [
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "sts.googleapis.com",
    "secretmanager.googleapis.com",
  ]

  # The two environments the deploy workflow targets. Production restricts
  # deploys to protected branches; preview is open so PRs can deploy.
  environments = {
    production = { protected = true }
    preview    = { protected = false }
  }

  # Non-secret Actions variables: every value here is a name or an email,
  # never a credential. The workflow fetches real secrets at run time.
  env_variables = {
    GCP_PROJECT_ID                   = var.project_id
    GCP_WORKLOAD_IDENTITY_PROVIDER   = google_iam_workload_identity_pool_provider.github.name
    GCP_DEPLOYER_SA_EMAIL            = google_service_account.deployer.email
    GCP_SECRET_CLOUDFLARE_API_TOKEN  = var.secret_cloudflare_api_token
    GCP_SECRET_CLOUDFLARE_ACCOUNT_ID = var.secret_cloudflare_account_id
    CLOUDFLARE_PAGES_PROJECT_NAME    = var.pages_project_name
    NEXT_PUBLIC_SITE_URL             = var.site_url
  }

  # Flatten { environment => { var => value } } to "environment:VAR" keys so
  # one resource manages every variable across both environments.
  flattened_variables = merge([
    for env_name, _ in local.environments : {
      for var_name, value in local.env_variables :
      "${env_name}:${var_name}" => {
        environment = env_name
        name        = var_name
        value       = value
      }
    }
  ]...)
}

resource "google_project_service" "required" {
  for_each           = toset(local.required_apis)
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# -----------------------------------------------------------------------------
# Workload Identity pool + GitHub OIDC provider
# -----------------------------------------------------------------------------

resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "github-actions"
  display_name              = "GitHub Actions"
  description               = "Keyless auth for GitHub Actions workflows (repos under ${var.github_owner})"

  depends_on = [google_project_service.required]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-actions-provider"
  description                        = "GitHub Actions OIDC provider"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
    "attribute.ref"              = "assertion.ref"
  }

  # Only tokens from this owner's repositories may use the provider at all.
  attribute_condition = "assertion.repository_owner == \"${var.github_owner}\""

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# -----------------------------------------------------------------------------
# Deployer service account, assumable from this repo only
# -----------------------------------------------------------------------------

resource "google_service_account" "deployer" {
  project      = var.project_id
  account_id   = "gh-actions-${var.name}"
  display_name = "GitHub Actions deployer (${var.repository})"
  description  = "Assumed by GitHub Actions via WIF to deploy ${var.github_owner}/${var.repository}"
}

# The SA can only be impersonated by workflows running in this exact repo.
resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_owner}/${var.repository}"
}

# -----------------------------------------------------------------------------
# Cloudflare credential containers; values are added out-of-band:
#   printf '%s' "<token>" | gcloud secrets versions add cloudflare-api-token --data-file=-
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "cloudflare_api_token" {
  project   = var.project_id
  secret_id = var.secret_cloudflare_api_token

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret" "cloudflare_account_id" {
  project   = var.project_id
  secret_id = var.secret_cloudflare_account_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.required]
}

# Read-only access to exactly these two secrets, not the whole project.
resource "google_secret_manager_secret_iam_member" "token_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.cloudflare_api_token.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_secret_manager_secret_iam_member" "account_id_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.cloudflare_account_id.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.deployer.email}"
}

# -----------------------------------------------------------------------------
# GitHub environments + the non-secret variables the workflow reads
# -----------------------------------------------------------------------------

data "github_repository" "this" {
  full_name = "${var.github_owner}/${var.repository}"
}

resource "github_repository_environment" "env" {
  for_each            = local.environments
  repository          = data.github_repository.this.name
  environment         = each.key
  can_admins_bypass   = true
  prevent_self_review = false

  dynamic "deployment_branch_policy" {
    for_each = each.value.protected ? [1] : []
    content {
      protected_branches     = true
      custom_branch_policies = false
    }
  }
}

resource "github_actions_environment_variable" "vars" {
  for_each      = local.flattened_variables
  repository    = data.github_repository.this.name
  environment   = github_repository_environment.env[each.value.environment].environment
  variable_name = each.value.name
  value         = each.value.value
}
