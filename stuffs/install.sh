#!/bin/bash

# Function to check if all required software is already installed
check_all_installed() {
    nginx_installed=false
    nodejs_installed=false
    nextjs_installed=false

    # Check Nginx
    if command -v nginx &> /dev/null && sudo systemctl is-active nginx &> /dev/null; then
        nginx_installed=true
    fi

    # Check Node.js and npm
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        nodejs_installed=true
    fi

    # Check Next.js globally
    if npm list -g next &> /dev/null || npx next --version &> /dev/null 2>&1; then
        nextjs_installed=true
    fi

    # If everything is installed, exit early
    if [ "$nginx_installed" = true ] && [ "$nodejs_installed" = true ] && [ "$nextjs_installed" = true ]; then
        echo "All required software is already installed and running!"
        echo "Summary of installed versions:"
        echo "- Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
        echo "- Node.js: $(node --version)"
        echo "- npm: $(npm --version)"
        if command -v next &> /dev/null; then
            echo "- Next.js: $(next --version 2>/dev/null || echo 'Available via npx')"
        else
            echo "- Next.js: Available via npx"
        fi
        exit 0
    fi
}

# Function to check and install Node.js and npm
install_nodejs() {
    if ! command -v node &> /dev/null; then
        sudo apt update > /dev/null 2>&1
        sudo apt install -y nodejs npm > /dev/null 2>&1

        if [ $? -ne 0 ]; then
            echo "Failed to install Node.js and npm."
            exit 1
        fi
    fi
}

# Function to install Next.js
install_nextjs() {
    if ! npm list -g next &> /dev/null && ! npx next --version &> /dev/null 2>&1; then
        npm install -g next@latest > /dev/null 2>&1

        if [ $? -ne 0 ]; then
            echo "Failed to install Next.js globally. It will still be available via npx when creating projects."
        fi
    fi
}

# Main execution starts here
echo "=== Software Installation Script ==="

# Check if everything is already installed
check_all_installed

# Install Nginx if not already installed and running
if ! command -v nginx &> /dev/null || ! sudo systemctl is-active nginx &> /dev/null; then
    if ! command -v nginx &> /dev/null; then
        sudo apt update > /dev/null 2>&1
        sudo apt install -y nginx > /dev/null 2>&1
        if [ $? -ne 0 ]; then
            echo "Failed to install Nginx."
            exit 1
        fi
    fi

    sudo systemctl start nginx
    if [ $? -ne 0 ]; then
        echo "Failed to start Nginx. Checking status for more details..."
        sudo systemctl status nginx.service
        echo "Further logs can be found by running: sudo journalctl -xeu nginx.service"
        exit 1
    fi

    sudo systemctl enable nginx
    if [ $? -ne 0 ]; then
        echo "Failed to enable Nginx on boot."
        exit 1
    fi

    status=$(sudo systemctl is-active nginx)
    if [ "$status" != "active" ]; then
        echo "Nginx is not running as expected. Status: $status"
        exit 1
    else
        echo "Nginx is running."
    fi
fi

# Install Node.js and npm
install_nodejs

# Install Next.js
install_nextjs

echo "All installations completed successfully!"
echo "Summary of installed versions:"
echo "- Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "- Node.js: $(node --version)"
echo "- npm: $(npm --version)"
if command -v next &> /dev/null; then
    echo "- Next.js: $(next --version 2>/dev/null)"
else
    echo "- Next.js: Available via npx"
fi

echo ""
echo "You can now create a new Next.js project with:"
echo "npx create-next-app@latest my-app"