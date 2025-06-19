output "website_record_name" {
  description = "Website A record name"
  value       = aws_route53_record.website.name
}

output "website_record_fqdn" {
  description = "Website A record FQDN"
  value       = aws_route53_record.website.fqdn
}

output "website_ipv6_record_fqdn" {
  description = "Website AAAA record FQDN"
  value       = aws_route53_record.website_ipv6.fqdn
}
