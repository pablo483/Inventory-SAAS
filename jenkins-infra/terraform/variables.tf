variable "aws_region" {
  description = "AWS region to deploy the infrastructure"
  type        = string
  default     = "us-east-1"
}



variable "key_name" {
  description = "Name of the AWS SSH key pair to attach to the instances"
  type        = string
}

variable "ssh_private_key_path" {
  description = "Local path to the private SSH key used by Ansible"
  type        = string
  default     = "../jenkins_key"
}

variable "ubuntu_ami" {
  description = "AMI ID for Ubuntu (Must match the selected aws_region)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS in us-east-1
}