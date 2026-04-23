import aws_cdk as cdk
from stacks.cognito_stack import CognitoStack
from stacks.dynamo_stack import DynamoStack
from stacks.api_stack import ApiStack
from stacks.frontend_stack import FrontendStack

app = cdk.App()

env = cdk.Environment(region="ap-south-1")

cognito = CognitoStack(app, "ExtejCognitoStack", env=env)
dynamo = DynamoStack(app, "ExtejDynamoStack", env=env)
api = ApiStack(app, "ExtejApiStack",
    user_pool=cognito.user_pool,
    table=dynamo.table,
    env=env,
)
frontend = FrontendStack(app, "ExtejFrontendStack", env=env)

app.synth()
