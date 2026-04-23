import aws_cdk as cdk
from aws_cdk import (
    aws_cognito as cognito,
    aws_secretsmanager as secretsmanager,
)
from constructs import Construct


class CognitoStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # User Pool
        self.user_pool = cognito.UserPool(
            self, "ExtejUserPool",
            user_pool_name="extej-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
                fullname=cognito.StandardAttribute(required=True, mutable=True),
            ),
            custom_attributes={
                "picture": cognito.StringAttribute(mutable=True),
            },
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_uppercase=True,
                require_lowercase=True,
                require_digits=True,
                require_symbols=True,
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            mfa=cognito.Mfa.OPTIONAL,
            mfa_second_factor=cognito.MfaSecondFactor(otp=True, sms=False),
            removal_policy=cdk.RemovalPolicy.RETAIN,
        )

        # Google IdP — secret stored in Secrets Manager
        google_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "GoogleOAuthSecret", "extej/google-oauth"
        )

        google_idp = cognito.UserPoolIdentityProviderGoogle(
            self, "GoogleIdP",
            user_pool=self.user_pool,
            client_id=google_secret.secret_value_from_json("client_id").unsafe_unwrap(),
            client_secret_value=google_secret.secret_value_from_json("client_secret"),
            scopes=["email", "profile", "openid"],
            attribute_mapping=cognito.AttributeMapping(
                email=cognito.ProviderAttribute.GOOGLE_EMAIL,
                fullname=cognito.ProviderAttribute.GOOGLE_NAME,
                profile_picture=cognito.ProviderAttribute.GOOGLE_PICTURE,
            ),
        )

        # App Client
        self.client = self.user_pool.add_client(
            "ExtejWebClient",
            user_pool_client_name="extej-web",
            auth_flows=cognito.AuthFlow(
                user_srp=True,
                user_password=False,
            ),
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(authorization_code_grant=True),
                scopes=[
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                    cognito.OAuthScope.COGNITO_ADMIN,
                ],
                callback_urls=[
                    "http://localhost:5173/auth/callback",
                    "https://yourdomain.com/auth/callback",
                ],
                logout_urls=[
                    "http://localhost:5173/login",
                    "https://yourdomain.com/login",
                ],
            ),
            supported_identity_providers=[
                cognito.UserPoolClientIdentityProvider.COGNITO,
                cognito.UserPoolClientIdentityProvider.GOOGLE,
            ],
            access_token_validity=cdk.Duration.hours(1),
            id_token_validity=cdk.Duration.hours(1),
            refresh_token_validity=cdk.Duration.days(30),
        )

        # Domain
        self.user_pool.add_domain(
            "ExtejDomain",
            cognito_domain=cognito.CognitoDomainOptions(domain_prefix="extej"),
        )

        # Outputs
        cdk.CfnOutput(self, "UserPoolId", value=self.user_pool.user_pool_id)
        cdk.CfnOutput(self, "ClientId", value=self.client.user_pool_client_id)
