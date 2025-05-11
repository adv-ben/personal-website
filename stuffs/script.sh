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
if [[ -z "$USER" || -z "$HOST" || -z "$REMOTE_HTML_PATH" || -z "$PORT" ]]; then
    echo "Error: Config file is missing required fields."
    exit 1
fi

if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo "Error: PORT must be numeric."
    exit 1
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

echo "Nginx configuration updated and reloaded successfully."
echo "Nginx server running at http://$HOST:$PORT/"
echo "index.html running at http://$HOST:$PORT/index.html"
