output "deployer_role_arn" {
  description = "The IAM role the GitHub workflow assumes via OIDC."
  value       = aws_iam_role.deployer.arn
}

output "add_secret_value" {
  description = "Next step: push the credential value out-of-band."
  value       = <<-EOT
    aws secretsmanager put-secret-value --secret-id ${var.secret_name} --region ${var.aws_region} \
      --secret-string '{"CLOUDFLARE_API_TOKEN":"<cf-deploy-token>","CLOUDFLARE_ACCOUNT_ID":"<cf-account-id>"}'
  EOT
}
