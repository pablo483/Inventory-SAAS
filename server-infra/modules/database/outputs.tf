# =============================================================================
# Database Module Outputs
# =============================================================================

output "db_endpoint" {
  description = "Connection endpoint for the RDS instance (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "db_name" {
  description = "Name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_port" {
  description = "Port the database listens on"
  value       = aws_db_instance.main.port
}

output "db_instance_id" {
  description = "ID of the RDS instance"
  value       = aws_db_instance.main.id
}
