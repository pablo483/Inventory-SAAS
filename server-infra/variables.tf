# =============================================================================
# Root Module Variables
# =============================================================================

# -----------------------------------------------------------------------------
# General
# -----------------------------------------------------------------------------
variable "project_name" {
  description = "Name of the project, used as a prefix for all resources"
  type        = string
  default     = "inventory-saas"
}

variable "environment" {
  description = "Deployment environment (e.g., production, staging, dev)"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  description = "AWS Availability Zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# -----------------------------------------------------------------------------
# Database (RDS PostgreSQL)
# -----------------------------------------------------------------------------
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Name of the PostgreSQL database"
  type        = string
  default     = "inventory_db"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Master password for the RDS instance. Use TF_VAR_db_password env variable or a .tfvars file."
  type        = string
  sensitive   = true
}

# -----------------------------------------------------------------------------
# ECS / Compute
# -----------------------------------------------------------------------------
variable "backend_image" {
  description = "Docker image for the Java backend (e.g., your ECR URI)"
  type        = string
  default     = "nginx:latest" # Placeholder - replace with your Java backend image
}

variable "frontend_image" {
  description = "Docker image for the React frontend (e.g., your ECR URI)"
  type        = string
  default     = "nginx:latest" # Placeholder - replace with your React frontend image
}

variable "backend_port" {
  description = "Port the Java backend listens on"
  type        = number
  default     = 8080
}

variable "frontend_port" {
  description = "Port the React frontend container listens on"
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
