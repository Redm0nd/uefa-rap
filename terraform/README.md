# UEFA RAP Terraform Infrastructure

This directory contains Infrastructure as Code (IaC) using Terraform to deploy the UEFA RAP application infrastructure on AWS.

## Architecture Overview

- **S3**: Website hosting and content processing buckets
- **CloudFront**: Global CDN for fast content delivery
- **Route53**: DNS management
- **ACM**: SSL certificates
- **DynamoDB**: Quiz results and user data storage
- **IAM**: Roles and policies for Lambda functions
- **Lambda**: Foundation for content processing pipeline

## Prerequisites

1. **Terraform** >= 1.0 installed
2. **AWS CLI** configured with appropriate credentials
3. **Domain**: You must own the domain `uefa-rap.com` with Route53 hosted zone
4. **AWS Permissions**: Your AWS credentials need permissions for:
   - S3 (buckets, policies, CORS)
   - CloudFront (distributions, OAI)
   - Route53 (hosted zones, records)
   - ACM (certificates, validation)
   - DynamoDB (tables)
   - IAM (roles, policies)

## Directory Structure

```
terraform/
├── main.tf                 # Main Terraform configuration
├── variables.tf            # Variable definitions
├── outputs.tf             # Output definitions
├── modules/               # Reusable modules
│   ├── s3-website/       # S3 static website hosting
│   ├── cloudfront/       # CloudFront distribution
│   ├── acm-certificate/  # SSL certificate management
│   └── route53/          # DNS records
├── environments/         # Environment-specific configurations
│   ├── prod.tfvars       # Production variables
│   ├── dev.tfvars        # Development variables
│   ├── prod-backend.conf # Production backend config
│   └── dev-backend.conf  # Development backend config
└── scripts/              # Deployment scripts
    ├── setup-backend.sh  # Bootstrap S3 backend
    ├── deploy-dev.sh     # Deploy development
    └── deploy-prod.sh    # Deploy production
```

## Initial Setup

### 1. Bootstrap S3 Backend

Before deploying the infrastructure, you need to create S3 buckets for Terraform state:

```bash
cd terraform
./scripts/setup-backend.sh
```

This creates:
- S3 buckets for Terraform state (prod and dev)
- Proper encryption and versioning
- Native S3 locking enabled

### 2. Deploy Development Environment

```bash
cd terraform
./scripts/deploy-dev.sh
```

This will:
- Initialize Terraform with dev backend
- Plan the deployment
- Apply the infrastructure (with confirmation)

### 3. Deploy Production Environment

```bash
cd terraform
./scripts/deploy-prod.sh
```

## Environment Configuration

### Production (`prod.tfvars`)
- Domain: `uefa-rap.com`
- Bucket: `uefa-rap-prod-website`
- Environment: `prod`

### Development (`dev.tfvars`)
- Domain: `dev.uefa-rap.com`
- Bucket: `uefa-rap-dev-website`
- Environment: `dev`

## Cost Optimization

All resources are configured for AWS Free Tier optimization:

- **S3**: Standard tier, lifecycle policies
- **CloudFront**: PriceClass_100 (most cost-effective)
- **DynamoDB**: Pay-per-request billing
- **Lambda**: Ready for free tier usage
- **Route53**: Minimal DNS records

**Estimated monthly cost**: $3-8 USD with AWS Free Tier

## SSL Certificates

SSL certificates are automatically provisioned via ACM with DNS validation. The process:

1. ACM certificate requested for the domain
2. DNS validation records created in Route53
3. Certificate validated and issued
4. CloudFront configured with the certificate

## Manual Commands

If you prefer manual deployment:

### Development
```bash
cd terraform

# Initialize
terraform init -backend-config=environments/dev-backend.conf

# Plan
terraform plan -var-file=environments/dev.tfvars

# Apply
terraform apply -var-file=environments/dev.tfvars
```

### Production
```bash
cd terraform

# Initialize
terraform init -backend-config=environments/prod-backend.conf

# Plan
terraform plan -var-file=environments/prod.tfvars

# Apply
terraform apply -var-file=environments/prod.tfvars
```

## Outputs

After successful deployment, you'll get:

- `website_url`: The HTTPS URL of your website
- `website_bucket_name`: S3 bucket for website content
- `content_processing_bucket_name`: S3 bucket for uploads
- `cloudfront_distribution_id`: For cache invalidation
- `quiz_results_table_name`: DynamoDB table name

## Content Deployment

To deploy your website content:

```bash
# Sync to S3 bucket (replace with actual bucket name from outputs)
aws s3 sync ./dist/ s3://uefa-rap-prod-website/ --delete

# Invalidate CloudFront cache (replace with actual distribution ID)
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

## Troubleshooting

### Common Issues

1. **Route53 Hosted Zone**: Ensure `uefa-rap.com` hosted zone exists
2. **AWS Permissions**: Verify your AWS credentials have required permissions
3. **Certificate Validation**: DNS validation can take 5-10 minutes
4. **CloudFront Deployment**: Initial deployment takes 15-20 minutes

### State Management

- State files are stored in S3 with encryption
- Native S3 locking provides state locking automatically
- Each environment has separate state

### Cleanup

To destroy an environment:

```bash
# Development
terraform destroy -var-file=environments/dev.tfvars

# Production
terraform destroy -var-file=environments/prod.tfvars
```

## Next Steps

After infrastructure deployment:

1. **Phase 2**: Implement content processing pipeline
2. **Phase 3**: Add quiz functionality with OCR
3. **Phase 4**: User authentication with Cognito
4. **Phase 5**: Advanced analytics and reporting

## Support

For infrastructure issues:
1. Check AWS CloudTrail for API errors
2. Review Terraform state and plan output
3. Verify AWS resource quotas and limits
4. Check domain DNS propagation
