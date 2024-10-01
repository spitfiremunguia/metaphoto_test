terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

variable "do_token" {
  type = string
}

variable "ssh_fingerprint" {
  type = string
}

# Environment Variables for AWS and DynamoDB
variable "aws_access_key" {
  type = string
}

variable "aws_secret_access_key" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "dynamo_table_name" {
  type = string
}

variable "open_api_key" {
  type = string
}

variable "private_ssh_key" {
  type = string
  sensitive = true
}

# Use template_file to generate the .env files for webapp and internal_api
data "template_file" "webapp_env" {
  template = <<-EOT
    OPEN_API_KEY=${var.open_api_key}
  EOT
}

data "template_file" "internal_api_env" {
  template = <<-EOT
    DYNAMO_TABLE_NAME=${var.dynamo_table_name}
    AWS_ACCESS_KEY=${var.aws_access_key}
    AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}
    AWS_REGION=${var.aws_region}
  EOT
}

# Create the DigitalOcean Droplet
resource "digitalocean_droplet" "web" {
  image  = "ubuntu-22-04-x64"
  name   = "docker-droplet"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [var.ssh_fingerprint]

  connection {
    type        = "ssh"
    user        = "root"
    agent        = false
    private_key = var.private_ssh_key
    host        = digitalocean_droplet.web.ipv4_address
    timeout     = "5m"
  }

  # First, install Docker and clone the repository
  provisioner "file" {
    source      = "install-docker.sh"
    destination = "/root/install-docker.sh"
  }

  provisioner "remote-exec" {
    inline = [
      "chmod +x /root/install-docker.sh",
      "/root/install-docker.sh"
    ]
  }

  # Now that the repository is cloned and directories are created, copy the .env files
  provisioner "file" {
    content     = data.template_file.webapp_env.rendered
    destination = "/home/root/app/webapp/.env"
  }

  provisioner "file" {
    content     = data.template_file.internal_api_env.rendered
    destination = "/home/root/app/internal_api/.env"
  }

 
  # Run Docker Compose to start the application
  provisioner "remote-exec" {
    inline = [
      "cd /home/root/app/",
      "docker-compose build",
      "docker-compose up -d"
    ]
  }
}

output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}
