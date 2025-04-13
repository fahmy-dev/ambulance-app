#!/usr/bin/env bash
# Build React app
cd client && npm install && npm run build && cd ..

# Install Python dependencies
cd server && pip install -r requirements.txt