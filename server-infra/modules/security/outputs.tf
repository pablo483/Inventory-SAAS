# =============================================================================
# Security Module Outputs
# =============================================================================

output "alb_security_group_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb.id
}

output "backend_sg_id" {
  description = "ID of the backend ECS security group"
  value       = aws_security_group.backend.id
}

output "frontend_sg_id" {
  description = "ID of the frontend ECS security group"
  value       = aws_security_group.frontend.id
}

output "rds_sg_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds.id
}
