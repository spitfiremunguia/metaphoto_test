provider "digitalocean" {
  token = var.do_token
}

variable "do_token" {
  type = string
}

variable "ssh_fingerprint" {
  type = string
}

resource "digitalocean_droplet" "web" {
  image  = "ubuntu-22-04-x64"
  name   = "docker-droplet"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
  ssh_keys = [var.ssh_fingerprint]

    connection {
        type        = "ssh"
        user        = "root"
        private_key = file("~/.ssh/id_rsa")
        host        = digitalocean_droplet.web.ipv4_address
    }

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

    provisioner "file" {
        source      = "../docker-compose.yml"
        destination = "/root/docker-compose.yml"
    }

    provisioner "remote-exec" {
    inline = [
        "cd /root",
        "docker-compose up -d"]
    }

}

output "droplet_ip" {
  value = digitalocean_droplet.web.ipv4_address
}
