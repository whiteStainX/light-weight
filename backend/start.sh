#!/bin/bash
set -e

# Get the directory of this script so that relative paths work correctly.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Starting backend server..."
uvicorn main:app --reload
