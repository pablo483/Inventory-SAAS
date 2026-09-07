output "jenkins_master_public_ip" {
  description = "The public IP address of the Jenkins Master instance"
  value       = module.jenkins_master.public_ip
}

output "jenkins_worker_public_ip" {
  description = "The public IP address of the Jenkins Worker instance"
  value       = module.jenkins_worker.public_ip
}

output "jenkins_web_url" {
  description = "The URL to access the Jenkins UI"
  value       = "http://${module.jenkins_master.public_ip}:8080"
}