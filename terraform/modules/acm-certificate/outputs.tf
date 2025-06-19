output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate_validation.cert.certificate_arn
}

output "certificate_status" {
  description = "ACM certificate status"
  value       = aws_acm_certificate.cert.status
}
