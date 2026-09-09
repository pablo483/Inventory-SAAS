# =============================================================================
# Root Module - Inventory SaaS Infrastructure
# =============================================================================
# Architecture:
#   - VPC with public/private subnets across 2 AZs
#   - Application Load Balancer in public subnets
#   - ECS Fargate for Java backend and React frontend in private subnets
#   - RDS PostgreSQL in private subnets
#   - NAT Gateway for outbound internet access from private subnets
# =============================================================================

# -----------------------------------------------------------------------------
# Networking: VPC, Subnets, IGW, NAT Gateway, Route Tables
# -----------------------------------------------------------------------------
module "networking" {
  source = "./modules/networking"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

# -----------------------------------------------------------------------------
# Security: Security Groups for ALB, ECS services, and RDS
# -----------------------------------------------------------------------------
module "security" {
  source = "./modules/security"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.networking.vpc_id
  backend_port   = var.backend_port
  frontend_port  = var.frontend_port
}

# -----------------------------------------------------------------------------
# Database: RDS PostgreSQL instance
# -----------------------------------------------------------------------------
module "database" {
  source = "./modules/database"

  project_name        = var.project_name
  environment         = var.environment
  private_subnet_ids  = module.networking.private_subnet_ids
  rds_security_group_id = module.security.rds_sg_id
  db_instance_class   = var.db_instance_class
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
}

# -----------------------------------------------------------------------------
# Compute: ECS Fargate Cluster, ALB, Task Definitions, Services
# -----------------------------------------------------------------------------
module "compute" {
  source = "./modules/compute"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids

  # Security Groups
  alb_security_group_id = module.security.alb_security_group_id
  backend_sg_id         = module.security.backend_sg_id
  frontend_sg_id        = module.security.frontend_sg_id

  # Container configuration
  backend_image          = var.backend_image
  frontend_image         = var.frontend_image
  backend_port           = var.backend_port
  frontend_port          = var.frontend_port
  backend_cpu            = var.backend_cpu
  backend_memory         = var.backend_memory
  frontend_cpu           = var.frontend_cpu
  frontend_memory        = var.frontend_memory
  backend_desired_count  = var.backend_desired_count
  frontend_desired_count = var.frontend_desired_count

  # Database connection details
  db_endpoint = module.database.db_endpoint
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
}
