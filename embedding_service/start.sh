#!/bin/bash

# Embedding Service Startup Script
# This script sets up and starts the embedding service using uv

set -e

echo "🚀 Starting twodirect Embedding Service..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo "✅ uv installed successfully!"
    echo "⚠️  Please restart your terminal or run: source $HOME/.cargo/env"
    echo "Then run this script again."
    exit 0
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase credentials before continuing."
    echo "Press Enter to continue after editing .env, or Ctrl+C to exit..."
    read
fi

# Sync dependencies with uv (creates venv automatically if needed)
echo "📦 Syncing dependencies with uv..."
uv sync

# Start the service
echo "✅ Starting embedding service on port 8000..."
echo "📚 API documentation will be available at http://localhost:8000/docs"
echo ""
uv run python main.py

