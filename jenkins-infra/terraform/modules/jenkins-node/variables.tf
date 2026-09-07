variable "name" {}
variable "role" {}
variable "instance_type" {}
variable "ami_id" {}
variable "subnet_id" {}
variable "vpc_id" {}
variable "key_name" {}
variable "ingress_ports" { type = list(number) }
variable "root_volume_size" {
  type    = number
  default = 20
}