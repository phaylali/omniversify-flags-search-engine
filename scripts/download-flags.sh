#!/bin/bash
# Script to download all country flags for local use
# NOTE: Israel (il) is always excluded

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FLAGS_DIR="$PROJECT_DIR/public/flags-svgs"

# Countries to always exclude
EXCLUDED="il"

echo "Creating public/flags-svgs directory..."
mkdir -p "$FLAGS_DIR"

echo "Downloading flags from flag-icons (GitHub)..."
cd /tmp

# Download flag-icons from GitHub
curl -sL "https://github.com/lipis/flag-icons/archive/refs/heads/main.zip" -o flag-icons.zip

echo "Extracting flags..."
# Extract and copy SVG files
unzip -o flag-icons.zip
cp flag-icons-main/flags/4x3/*.svg "$FLAGS_DIR/" 2>/dev/null || cp flag-icons-main/flags/1x1/*.svg "$FLAGS_DIR/" 2>/dev/null

# Clean up
rm -rf flag-icons flag-icons.zip flag-icons-main

# Always delete excluded countries
for code in $EXCLUDED; do
  if [ -f "$FLAGS_DIR/${code}.svg" ]; then
    rm "$FLAGS_DIR/${code}.svg"
    echo "Deleted excluded flag: ${code}"
  fi
done

# Count flags
cd "$FLAGS_DIR"
COUNT=$(ls -1 *.svg 2>/dev/null | wc -l)
echo ""
echo "Downloaded $COUNT flag SVG files to public/flags-svgs/ (excluding Israel)"

echo ""
echo "You can now run: bun run extract-colors && bun run filter-countries"
