#!/bin/bash

# Script to generate embeddings for all products
# Run this after setting up the database and starting the embedding service

set -e

echo "🧠 Generating embeddings for all products..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Please run start.sh first to install uv."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ No .env file found. Please create one from .env.example"
    exit 1
fi

# Run the embedding generation script with uv
uv run python scripts/generate_embeddings.py

echo ""
echo "✅ Embedding generation complete!"
echo "You can now use the hybrid search feature in your application."

