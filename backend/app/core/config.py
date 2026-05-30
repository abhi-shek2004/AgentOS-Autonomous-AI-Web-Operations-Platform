import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgentOS"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # DB Connections
    DATABASE_URL: str = Field(
        default="sqlite:///./agentos.db",
        env="DATABASE_URL"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )
    
    # Security
    SECRET_KEY: str = "super-secret-jwt-signing-key-agentos-2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SECRET_VAULT_KEY: str = "super-secret-vault-encryption-key-32bytes!"  # AES key
    
    # LLM Settings
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    NVIDIA_API_KEY: str = Field(default="", env="NVIDIA_API_KEY")
    DEFAULT_MODEL: str = "gpt-4o"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
