#!/bin/bash

# Ensure the script is run as root or with sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or use sudo"
  exit 1
fi

# Uninstall old Docker versions if any
echo "Removing any old Docker versions..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc

# Update package list
echo "Updating package list..."
sudo apt-get update -y

# Install required packages for Docker
echo "Installing required packages..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release

# Add Docker's official GPG key
echo "Adding Docker's GPG key..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker's official APT repository
echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update the package list again to include Docker packages
echo "Updating package list to include Docker packages..."
sudo apt-get update -y

# Install Docker Engine, CLI, and containerd
echo "Installing Docker..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Add the current user to the Docker group to allow running Docker without sudo
echo "Adding user to Docker group..."
sudo usermod -aG docker ${USER}

# Restart Docker service
echo "Restarting Docker service..."
sudo systemctl restart docker

# Enable Docker to start on boot
echo "Enabling Docker to start on boot..."
sudo systemctl enable docker

# Install Docker Compose
DOCKER_COMPOSE_VERSION="1.29.2"
echo "Installing Docker Compose version $DOCKER_COMPOSE_VERSION..."
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make Docker Compose executable
echo "Making Docker Compose executable..."
sudo chmod +x /usr/local/bin/docker-compose

# Verify Docker installation
echo "Verifying Docker installation..."
if docker --version; then
  echo "Docker installed successfully: $(docker --version)"
else
  echo "Docker installation failed" >&2
  exit 1
fi

# Verify Docker Compose installation
echo "Verifying Docker Compose installation..."
if docker-compose --version; then
  echo "Docker Compose installed successfully: $(docker-compose --version)"
else
  echo "Docker Compose installation failed" >&2
  exit 1
fi

echo "Docker and Docker Compose installation completed successfully!"

# Clone the application repository
# Use the token in the HTTPS URL
git clone https://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@github.com/spitfiremunguia/metaphoto_test.git /home/${USER}/app

# Change to the repository directory
cd /home/${USER}/app

# Ensure the correct permissions
sudo chown -R ${USER}:${USER} /home/${USER}/app




