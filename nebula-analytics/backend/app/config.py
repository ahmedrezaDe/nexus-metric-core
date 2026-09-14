from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus Metric Core"
    VERSION: str = "3.2.4"
    API_V1_STR: str = "/api/v1"
    
    # Require these to be set in .env, no sensitive defaults!
    DATABASE_URL: str = Field(validation_alias="DATABASE_URL")
    NEXUS_SERVICE_KEY: str = Field(default="dev_fallback_key_9876", validation_alias="NEXUS_SERVICE_KEY")
    
    INFERENCE_MODE: str = Field(default="local", validation_alias="INFERENCE_MODE")
    LOCAL_LLM_URL: str = Field(default="http://127.0.0.1:8080/v1/chat/completions")
    
    CLOUD_PROVIDER: str = Field(default="groq", validation_alias="CLOUD_PROVIDER")
    CLOUD_API_KEY: Optional[str] = Field(default=None, validation_alias="GROQ_API_KEY")
    CLOUD_MODEL_NAME: str = Field(default="llama-3.3-70b-versatile")
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()