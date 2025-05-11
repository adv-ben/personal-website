#!/bin/bash

CONFIG_FILE="config.cfg"

# Check config file existence
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file '$CONFIG_FILE' not found."
    exit 1
fi

# Source config file
source "$CONFIG_FILE"

echo "Files prepared in $PUBLIC_DIR:"
ls -l "$PUBLIC_DIR"