# Terraform: the platform, not the bits

Two jobs get conflated in most "deploy Next to Cloudflare" guides. Terraform
provisions the platform: the Pages project, the custom domain, the DNS, and
optionally the identity plumbing that makes CI keyless. Wrangler ships the
files; GitHub Actions uploads `out/` with `wrangler pages deploy`. Don't
expect `terraform apply` to upload your HTML. That's not its job.

Each directory is an independent root module with its own state. You need
`cloudflare/` always, plus at most one of `gcp/` and `aws/`: whichever
secrets backend you picked for keyless deploys. Running neither is fine too;
the simple `deploy.yml` workflow only needs the `cloudflare/` root.

| Root          | Owns                                                                                          | When you need it                        |
| ------------- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| `cloudflare/` | Pages project, custom domain, DNS CNAME                                                       | Always                                  |
| `gcp/`        | WIF pool + provider, deployer SA, Secret Manager containers, GitHub environments + variables  | Keyless deploys via GCP Secret Manager  |
| `aws/`        | GitHub OIDC provider, IAM role, Secrets Manager container, GitHub environments + variables    | Keyless deploys via AWS Secrets Manager |

## Order of operations

```bash
# 1. The site itself. The token needs Pages › Edit + DNS › Edit. Export it;
#    never write it into a tfvars file.
export CLOUDFLARE_API_TOKEN="..."
make tf-init  BACKEND=cloudflare
make tf-apply BACKEND=cloudflare

# 2. Optional: the keyless layer. Pick ONE.
export GITHUB_TOKEN="..."   # fine-grained PAT: Administration, Environments, Variables on the repo
make tf-init  BACKEND=gcp   # or BACKEND=aws
make tf-apply BACKEND=gcp

# 3. Push the credential VALUES out-of-band, never through Terraform.
#    GCP: see `terraform output add_secret_values`  (gcloud secrets versions add)
#    AWS: see `terraform output add_secret_values`  (aws secretsmanager put-secret-value)

# 4. In the repo, keep ONE deploy workflow and delete the other three.
```

The `gcp/` and `aws/` roots create the GitHub `production` and `preview`
environments and populate them with **non-secret variables only**: secret
*names*, role ARNs, service account emails. Real credential values are added
out-of-band (`gcloud secrets versions add`, `aws secretsmanager
put-secret-value`) so they never appear in Terraform state, a tfvars file, or
GitHub.

## Vault?

`deploy-keyless-vault.yml` assumes you already run Vault. Its setup is a
one-time `vault write` for the JWT auth role (documented in the workflow
file), not something Terraform should guess at. If your Vault lives in
Terraform already, the pieces map directly onto `vault_jwt_auth_backend` and
`vault_jwt_auth_backend_role`.

## Growing up

This layout is deliberately flat: one site, one repo, a few roots. When a
second or third site shows up, graduate to a central infra repo with a shared
WIF pool, a `site` module composing deployer + environments + Pages, and one
stack per site. The patterns here lift over unchanged; they're the same
resources, just composed.
