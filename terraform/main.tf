terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # This will be configured via backend config files for each environment
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "UEFA-RAP"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Additional provider for ACM certificates (must be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "UEFA-RAP"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Route53 Hosted Zone (assuming it already exists)
data "aws_route53_zone" "main" {
  name = var.domain_name
}

# S3 Bucket for website content
module "website_bucket" {
  source = "./modules/s3-website"

  bucket_name = var.website_bucket_name
  environment = var.environment
  domain_name = var.website_domain
}

# CloudFront Distribution
module "cloudfront" {
  source = "./modules/cloudfront"

  bucket_id                      = module.website_bucket.bucket_id
  bucket_domain_name             = module.website_bucket.bucket_domain_name
  website_domain                 = var.website_domain
  environment                   = var.environment
  acm_certificate_arn           = module.ssl_certificate.certificate_arn
  origin_access_identity_path   = module.website_bucket.origin_access_identity_path
  
  depends_on = [module.ssl_certificate]
}

# SSL Certificate
module "ssl_certificate" {
  source = "./modules/acm-certificate"
  
  providers = {
    aws = aws.us_east_1
  }

  domain_name           = var.website_domain
  route53_zone_id      = data.aws_route53_zone.main.zone_id
  environment          = var.environment
}

# Route53 DNS Records
module "dns" {
  source = "./modules/route53"

  zone_id                    = data.aws_route53_zone.main.zone_id
  website_domain            = var.website_domain
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
  environment               = var.environment
}

# S3 Bucket for content processing (uploads, processing pipeline)
resource "aws_s3_bucket" "content_processing" {
  bucket = "${var.project_name}-content-processing-${var.environment}"
}

resource "aws_s3_bucket_versioning" "content_processing" {
  bucket = aws_s3_bucket.content_processing.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "content_processing" {
  bucket = aws_s3_bucket.content_processing.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB table for quiz results and user data (Free Tier optimized)
resource "aws_dynamodb_table" "quiz_results" {
  name           = "${var.project_name}-quiz-results-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"  # More cost-effective for low usage
  hash_key       = "user_id"
  range_key      = "quiz_timestamp"

  attribute {
    name = "user_id"
    type = "S"
  }

  attribute {
    name = "quiz_timestamp"
    type = "S"
  }

  tags = {
    Name = "UEFA RAP Quiz Results"
    Environment = var.environment
  }
}

# IAM role for Lambda functions (foundation for future content processing)
resource "aws_iam_role" "lambda_execution_role" {
  name = "${var.project_name}-lambda-execution-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "states.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_execution_policy" {
  name = "${var.project_name}-lambda-execution-policy-${var.environment}"
  role = aws_iam_role.lambda_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.content_processing.arn}/*",
          "${module.website_bucket.bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.content_processing.arn,
          module.website_bucket.bucket_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.quiz_results.arn
      },
      {
        Effect = "Allow"
        Action = [
          "textract:DetectDocumentText",
          "textract:AnalyzeDocument"
        ]
        Resource = "*"
      }
    ]
  })
}
