output "deployer_sa_email" {
  description = "The deployer service account the GitHub workflow assumes via WIF."
  value       = google_service_account.deployer.email
}

output "workload_identity_provider" {
  description = "The WIF provider resource name the workflow authenticates through."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "add_secret_values" {
  description = "Next step: push the credential values out-of-band."
  value       = <<-EOT
    printf '%s' "<cf-deploy-token>" | gcloud secrets versions add ${var.secret_cloudflare_api_token} --data-file=- --project ${var.project_id}
    printf '%s' "<cf-account-id>"   | gcloud secrets versions add ${var.secret_cloudflare_account_id} --data-file=- --project ${var.project_id}
  EOT
}
