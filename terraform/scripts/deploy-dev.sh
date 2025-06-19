#!/bin/bash

# UEFA RAP Development Environment Deployment Script

set -e

echo "🚀 Deploying UEFA RAP Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_CONFIG="environments/dev-backend.conf"
TFVARS_FILE="environments/dev.tfvars"
ENVIRONMENT="development"

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform is not installed. Please install Terraform first.${NC}"
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install and configure it first.${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi
    
    # Check if backend config exists
    if [ ! -f "$BACKEND_CONFIG" ]; then
        echo -e "${RED}❌ Backend configuration file not found: $BACKEND_CONFIG${NC}"
        echo -e "${YELLOW}💡 Run './scripts/setup-backend.sh' first to create the S3 backend.${NC}"
        exit 1
    fi
    
    # Check if tfvars file exists
    if [ ! -f "$TFVARS_FILE" ]; then
        echo -e "${RED}❌ Terraform variables file not found: $TFVARS_FILE${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to initialize Terraform
terraform_init() {
    echo -e "${BLUE}🔧 Initializing Terraform...${NC}"
    
    terraform init -backend-config="$BACKEND_CONFIG" -upgrade
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform initialized successfully${NC}"
    else
        echo -e "${RED}❌ Terraform initialization failed${NC}"
        exit 1
    fi
}

# Function to validate Terraform configuration
terraform_validate() {
    echo -e "${BLUE}🔍 Validating Terraform configuration...${NC}"
    
    terraform validate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform configuration is valid${NC}"
    else
        echo -e "${RED}❌ Terraform configuration validation failed${NC}"
        exit 1
    fi
}

# Function to plan Terraform deployment
terraform_plan() {
    echo -e "${BLUE}📋 Planning Terraform deployment...${NC}"
    
    terraform plan -var-file="$TFVARS_FILE" -out=tfplan-dev
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Terraform plan completed successfully${NC}"
    else
        echo -e "${RED}❌ Terraform planning failed${NC}"
        exit 1
    fi
}

# Function to apply Terraform deployment
terraform_apply() {
    echo -e "${BLUE}🏗️  Applying Terraform deployment...${NC}"
    echo -e "${YELLOW}⚠️  This will create AWS resources that may incur costs.${NC}"
    
    read -p "Do you want to apply the plan? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply tfplan-dev
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Terraform deployment completed successfully${NC}"
            
            # Clean up plan file
            rm -f tfplan-dev
            
            # Show outputs
            echo -e "${BLUE}📊 Deployment outputs:${NC}"
            terraform output
        else
            echo -e "${RED}❌ Terraform deployment failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  Deployment cancelled by user${NC}"
        rm -f tfplan-dev
        exit 0
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}🏁 UEFA RAP Development Environment Deployment${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Backend Config: $BACKEND_CONFIG"
    echo "Variables File: $TFVARS_FILE"
    echo ""
    
    # Change to terraform directory if not already there
    if [ ! -f "main.tf" ]; then
        if [ -f "../main.tf" ]; then
            cd ..
        else
            echo -e "${RED}❌ Cannot find main.tf. Please run this script from the terraform directory.${NC}"
            exit 1
        fi
    fi
    
    check_prerequisites
    terraform_init
    terraform_validate
    terraform_plan
    terraform_apply
    
    echo ""
    echo -e "${GREEN}🎉 Development environment deployment completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  • Upload your website content to the S3 bucket"
    echo "  • Test the website at the provided URL"
    echo ""
    echo "Useful commands:"
    echo "  • View outputs: terraform output"
    echo "  • Update deployment: ./scripts/deploy-dev.sh"
    echo "  • Destroy environment: terraform destroy -var-file=$TFVARS_FILE"
}

main "$@"
