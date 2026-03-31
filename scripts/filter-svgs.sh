#!/bin/bash
# Script to filter SVGs to only include official countries
# NOTE: Israel (il) is always excluded

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FLAGS_DIR="$PROJECT_DIR/public/flags-svgs"
COUNTRY_CODES="$PROJECT_DIR/scripts/final-flags.json"

# Countries to always exclude
EXCLUDED="il"

echo "Filtering public/flags-svgs to official countries only..."

# Get list of country codes from final-flags.json
COUNTRIES=$(jq -r '.[].code' "$COUNTRY_CODES")

# Count before
BEFORE=$(ls -1 "$FLAGS_DIR"/*.svg 2>/dev/null | wc -l)
echo "SVGs before: $BEFORE"

# Always delete excluded countries
for code in $EXCLUDED; do
  if [ -f "$FLAGS_DIR/${code}.svg" ]; then
    rm "$FLAGS_DIR/${code}.svg"
    echo "Deleted excluded flag: ${code}"
  fi
done

# Count files to keep
KEEP=0
REMOVE=0

# Move non-country SVGs to a backup folder
BACKUP_DIR="$PROJECT_DIR/flags-svgs-backup"
mkdir -p "$BACKUP_DIR"

for svg in "$FLAGS_DIR"/*.svg; do
  filename=$(basename "$svg" .svg)
  
  # Skip excluded countries
  if echo "$EXCLUDED" | grep -q "^${filename}$"; then
    rm "$svg"
    continue
  fi
  
  # Check if this is a country code
  if ! echo "$COUNTRIES" | grep -q "^${filename}$"; then
    mv "$svg" "$BACKUP_DIR/"
    REMOVE=$((REMOVE + 1))
  else
    KEEP=$((KEEP + 1))
  fi
done

echo ""
echo "Kept: $KEEP country flags"
echo "Removed: $REMOVE non-country flags"

# Clean up backup
rm -rf "$BACKUP_DIR"

# Count after
AFTER=$(ls -1 "$FLAGS_DIR"/*.svg 2>/dev/null | wc -l)
echo "SVGs after: $AFTER"

echo ""
echo "Done! public/flags-svgs now contains only official country flags (excluding Israel)."
