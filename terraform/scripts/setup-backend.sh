#!/bin/bash

# UEFA RAP Terraform Backend Setup Script
# This script creates the S3 buckets needed for Terraform state management with native S3 locking

set -e

echo "🏗️  Setting up UEFA RAP Terraform Backend Infrastructure..."

# Variables
PROD_BUCKET="uefa-rap-terraform-state-prod"
DEV_BUCKET="uefa-rap-terraform-state-dev"
REGION="us-east-1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if AWS CLI is configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install and configure it first.${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ AWS CLI is configured${NC}"
}

# Function to create S3 bucket with proper configuration
create_s3_bucket() {
    local bucket_name=$1
    local env=$2
    
    echo "Creating S3 bucket: $bucket_name"
    
    # Create bucket
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Bucket $bucket_name already exists${NC}"
    else
        # Create bucket (handle us-east-1 special case)
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket \
                --bucket "$bucket_name" \
                --region "$REGION" \
                --acl private
        else
            aws s3api create-bucket \
                --bucket "$bucket_name" \
                --region "$REGION" \
                --create-bucket-configuration LocationConstraint="$REGION" \
                --acl private
        fi
        echo -e "${GREEN}✅ Created bucket: $bucket_name${NC}"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket "$bucket_name" \
        --versioning-configuration Status=Enabled
    echo -e "${GREEN}✅ Enabled versioning for: $bucket_name${NC}"
    
    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket "$bucket_name" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    },
                    "BucketKeyEnabled": true
                }
            ]
        }'
    echo -e "${GREEN}✅ Enabled encryption for: $bucket_name${NC}"
    
    # Block public access
    aws s3api put-public-access-block \
        --bucket "$bucket_name" \
        --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    echo -e "${GREEN}✅ Blocked public access for: $bucket_name${NC}"
    
    # Add lifecycle policy to manage costs
    aws s3api put-bucket-lifecycle-configuration \
        --bucket "$bucket_name" \
        --lifecycle-configuration '{
            "Rules": [
                {
                    "ID": "terraform-state-lifecycle",
                    "Status": "Enabled",
                    "Filter": {"Prefix": ""},
                    "NoncurrentVersionTransitions": [
                        {
                            "NoncurrentDays": 30,
                            "StorageClass": "STANDARD_IA"
                        },
                        {
                            "NoncurrentDays": 60,
                            "StorageClass": "GLACIER"
                        }
                    ],
                    "NoncurrentVersionExpiration": {
                        "NoncurrentDays": 90
                    }
                }
            ]
        }'
    echo -e "${GREEN}✅ Applied lifecycle policy for: $bucket_name${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🚀 UEFA RAP Terraform Backend Setup${NC}"
    echo "This will create the following resources:"
    echo "  • S3 bucket: $PROD_BUCKET (production state)"
    echo "  • S3 bucket: $DEV_BUCKET (development state)"
    echo "  • Native S3 locking will be used (no DynamoDB required)"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    
    check_aws_cli
    
    echo ""
    echo "Creating S3 buckets..."
    create_s3_bucket "$PROD_BUCKET" "prod"
    create_s3_bucket "$DEV_BUCKET" "dev"
    
    echo ""
    echo -e "${GREEN}🎉 Backend setup complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy development: ./scripts/deploy-dev.sh"
    echo "  2. Deploy production: ./scripts/deploy-prod.sh"
    echo ""
    echo "Backend configuration:"
    echo "  • Production state: s3://$PROD_BUCKET/prod/terraform.tfstate"
    echo "  • Development state: s3://$DEV_BUCKET/dev/terraform.tfstate"
    echo "  • State locking: Native S3 locking (use_lockfile = true)"
}

main "$@"
