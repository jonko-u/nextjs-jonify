#!/bin/bash
# Read the dependencies.json file and extract package names
PACKAGE_NAMES=$(cat dependencies.json | jq -r '.dependencies | keys[]')
DEV_PACKAGE_NAMES=$(cat dependencies.json | jq -r '.devDependencies | keys[]')

# Install regular dependencies
npm install $PACKAGE_NAMES

# Install devDependencies
npm install --save-dev $DEV_PACKAGE_NAMES
