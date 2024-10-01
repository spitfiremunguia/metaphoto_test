#!/bin/bash

# Update package list and install dependencies non-interactively
sudo apt-get update -y
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common git

# Add Docker’s official GPG key non-interactively
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker APT repository without user confirmation
sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker non-interactively
sudo apt-get update -y
sudo apt-get install -y docker-ce

# Add current user to the Docker group to allow running Docker without sudo
sudo usermod -aG docker ${USER}

# Install Docker Compose non-interactively
DOCKER_COMPOSE_VERSION="1.29.2"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make Docker Compose executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker Compose installation
if docker-compose --version; then
  echo "Docker Compose installed successfully"
else
  echo "Docker Compose installation failed" >&2
  exit 1
fi

# Clone the application repository
# Use the token in the HTTPS URL
git clone https://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@github.com/spitfiremunguia/metaphoto_test.git /home/${USER}/app

# Change to the repository directory
cd /home/${USER}/app

# Ensure the correct permissions
sudo chown -R ${USER}:${USER} /home/${USER}/app

# Start Docker Compose to run the application
docker-compose up -d

# Verify Docker installation
docker --version
