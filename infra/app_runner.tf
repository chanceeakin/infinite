resource "aws_apprunner_service" "backend" {
  service_name = "${var.app_name}-backend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      image_repository_type = "ECR"
      image_configuration {
        port = "8080"
        runtime_environment_variables = {
          PORT      = "8080"
          DATA_PATH = "/app/data/hotels.json"
        }
      }
    }
    auto_deployments_enabled = false
  }

  instance_configuration {
    cpu    = "256"
    memory = "512"
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/hotels"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }
}

resource "aws_apprunner_service" "frontend" {
  service_name = "${var.app_name}-frontend"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.frontend.repository_url}:${var.frontend_image_tag}"
      image_repository_type = "ECR"
      image_configuration {
        port = "3000"
        runtime_environment_variables = {
          PORT        = "3000"
          NODE_ENV    = "production"
          BACKEND_URL = "https://${aws_apprunner_service.backend.service_url}"
        }
      }
    }
    auto_deployments_enabled = false
  }

  instance_configuration {
    cpu    = "512"
    memory = "1024"
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }
}
