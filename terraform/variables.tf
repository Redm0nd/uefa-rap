variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (prod, dev)"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "uefa-rap"
}

variable "domain_name" {
  description = "Root domain name (uefa-rap.com)"
  type        = string
  default     = "uefa-rap.com"
}

variable "website_domain" {
  description = "Full website domain name"
  type        = string
}

variable "website_bucket_name" {
  description = "S3 bucket name for website content"
  type        = string
}

variable "enable_cloudfront_logging" {
  description = "Enable CloudFront access logging"
  type        = bool
  default     = false
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"  # Most cost-effective for global reach
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
