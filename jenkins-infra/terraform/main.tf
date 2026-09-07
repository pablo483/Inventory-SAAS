resource "aws_key_pair" "jenkins_auth" {
  key_name   = var.key_name
  public_key = file("${path.module}/../jenkins_key.pub")
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

module "jenkins_master" {
  source        = "./modules/jenkins-node"
  name          = "jenkins-master"
  role          = "master"
  instance_type = "t3.medium"
  ami_id        = var.ubuntu_ami
  subnet_id     = data.aws_subnets.default.ids[0]
  vpc_id        = data.aws_vpc.default.id
  key_name      = aws_key_pair.jenkins_auth.key_name
  ingress_ports = [22, 8080]
}

module "jenkins_worker" {
  source        = "./modules/jenkins-node"
  name          = "jenkins-worker-01"
  role          = "worker"
  instance_type = "t3.medium"
  ami_id        = var.ubuntu_ami
  subnet_id     = data.aws_subnets.default.ids[0]
  vpc_id        = data.aws_vpc.default.id
  key_name      = aws_key_pair.jenkins_auth.key_name
  ingress_ports = [22]
}

resource "local_file" "ansible_inventory" {
  content = templatefile("${path.module}/templates/inventory.tftpl", {
    master_ip = module.jenkins_master.public_ip
    worker_ip = module.jenkins_worker.public_ip
    ssh_key   = var.ssh_private_key_path
  })
  filename = "${path.module}/../ansible/inventory.ini"
}