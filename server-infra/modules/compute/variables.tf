# =============================================================================
# Compute Module Variables
# =============================================================================

# -----------------------------------------------------------------------------
# General
# -----------------------------------------------------------------------------
variable "project_name" {
  description = "Name of the project, used for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------
variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "public_subnet_ids" {
  description = "IDs of the public subnets (for ALB)"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "IDs of the private subnets (for ECS tasks)"
  type        = list(string)
}

# -----------------------------------------------------------------------------
# Security Groups
# -----------------------------------------------------------------------------
variable "alb_security_group_id" {
  description = "ID of the ALB security group"
  type        = string
}

variable "backend_sg_id" {
  description = "ID of the backend ECS security group"
  type        = string
}

variable "frontend_sg_id" {
  description = "ID of the frontend ECS security group"
  type        = string
}

# -----------------------------------------------------------------------------
# Container Configuration
# -----------------------------------------------------------------------------
variable "backend_image" {
  description = "Docker image for the Java backend"
  type        = string
  default     = "nginx:latest"
}

variable "frontend_image" {
  description = "Docker image for the React frontend"
  type        = string
  default     = "nginx:latest"
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

variable "backend_cpu" {
  description = "CPU units for the backend task (1 vCPU = 1024)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory (MiB) for the backend task"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "CPU units for the frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory (MiB) for the frontend task"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Number of backend ECS tasks to run"
  type        = number
  default     = 1
}

variable "frontend_desired_count" {
  description = "Number of frontend ECS tasks to run"
  type        = number
  default     = 1
}

# -----------------------------------------------------------------------------
# Database Connection
# -----------------------------------------------------------------------------
variable "db_endpoint" {
  description = "RDS endpoint (host:port)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
