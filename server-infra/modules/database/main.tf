# =============================================================================
# Database Module - RDS PostgreSQL
# =============================================================================

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-postgres"

  # Engine
  engine         = "postgres"
  engine_version = "16.3"

  # Instance sizing
  instance_class    = var.db_instance_class
  allocated_storage = 20
  max_allocated_storage = 100
  storage_type      = "gp3"

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]
  publicly_accessible    = false
  multi_az               = false  # Set to true for production high availability

  # Backup & Maintenance
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  # Security
  storage_encrypted = true

  # Lifecycle
  skip_final_snapshot       = true  # Set to false and configure final_snapshot_identifier for real production
  deletion_protection       = false # Set to true for production
  apply_immediately         = true

  # Performance Insights (free tier for db.t3.micro)
  performance_insights_enabled = true

  tags = {
    Name = "${var.project_name}-${var.environment}-postgres"
  }
}
