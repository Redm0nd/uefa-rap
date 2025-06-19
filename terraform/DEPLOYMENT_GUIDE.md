# UEFA RAP Infrastructure Deployment Guide

## Phase 1 Complete! 🎉

You now have a complete, production-ready Terraform infrastructure for your UEFA RAP project.

## Quick Start

### 1. Prerequisites Check ✅
- Terraform >= 1.0 installed
- AWS CLI configured with your credentials
- Domain `uefa-rap.com` owned and hosted in Route53

### 2. Deploy Infrastructure (3 simple steps)

```bash
cd terraform

# Step 1: Create S3 buckets for Terraform state
./scripts/setup-backend.sh

# Step 2: Deploy development environment
./scripts/deploy-dev.sh

# Step 3: Deploy production environment (when ready)
./scripts/deploy-prod.sh
```

### 3. Upload Your Website Content

After deployment, get your bucket name from the outputs:
```bash
terraform output website_bucket_name
```

Then sync your content:
```bash
# Build your site first
npm run build

# Upload to S3 (replace with your actual bucket name)
aws s3 sync ./dist/ s3://uefa-rap-dev-website/ --delete

# Invalidate CloudFront cache for immediate updates
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## What You Get

### 🌐 Two Complete Environments
- **Development**: `https://dev.uefa-rap.com`
- **Production**: `https://uefa-rap.com`

### 🔒 Security & Performance
- SSL certificates (automatically provisioned)
- CloudFront CDN for global speed
- S3 buckets with proper security policies
- Encrypted Terraform state with locking

### 💰 Cost Optimized
- All resources configured for AWS Free Tier
- Estimated cost: $3-8/month
- Lifecycle policies to minimize storage costs

### 🛠️ Ready for Phase 2
- DynamoDB tables for quiz functionality
- IAM roles for Lambda functions
- S3 buckets for content processing pipeline

## File Structure Created

```
terraform/
├── main.tf                    # Main infrastructure
├── variables.tf               # Variable definitions
├── outputs.tf                # Output values
├── modules/                  # Reusable modules
│   ├── s3-website/          # S3 website hosting
│   ├── cloudfront/          # CDN distribution
│   ├── acm-certificate/     # SSL certificates
│   └── route53/             # DNS records
├── environments/            # Environment configs
│   ├── prod.tfvars         # Production settings
│   ├── dev.tfvars          # Development settings
│   ├── prod-backend.conf   # Prod state config
│   └── dev-backend.conf    # Dev state config
└── scripts/                # Deployment scripts
    ├── setup-backend.sh    # Bootstrap S3 backend
    ├── deploy-dev.sh       # Deploy development
    └── deploy-prod.sh      # Deploy production
```

## Key Features

### ✨ Modern S3 Backend
- **No DynamoDB required** - Using Terraform's new native S3 locking
- Encrypted state storage with versioning
- Separate state files for each environment

### 🚀 Automated Deployment
- One-command deployment for each environment
- Built-in validation and error checking
- Plan review before applying changes

### 📊 Complete Monitoring
- All outputs available after deployment
- Resource tagging for cost tracking
- CloudTrail integration ready

## Common Commands

```bash
# View current outputs
terraform output

# Update an environment
./scripts/deploy-dev.sh

# Check what would change
terraform plan -var-file=environments/dev.tfvars

# Destroy an environment (careful!)
terraform destroy -var-file=environments/dev.tfvars
```

## Troubleshooting

### SSL Certificate Issues
- DNS validation can take 5-10 minutes
- Ensure your Route53 hosted zone exists
- Check AWS Certificate Manager console

### CloudFront Deployment
- Initial deployment takes 15-20 minutes
- Updates propagate globally within 10-15 minutes
- Use invalidations for immediate cache clearing

### State Locking Issues
- S3 native locking is automatic
- No manual intervention required
- Check S3 bucket permissions if issues occur

## Next Steps - Phase 2

Ready to implement automated content processing:

1. **Content Processing Pipeline**
   - Lambda functions for ZIP file processing
   - Step Functions for workflow orchestration
   - Textract integration for OCR

2. **Quiz Functionality**
   - User interface for decision-making
   - Scoring and progress tracking
   - Results storage in DynamoDB

3. **User Management**
   - Cognito authentication
   - User profiles and history
   - Admin dashboard

## Support

- 📖 **Full Documentation**: See `README.md`
- 🔧 **Infrastructure Issues**: Check AWS CloudTrail
- 💬 **Questions**: Review Terraform plan outputs
- 🚨 **Errors**: Check AWS resource quotas and permissions

---

**You're all set!** Your UEFA RAP infrastructure is production-ready. 🚀
