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
    tags = merge(var.tags, {
      ManagedBy = "Terraform"
    })
  }
}

# ACM certificates for CloudFront must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = merge(var.tags, {
      ManagedBy = "Terraform"
    })
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Route53 Hosted Zone (existing)
data "aws_route53_zone" "main" {
  zone_id = "Z00694143KSNUC1CYRT7G"
}

# Existing ACM Certificate (wildcard *.uefa-rap.com)
data "aws_acm_certificate" "existing" {
  provider = aws.us_east_1
  domain   = "*.uefa-rap.com"
  statuses = ["ISSUED"]
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
  acm_certificate_arn           = data.aws_acm_certificate.existing.arn
  origin_access_identity_path   = module.website_bucket.origin_access_identity_path
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

# Content Processing Pipeline Resources

# ZIP Processor Lambda Function
resource "aws_lambda_function" "zip_processor" {
  filename         = "lambda_packages/zip-processor.zip"
  function_name    = "${var.project_name}-zip-processor-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 300
  memory_size     = 512

  environment {
    variables = {
      STEP_FUNCTION_ARN = aws_sfn_state_machine.content_processing.arn
    }
  }

  depends_on = [aws_iam_role_policy.lambda_execution_policy]
}

# OCR Processor Lambda Function
resource "aws_lambda_function" "ocr_processor" {
  filename         = "lambda_packages/ocr-processor.zip"
  function_name    = "${var.project_name}-ocr-processor-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 900  # 15 minutes for OCR processing
  memory_size     = 1024

  depends_on = [aws_iam_role_policy.lambda_execution_policy]
}

# Content Deployer Lambda Function
resource "aws_lambda_function" "content_deployer" {
  filename         = "lambda_packages/content-deployer.zip"
  function_name    = "${var.project_name}-content-deployer-${var.environment}"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 600  # 10 minutes for deployment
  memory_size     = 512

  environment {
    variables = {
      WEBSITE_BUCKET            = module.website_bucket.bucket_name
      CLOUDFRONT_DISTRIBUTION_ID = module.cloudfront.distribution_id
      BASE_URL                  = "https://${var.website_domain}"
    }
  }

  depends_on = [aws_iam_role_policy.lambda_execution_policy]
}

# Step Functions State Machine
resource "aws_sfn_state_machine" "content_processing" {
  name     = "${var.project_name}-content-processing-${var.environment}"
  role_arn = aws_iam_role.step_functions_role.arn

  definition = templatefile("${path.module}/../step-functions/content-processing-workflow.json", {
    OCR_PROCESSOR_LAMBDA_ARN    = aws_lambda_function.ocr_processor.arn
    CONTENT_DEPLOYER_LAMBDA_ARN = aws_lambda_function.content_deployer.arn
  })

  depends_on = [aws_iam_role_policy.step_functions_policy]
}

# S3 Bucket Notification for ZIP Processor
resource "aws_s3_bucket_notification" "content_processing_trigger" {
  bucket = aws_s3_bucket.content_processing.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.zip_processor.arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = ".zip"
  }

  depends_on = [aws_lambda_permission.s3_invoke_zip_processor]
}

# Lambda permission for S3 to invoke ZIP processor
resource "aws_lambda_permission" "s3_invoke_zip_processor" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.zip_processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.content_processing.arn
}

# IAM role for Lambda functions
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
      },
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = aws_sfn_state_machine.content_processing.arn
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = module.cloudfront.distribution_arn
      }
    ]
  })
}

# IAM role for Step Functions
resource "aws_iam_role" "step_functions_role" {
  name = "${var.project_name}-step-functions-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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

resource "aws_iam_role_policy" "step_functions_policy" {
  name = "${var.project_name}-step-functions-policy-${var.environment}"
  role = aws_iam_role.step_functions_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.ocr_processor.arn,
          aws_lambda_function.content_deployer.arn
        ]
      }
    ]
  })
}
