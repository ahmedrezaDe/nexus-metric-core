from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.config import settings

# In production, this would be hashed in the database. 
# For now, we load it from the secure .env file.
API_KEY_HEADER = APIKeyHeader(name="X-Nexus-API-Key", auto_error=True)

async def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    # Assuming we add NEXUS_SERVICE_KEY to our .env
    expected_key = getattr(settings, "NEXUS_SERVICE_KEY", "dev_fallback_key_9876")
    
    if api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Invalid Ingestion API Key",
        )
    return api_key