# =============================================================================
# Security Module Variables
# =============================================================================

variable "project_name" {
  description = "Name of the project, used for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "vpc_id" {
  description = "ID of the VPC to create security groups in"
  type        = string
}

variable "backend_port" {
  description = "Port the backend application listens on"
  type        = number
  default     = 8080
}

variable "frontend_port" {
  description = "Port the frontend application listens on"
  type        = number
  default     = 3000
}
