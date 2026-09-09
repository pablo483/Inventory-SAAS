variable "name" {
  description = "Name tag for the EC2 instance and related resources"
  type        = string
}

variable "role" {
  description = "Role of the Jenkins node (master or worker)"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "ami_id" {
  description = "AMI ID to launch the instance from"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID to place the instance in"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for the security group"
  type        = string
}

variable "key_name" {
  description = "Name of the SSH key pair to attach to the instance"
  type        = string
}

variable "ingress_ports" {
  description = "List of TCP ports to open for inbound traffic"
  type        = list(number)
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GiB"
  type        = number
  default     = 20
}