variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "website_domain" {
  description = "Website domain name"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}
