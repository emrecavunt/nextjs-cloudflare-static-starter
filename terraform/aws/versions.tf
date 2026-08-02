terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.11"
    }
  }
}

# Auth via the usual AWS credential chain (profile, SSO, env vars).
provider "aws" {
  region = var.aws_region
}

# Auth via the GITHUB_TOKEN environment variable (a fine-grained PAT with
# Administration + Environments + Variables on this one repo is enough).
provider "github" {
  owner = var.github_owner
}
