# Development Environment Configuration
environment = "dev"
aws_region  = "us-east-1"

# Domain configuration
domain_name         = "uefa-rap.com"
website_domain      = "dev.uefa-rap.com"
website_bucket_name = "uefa-rap-dev-website"

# CloudFront configuration
cloudfront_price_class = "PriceClass_100"  # Most cost-effective

# Additional tags
tags = {
  Environment = "Development"
  Owner       = "UEFA-RAP"
  Backup      = "NotRequired"
}
