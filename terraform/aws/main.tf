# -----------------------------------------------------------------------------
# Keyless deploys for GitHub Actions, the AWS way:
#
#   * GitHub's OIDC provider registered with IAM;
#   * a deployer role whose trust policy only trusts workflows running in this
#     exact repo;
#   * the Cloudflare credentials as a Secrets Manager container, its JSON
#     value added out-of-band so it never touches Terraform state;
#   * the GitHub production/preview environments carrying only non-secret
#     Actions variables (role ARN, region, secret *name*).
#
# The deploy workflow (deploy-keyless-aws.yml) mints an OIDC token, calls
# sts:AssumeRoleWithWebIdentity, and reads the Cloudflare token at deploy time.
# No AWS access keys and no Cloudflare token are stored in GitHub.
# -----------------------------------------------------------------------------

locals {
  environments = {
    production = { protected = true }
    preview    = { protected = false }
  }

  env_variables = {
    AWS_DEPLOYER_ROLE_ARN         = aws_iam_role.deployer.arn
    AWS_REGION                    = var.aws_region
    AWS_SECRET_ID                 = aws_secretsmanager_secret.cloudflare.name
    CLOUDFLARE_PAGES_PROJECT_NAME = var.pages_project_name
    NEXT_PUBLIC_SITE_URL          = var.site_url
  }

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

# -----------------------------------------------------------------------------
# GitHub OIDC provider: one per AWS account. Reuse it if it already exists
# (import it rather than letting a second stack manage it).
# -----------------------------------------------------------------------------

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # GitHub Actions' well-known intermediate CA thumbprint. AWS validates the
  # issuer chain; this pins which CA AWS trusts for the token endpoint.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# -----------------------------------------------------------------------------
# Deployer role, assumable from this repo only
# -----------------------------------------------------------------------------

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # StringLike (not StringEquals) so branches and PR heads match:
    # sub looks like repo:owner/name:ref:refs/heads/main or :pull_request.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_owner}/${var.repository}:*"]
    }
  }
}

resource "aws_iam_role" "deployer" {
  name               = "gh-actions-${var.name}"
  description        = "Assumed by GitHub Actions via OIDC to deploy ${var.github_owner}/${var.repository}"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

# -----------------------------------------------------------------------------
# Cloudflare credential container; the value is added out-of-band:
#   aws secretsmanager put-secret-value --secret-id cloudflare-deploy-credentials \
#     --secret-string '{"CLOUDFLARE_API_TOKEN":"...","CLOUDFLARE_ACCOUNT_ID":"..."}'
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "cloudflare" {
  name        = var.secret_name
  description = "Cloudflare deploy credentials for ${var.github_owner}/${var.repository} (value added out-of-band)"
}

# Read exactly this secret, not the whole account.
data "aws_iam_policy_document" "read_secret" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]
    resources = [aws_secretsmanager_secret.cloudflare.arn]
  }
}

resource "aws_iam_role_policy" "read_secret" {
  name   = "read-cloudflare-credentials"
  role   = aws_iam_role.deployer.id
  policy = data.aws_iam_policy_document.read_secret.json
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
