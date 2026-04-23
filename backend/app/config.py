from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    aws_region: str = "ap-south-1"
    cognito_user_pool_id: str = "ap-south-1_PLACEHOLDER"
    cognito_client_id: str = "PLACEHOLDER"
    dynamo_table_name: str = "extej-users"
    cognito_jwks_url: str = ""
    allowed_origins: str = "http://localhost:5173,https://yourdomain.com"

    @property
    def jwks_url(self) -> str:
        if self.cognito_jwks_url:
            return self.cognito_jwks_url
        return (
            f"https://cognito-idp.{self.aws_region}.amazonaws.com/"
            f"{self.cognito_user_pool_id}/.well-known/jwks.json"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
