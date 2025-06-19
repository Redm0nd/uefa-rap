resource "aws_route53_record" "website" {
  zone_id = var.zone_id
  name    = var.website_domain
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# Optional: Create AAAA record for IPv6 support
resource "aws_route53_record" "website_ipv6" {
  zone_id = var.zone_id
  name    = var.website_domain
  type    = "AAAA"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}
