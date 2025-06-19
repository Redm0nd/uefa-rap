output "website_url" {
  description = "Website URL"
  value       = "https://${var.website_domain}"
}

output "website_bucket_name" {
  description = "S3 bucket name for website content"
  value       = module.website_bucket.bucket_name
}

output "content_processing_bucket_name" {
  description = "S3 bucket name for content processing"
  value       = aws_s3_bucket.content_processing.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cloudfront.distribution_id
}

output "quiz_results_table_name" {
  description = "DynamoDB table name for quiz results"
  value       = aws_dynamodb_table.quiz_results.name
}

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution_role.arn
}
