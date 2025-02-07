from pydantic_settings import BaseSettings
from pathlib import Path
from functools import lru_cache

class Settings(BaseSettings):
    vault_dir: Path

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()

# settings = Settings() # according to Claude, we should prefer a singleton instance
# Now settings.vault_dir will contain the Path object created from os.environ['VAULT_DIR']