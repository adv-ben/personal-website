#!/bin/bash

# ssh helper function
run_ssh() {
    ssh "$USER@$HOST" "$@"
}

CONFIG_FILE="config.cfg"

# Check config file existence
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file '$CONFIG_FILE' not found."
    exit 1
fi

# Source config file
source "$CONFIG_FILE"

# Validate required variables
if [[ -z "$USER" || -z "$HOST" || -z "$REMOTE_HTML_PATH" ]]; then
    echo "Error: Config file is missing required fields."
    exit 1
fi

# run install script if needed
RUN_INSTALL_SCRIPT=false
if [ "$RUN_INSTALL_SCRIPT" = true ]; then
    echo "Running install script..."
    scp "./install.sh" "$USER@$HOST:~/" || exit 1
    run_ssh "chmod +x ~/install.sh"
    run_ssh "~/install.sh"
    echo "Install script completed successfully."
fi

# Assert nginx is installed on remote
run_ssh 'command -v nginx &> /dev/null' || {
    echo "Error: nginx is not installed on remote host." >&2
    exit 1
}

echo "nginx is installed on remote host."

# Set source and destination directories
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$SRC_DIR/../public_dir"

# Create remote public directory if needed
run_ssh "mkdir -p '$REMOTE_HTML_PATH'" || exit 1

# Copy public_dir contents to remote
rsync -avz --delete "$PUBLIC_DIR/" "$USER@$HOST:$REMOTE_HTML_PATH/" || exit 1
# If above is buggy fall back to
#scp -r "$PUBLIC_DIR/"* "$USER@$HOST:$REMOTE_HTML_PATH/" || exit 1

# Upload nginx.conf to the correct path
scp nginx.conf "$USER@$HOST:/etc/nginx/nginx.conf" || {
    echo "Error: Failed to upload nginx.conf" >&2
    exit 1
}

# Reload nginx on the remote server
run_ssh 'sudo nginx -t && sudo systemctl reload nginx' || {
    echo "Error: Failed to reload nginx" >&2
    exit 1
}

# run chat
run_ssh "
cd $REMOTE_HTML_PATH/projects/saas_basics && 
./run.sh" # has output

echo "Nginx configuration updated and reloaded successfully."
echo "Nginx server running at http://$HOST"
firefox http://143.198.81.147:3000/