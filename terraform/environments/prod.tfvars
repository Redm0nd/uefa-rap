# Production Environment Configuration
environment = "prod"
aws_region  = "us-east-1"

# Domain configuration
domain_name         = "uefa-rap.com"
website_domain      = "uefa-rap.com"
website_bucket_name = "uefa-rap-prod-website"

# CloudFront configuration
cloudfront_price_class = "PriceClass_100"  # Most cost-effective

# Additional tags
tags = {
  Environment = "Production"
  Owner       = "UEFA-RAP"
  Backup      = "Required"
}
