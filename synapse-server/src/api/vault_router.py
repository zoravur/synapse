from fastapi import FastAPI, APIRouter, HTTPException, Body, Depends
from fastapi.responses import FileResponse, HTMLResponse
from typing import Union, Dict, Optional
from pathlib import Path

from ..repositories.vault import VaultError, PathNotFoundError, InvalidPathError, UnsupportedFileTypeError, FileExistsError, VaultManager
from ..settings import Settings, get_settings


vault_router = APIRouter()
# First define all exception handlers
def handle_vault_error(func):
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except PathNotFoundError:
            raise HTTPException(status_code=404, detail="File not found")
        except UnsupportedFileTypeError:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        except InvalidPathError:
            raise HTTPException(status_code=403, detail="Invalid path")
        except FileExistsError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except VaultError as e:
            raise HTTPException(status_code=400, detail=str(e))
    return wrapper

# Then our routes become much cleaner
@handle_vault_error
@vault_router.get("")
def get_root(
    max_depth: Optional[int] = -1,
    settings: Settings = Depends(get_settings)
):
    vault = VaultManager(settings.vault_dir)
    return vault.list_directory("", max_depth=max_depth)

@handle_vault_error
@vault_router.get("/{path:path}")
def get_path(
    path: str,
    max_depth: Optional[int] = -1,
    settings: Settings = Depends(get_settings)
):
    vault = VaultManager(settings.vault_dir)
    try:
        return vault.get_document(path)
    except PathNotFoundError:
        return vault.list_directory(path, max_depth=max_depth)

@handle_vault_error
@vault_router.post("/files/{file_path:path}")
def create_file(
    file_path: str,
    content: str = Body(""),
    settings: Settings = Depends(get_settings)
):
    vault = VaultManager(settings.vault_dir)
    return vault.create_file(file_path, content)

@handle_vault_error
@vault_router.post("/directories/{dir_path:path}")
def create_directory(
    dir_path: str,
    settings: Settings = Depends(get_settings)
):
    vault = VaultManager(settings.vault_dir)
    return vault.create_directory(dir_path)

@handle_vault_error
@vault_router.put("/files/{file_path:path}")
def update_file(
    file_path: str,
    content: str = Body(""),
    settings: Settings = Depends(get_settings)
):
    vault = VaultManager(settings.vault_dir)
    return vault.update_file(file_path, content)