terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

provider "aws" {
  access_key = var.aws_access_key
  secret_key = var.aws_secret_access_key
  region     = var.aws_region
}

variable "do_token" {
  type = string
}

variable "ssh_fingerprint" {
  type = string
}

# Environment Variables for AWS and DynamoDB
variable "aws_access_key" {
  type      = string
  sensitive = true
}

variable "aws_secret_access_key" {
  type      = string
  sensitive = true
}

variable "aws_region" {
  type = string
}

variable "dynamo_table_name" {
  type = string
}

variable "open_api_key" {
  type      = string
  sensitive = true
}

variable "private_ssh_key" {
  type      = string
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

# Create a DNS domain in DigitalOcean
resource "digitalocean_domain" "my_domain" {
  name = "metaphoto.site"
}

#create dynamotable
resource "aws_dynamodb_table" "metaphoto_test" {
  name           = "Metaphoto_test"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "PK" # Partition key
  range_key      = "SK" # Sort key

  lifecycle {
    prevent_destroy = false
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "related_to"
    type = "S"
  }

  attribute {
    name = "relation_type"
    type = "S"
  }

  attribute {
    name = "title"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  # Global Secondary Index: gsi_type-index
  global_secondary_index {
    name            = "gsi_type-index"
    hash_key        = "type"
    range_key       = "PK"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_related_to-index
  global_secondary_index {
    name            = "gsi_related_to-index"
    hash_key        = "related_to"
    range_key       = "relation_type"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_title-index
  global_secondary_index {
    name            = "gsi_title-index"
    hash_key        = "type"
    range_key       = "title"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  # Global Secondary Index: gsi_email-index
  global_secondary_index {
    name            = "gsi_email-index"
    hash_key        = "email"
    range_key       = "PK"
    projection_type = "ALL"

    read_capacity  = 5
    write_capacity = 5
  }

  tags = {
    Name = "Metaphoto_test"
  }
}


# Create the DigitalOcean Droplet
resource "digitalocean_droplet" "web" {
  image    = "ubuntu-22-04-x64"
  name     = "docker-droplet"
  region   = "nyc3"
  size     = "s-1vcpu-1gb"
  ssh_keys = [var.ssh_fingerprint]

  lifecycle {
    create_before_destroy = true
  }

  connection {
    type        = "ssh"
    user        = "root"
    agent       = false
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


  # Run the Python script to seed the DynamoDB table
  provisioner "remote-exec" {
    inline = [
      "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y python3-pip",
      "python3 /home/root/app/seedDb.py"
    ]
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


# Create an A record that points to the Droplet's IP
resource "digitalocean_record" "webapp" {
  domain = digitalocean_domain.my_domain.name
  type   = "A"
  name   = "www" # Use "@" if you want the root domain (example.com), or "www" for www.example.com
  value  = digitalocean_droplet.web.ipv4_address
  ttl    = 300
}



output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}
