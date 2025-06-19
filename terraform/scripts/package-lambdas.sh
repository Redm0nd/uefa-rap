#!/bin/bash

# UEFA RAP Lambda Function Packaging Script
# Creates deployment packages for all Lambda functions

set -e

echo "🔧 Packaging Lambda Functions for UEFA RAP Pipeline"

# Create lambda packages directory
mkdir -p terraform/lambda_packages

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to package a Lambda function
package_lambda() {
    local function_name=$1
    local source_dir="lambda/${function_name}"
    local package_file="terraform/lambda_packages/${function_name}.zip"
    
    echo -e "${BLUE}📦 Packaging ${function_name}...${NC}"
    
    if [ ! -d "$source_dir" ]; then
        echo -e "${RED}❌ Source directory not found: $source_dir${NC}"
        exit 1
    fi
    
    # Create a temporary directory for packaging
    temp_dir=$(mktemp -d)
    
    # Copy source files
    cp -r "$source_dir"/* "$temp_dir/"
    
    # Create ZIP package
    cd "$temp_dir"
    zip -r "$package_file" .
    cd - > /dev/null
    
    # Clean up
    rm -rf "$temp_dir"
    
    # Verify package was created
    if [ -f "$package_file" ]; then
        local size=$(du -h "$package_file" | cut -f1)
        echo -e "${GREEN}✅ ${function_name}.zip created (${size})${NC}"
    else
        echo -e "${RED}❌ Failed to create ${function_name}.zip${NC}"
        exit 1
    fi
}

# Get the absolute path to the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"

# Package all Lambda functions
package_lambda "zip-processor"
package_lambda "ocr-processor" 
package_lambda "content-deployer"

echo ""
echo -e "${GREEN}🎉 All Lambda functions packaged successfully!${NC}"
echo ""
echo "📋 Package Summary:"
ls -lh terraform/lambda_packages/*.zip | while read -r line; do
    echo "   $line"
done

echo ""
echo -e "${BLUE}📌 Next Steps:${NC}"
echo "   1. Deploy infrastructure: cd terraform && ./scripts/deploy-dev.sh"
echo "   2. Upload a UEFA ZIP file to test the pipeline"
echo "   3. Monitor the Step Functions execution in AWS Console"
