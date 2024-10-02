#!/bin/bash

# Ensure the script is run as root or with sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or use sudo"
  exit 1
fi

github_token=$1

# Update the package list and install prerequisites
sudo apt-get update -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker’s official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update the package list again
sudo apt-get update -y

# Install Docker Engine, Docker CLI, containerd, and Docker Compose plugin without any interaction
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install Docker Compose as a standalone tool (optional)
DOCKER_COMPOSE_VERSION="v2.22.0"
sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker Compose installation
docker-compose --version

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add the current user to the docker group to allow non-sudo usage
sudo usermod -aG docker $USER || true  # Safeguard for situations where $USER is not defined

# Print Docker version to verify the installation
docker --version || true

# Docker installation finished message
echo "Docker installation completed. Non-sudo access might require re-login."

# Clone the application repository
git clone https://$github_token/spitfiremunguia/metaphoto_test.git /home/${USER}/app

# Change to the repository directory
cd /home/${USER}/app

# Ensure the correct permissions
sudo chown -R ${USER}:${USER} /home/${USER}/app
