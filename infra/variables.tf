variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Base name used for all resource names"
  type        = string
  default     = "hotel-discovery"
}

variable "backend_image_tag" {
  description = "ECR image tag for the backend service (e.g. git short SHA)"
  type        = string
}

variable "frontend_image_tag" {
  description = "ECR image tag for the frontend service (e.g. git short SHA)"
  type        = string
}
