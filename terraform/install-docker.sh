#!/bin/bash

# Ensure the script is run as root or with sudo privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or use sudo"
  exit 1
fi

sudo curl -fsSL https://get.docker.com -o get-docker.sh 
sudo sh get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

echo "Docker and Docker Compose installation completed successfully!"

# Clone the application repository
# Use the token in the HTTPS URL
git clone https://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@github.com/spitfiremunguia/metaphoto_test.git /home/${USER}/app

# Change to the repository directory
cd /home/${USER}/app

# Ensure the correct permissions
sudo chown -R ${USER}:${USER} /home/${USER}/app