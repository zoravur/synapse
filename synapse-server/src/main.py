import os
from datetime import datetime
from typing import Union, Dict, Optional
from pathlib import Path

from fastapi import FastAPI, APIRouter, HTTPException, Body, Depends
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.staticfiles import StaticFiles

from .settings import get_settings

from .api.vault_router import vault_router, VaultError, vault_exception_handler

app = FastAPI(docs_url=None)

app.mount("/static", StaticFiles(directory="public"), name="static")
app.include_router(vault_router, prefix="/api/v1/d", dependencies=[Depends(get_settings)])
app.add_exception_handler(VaultError, vault_exception_handler)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Override Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="My API Docs",
        swagger_favicon_url="/static/favicon-96x96.png",  # Custom favicon URL
    )