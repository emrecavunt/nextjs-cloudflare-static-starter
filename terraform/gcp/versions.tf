terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.11"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Auth via the GITHUB_TOKEN environment variable (a fine-grained PAT with
# Administration + Environments + Variables on this one repo is enough).
# When you outgrow it, swap in GitHub App auth: app_auth mints installation
# tokens that expire in an hour, so no long-lived GitHub credential exists.
provider "github" {
  owner = var.github_owner
}
