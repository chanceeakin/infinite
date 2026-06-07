locals {
  # Strip "https://" prefix from App Runner URLs for use as CloudFront origin domain names
  backend_origin_domain  = replace(aws_apprunner_service.backend.service_url, "https://", "")
  frontend_origin_domain = replace(aws_apprunner_service.frontend.service_url, "https://", "")
}

resource "aws_cloudfront_distribution" "app" {
  enabled     = true
  comment     = "${var.app_name} distribution"
  price_class = "PriceClass_100" # US/EU only — cheapest tier

  # Origin: Next.js frontend
  origin {
    domain_name = local.frontend_origin_domain
    origin_id   = "frontend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin: Go backend
  origin {
    domain_name = local.backend_origin_domain
    origin_id   = "backend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # /api/* → backend (evaluated before default)
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "backend"

    # CachingDisabled managed policy — API responses must not be cached
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # AllViewerExceptHostHeader — forward all headers except Host (prevents SNI mismatch)
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"

    viewer_protocol_policy = "redirect-to-https"
  }

  # /* → frontend (default)
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "frontend"

    # CachingDisabled — Next.js SSR pages must not be cached at the CDN layer
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # AllViewerExceptHostHeader
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Free *.cloudfront.net HTTPS — no ACM certificate required
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
