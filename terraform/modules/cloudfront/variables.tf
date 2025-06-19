variable "bucket_id" {
  description = "S3 bucket ID"
  type        = string
}

variable "bucket_domain_name" {
  description = "S3 bucket domain name"
  type        = string
}

variable "website_domain" {
  description = "Website domain name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
}

variable "origin_access_identity_path" {
  description = "CloudFront Origin Access Identity path"
  type        = string
}
