#!/usr/bin/env bash
# Debug information
echo "Current directory: $(pwd)"
ls -la

# Build React app
if [ -d "client" ]; then
  cd client && npm install && npm run build && cd ..
else
  echo "Error: client directory not found"
  exit 1
fi

# Install Python dependencies
if [ -d "server" ]; then
  cd server && pip install -r requirements.txt
else
  echo "Error: server directory not found"
  exit 1
fi