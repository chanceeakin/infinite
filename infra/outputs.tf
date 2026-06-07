output "cloudfront_url" {
  description = "Public URL of the application"
  value       = "https://${aws_cloudfront_distribution.app.domain_name}"
}

output "backend_ecr_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_url" {
  description = "ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_apprunner_url" {
  description = "Direct App Runner URL for the backend (for debugging)"
  value       = "https://${aws_apprunner_service.backend.service_url}"
}

output "frontend_apprunner_url" {
  description = "Direct App Runner URL for the frontend (for debugging)"
  value       = "https://${aws_apprunner_service.frontend.service_url}"
}
