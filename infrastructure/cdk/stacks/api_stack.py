import aws_cdk as cdk
from aws_cdk import (
    aws_lambda as lambda_,
    aws_apigateway as apigw,
    aws_iam as iam,
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
)
from constructs import Construct


class ApiStack(cdk.Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        user_pool: cognito.UserPool,
        table: dynamodb.Table,
        **kwargs,
    ):
        super().__init__(scope, construct_id, **kwargs)

        # Lambda execution role
        role = iam.Role(
            self, "LambdaRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AWSLambdaBasicExecutionRole"),
            ],
        )
        table.grant_read_write_data(role)

        # Lambda function
        fn = lambda_.DockerImageFunction(
            self, "ExtejApiLambda",
            function_name="extej-api",
            code=lambda_.DockerImageCode.from_image_asset("../../backend"),
            memory_size=512,
            timeout=cdk.Duration.seconds(30),
            role=role,
            environment={
                "COGNITO_USER_POOL_ID": user_pool.user_pool_id,
                "DYNAMO_TABLE_NAME": table.table_name,
                "AWS_REGION_NAME": self.region,
            },
        )

        # API Gateway
        api = apigw.LambdaRestApi(
            self, "ExtejApiGateway",
            handler=fn,
            rest_api_name="extej-api",
            deploy_options=apigw.StageOptions(stage_name="prod"),
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "Authorization"],
            ),
        )

        cdk.CfnOutput(self, "ApiUrl", value=api.url)
