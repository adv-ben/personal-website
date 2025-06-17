#!/bin/bash

# kill kill kill
fuser -k 3001/tcp
fuser -k 3002/tcp
fuser -k 3000/tcp

# Run python server 3001
cd python_server
INSTALL_PYTHON_VENV=false
INSTALL_PYTHON_DEPS=false
VENV_BASE_DIR="/opt/python-venvs"  # Persistent location outside project
PROJECT_NAME="saas_basics_python_server"  # Unique name for this project
VENV_PATH="$VENV_BASE_DIR/$PROJECT_NAME"

if [ "$INSTALL_PYTHON_VENV" = "true" ]; then
    # Install python3.12-venv if not already installed
    apt update && apt install -y python3.12-venv
    
    # Create base directory if it doesn't exist
    mkdir -p "$VENV_BASE_DIR"
    
    if [ ! -d "$VENV_PATH" ]; then
        echo "Creating virtual environment at $VENV_PATH..."
        python3 -m venv "$VENV_PATH" || { echo "Failed to create virtual environment"; exit 1; }
        echo "Virtual environment created successfully at $VENV_PATH"
    else
        echo "Virtual environment already exists at $VENV_PATH"
    fi
fi

# Activate the virtual environment from persistent location
source "$VENV_PATH/bin/activate"

if [ "$INSTALL_PYTHON_DEPS" = "true" ]; then
    echo "Installing Python dependencies..."
    # Clear cache to avoid disk space issues
    pip cache purge
    
    # Install PyTorch CPU version
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --no-cache-dir
    pip install accelerate --no-cache-dir
    pip install -r requirements.txt --no-cache-dir
    
    echo "Dependencies installed successfully"
fi

echo "Starting Python server..."
python3 main.py &

cd ..

# Run nodejs server 3002
cd nodejs_server
npm install
nohup node server.js &
cd ..

# Run react frontend 3000
cd react_frontend/my-app
npm run dev