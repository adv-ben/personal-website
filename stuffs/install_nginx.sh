#!/bin/bash

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx not found. Installing..."
    sudo apt install -y nginx > /dev/null 2>&1  # Suppress installation output, but capture errors
    if [ $? -ne 0 ]; then
        echo "Failed to install Nginx."
        exit 1
    fi
else
    echo "Nginx is already installed."
fi

# Ensure Nginx is running
echo "Ensuring Nginx is running..."
sudo systemctl start nginx
if [ $? -ne 0 ]; then
    echo "Failed to start Nginx. Checking status for more details..."
    sudo systemctl status nginx.service
    echo "Further logs can be found by running: sudo journalctl -xeu nginx.service"
    exit 1
fi

# Enable Nginx to start on boot
echo "Enabling Nginx to start on boot..."
sudo systemctl enable nginx
if [ $? -ne 0 ]; then
    echo "Failed to enable Nginx on boot."
    exit 1
fi

# Check Nginx status (only show output if there's an issue)
status=$(sudo systemctl is-active nginx)
if [ "$status" != "active" ]; then
    echo "Nginx is not running as expected. Status: $status"
    exit 1
else
    echo "Nginx is running."
fi

echo "Nginx installation or update completed."