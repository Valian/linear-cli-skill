#!/bin/bash
set -e

echo "Setting up Linear CLI workspace..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Determine repository root path
if [ -n "$CONDUCTOR_ROOT_PATH" ]; then
    REPO_ROOT="$CONDUCTOR_ROOT_PATH"
else
    # If CONDUCTOR_ROOT_PATH isn't set, derive it from current directory
    # Workspace is at /path/to/repo/.conductor/workspace-name
    REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi

# Check if .env file exists in root
if [ ! -f "$REPO_ROOT/linear/.env" ]; then
    echo "Error: $REPO_ROOT/linear/.env not found."
    echo "Please create a .env file in the repository root at linear/.env with your LINEAR_API_KEY."
    echo "Example: LINEAR_API_KEY=your-api-key-here"
    exit 1
fi

# Copy .env file from root to workspace
echo "Copying .env file from root..."
cp "$REPO_ROOT/linear/.env" linear/.env

# Validate that LINEAR_API_KEY is set in the .env file
if ! grep -q "^LINEAR_API_KEY=.\\+$" linear/.env; then
    echo "Error: LINEAR_API_KEY not found or empty in linear/.env"
    echo "Please ensure your .env file contains: LINEAR_API_KEY=your-api-key-here"
    exit 1
fi

# Install dependencies
echo "Installing npm dependencies..."
cd linear
npm install

echo "Setup complete! You can now use the Linear CLI."
echo "Test it with: ./linear/linear team list"
