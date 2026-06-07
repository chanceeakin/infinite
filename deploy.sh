#!/usr/bin/env bash
# deploy.sh — run from the project root
# Usage: ./deploy.sh
# First run takes ~10 minutes (CloudFront propagation). Subsequent runs are faster.
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG=$(git rev-parse --short HEAD)

echo "==> Deploying hotel-discovery (tag: ${IMAGE_TAG})"
echo "    Account: ${AWS_ACCOUNT_ID} | Region: ${AWS_REGION}"

# ── Phase 1: Bootstrap ECR repos + IAM ───────────────────────────────────────
# These resources have no dependency on images, so we create them first.
echo ""
echo "==> [1/5] Bootstrapping ECR repositories and IAM role..."
terraform -chdir=infra init -upgrade -input=false
terraform -chdir=infra apply \
  -target=aws_ecr_repository.backend \
  -target=aws_ecr_repository.frontend \
  -target=aws_ecr_lifecycle_policy.backend \
  -target=aws_ecr_lifecycle_policy.frontend \
  -target=aws_iam_role.apprunner_ecr_access \
  -target=aws_iam_role_policy_attachment.apprunner_ecr \
  -var="backend_image_tag=${IMAGE_TAG}" \
  -var="frontend_image_tag=${IMAGE_TAG}" \
  -auto-approve -input=false

# ── Phase 2: Authenticate Docker to ECR ──────────────────────────────────────
echo ""
echo "==> [2/5] Authenticating Docker to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# ── Phase 3: Build + push backend ────────────────────────────────────────────
echo ""
echo "==> [3/5] Building and pushing backend image..."
docker build \
  --platform linux/amd64 \
  -f Dockerfile.backend \
  -t "${ECR_REGISTRY}/hotel-discovery-backend:${IMAGE_TAG}" \
  -t "${ECR_REGISTRY}/hotel-discovery-backend:latest" \
  .
docker push "${ECR_REGISTRY}/hotel-discovery-backend:${IMAGE_TAG}"
docker push "${ECR_REGISTRY}/hotel-discovery-backend:latest"

# ── Phase 4: Build + push frontend ───────────────────────────────────────────
echo ""
echo "==> [4/5] Building and pushing frontend image..."
docker build \
  --platform linux/amd64 \
  -f Dockerfile.frontend \
  -t "${ECR_REGISTRY}/hotel-discovery-frontend:${IMAGE_TAG}" \
  -t "${ECR_REGISTRY}/hotel-discovery-frontend:latest" \
  .
docker push "${ECR_REGISTRY}/hotel-discovery-frontend:${IMAGE_TAG}"
docker push "${ECR_REGISTRY}/hotel-discovery-frontend:latest"

# ── Phase 5: Full Terraform apply ─────────────────────────────────────────────
echo ""
echo "==> [5/5] Applying full infrastructure (App Runner + CloudFront)..."
echo "    CloudFront distribution creation takes ~8 minutes..."
terraform -chdir=infra apply \
  -var="backend_image_tag=${IMAGE_TAG}" \
  -var="frontend_image_tag=${IMAGE_TAG}" \
  -auto-approve -input=false

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "==> Deployment complete!"
echo ""
terraform -chdir=infra output cloudfront_url
echo ""
echo "    Note: If this was your first deploy, wait 2-3 more minutes for"
echo "    CloudFront to finish propagating before the URL is reachable."
