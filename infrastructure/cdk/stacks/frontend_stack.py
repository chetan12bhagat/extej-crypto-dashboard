import aws_cdk as cdk
from aws_cdk import (
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3_deployment as s3deploy,
)
from constructs import Construct


class FrontendStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # S3 Bucket
        bucket = s3.Bucket(
            self, "ExtejFrontendBucket",
            bucket_name=f"extej-frontend-{self.account}",
            removal_policy=cdk.RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
        )

        # CloudFront OAI
        oai = cloudfront.OriginAccessIdentity(self, "OAI")
        bucket.grant_read(oai)

        # CloudFront Distribution
        distribution = cloudfront.CloudFrontWebDistribution(
            self, "ExtejDistribution",
            origin_configs=[
                cloudfront.SourceConfiguration(
                    s3_origin_source=cloudfront.S3OriginConfig(
                        s3_bucket_source=bucket,
                        origin_access_identity=oai,
                    ),
                    behaviors=[cloudfront.Behavior(is_default_behavior=True)],
                )
            ],
            error_configurations=[
                cloudfront.CfnDistribution.CustomErrorResponseProperty(
                    error_code=404,
                    response_code=200,
                    response_page_path="/index.html",
                )
            ],
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,
        )

        # Deploy frontend assets
        s3deploy.BucketDeployment(
            self, "DeployFrontend",
            sources=[s3deploy.Source.asset("../../frontend/dist")],
            destination_bucket=bucket,
            distribution=distribution,
        )

        cdk.CfnOutput(self, "CloudFrontUrl", value=f"https://{distribution.distribution_domain_name}")
        cdk.CfnOutput(self, "BucketName", value=bucket.bucket_name)
