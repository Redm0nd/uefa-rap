output "website_url" {
  description = "Website URL"
  value       = "https://${var.website_domain}"
}

output "website_bucket_name" {
  description = "S3 bucket name for website content"
  value       = module.website_bucket.bucket_name
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

output "acm_certificate_arn" {
  description = "ACM certificate ARN (existing wildcard *.uefa-rap.com)"
  value       = data.aws_acm_certificate.existing.arn
}

# Content Processing Pipeline Outputs
output "content_processing_bucket_name" {
  description = "S3 bucket name for UEFA ZIP uploads"
  value       = aws_s3_bucket.content_processing.bucket
}

output "step_functions_arn" {
  description = "Step Functions state machine ARN for content processing"
  value       = aws_sfn_state_machine.content_processing.arn
}

output "zip_processor_lambda_name" {
  description = "ZIP processor Lambda function name"
  value       = aws_lambda_function.zip_processor.function_name
}

output "ocr_processor_lambda_name" {
  description = "OCR processor Lambda function name"
  value       = aws_lambda_function.ocr_processor.function_name
}

output "content_deployer_lambda_name" {
  description = "Content deployer Lambda function name"
  value       = aws_lambda_function.content_deployer.function_name
}
