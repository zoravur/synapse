import pytest
from ..settings import Settings, get_settings
# from ..main import app  # Import your FastAPI app

from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends
from pathlib import Path
from .vault_router import vault_router, vault_exception_handler
from ..repositories.vault import VaultError

@pytest.fixture
def temp_vault_dir(tmp_path):
    """Fixture to create a temporary vault directory"""
    return tmp_path
    # return Path('../test_vault').resolve()

@pytest.fixture
def override_settings(temp_vault_dir):
    """Fixture to override the settings dependency"""
    # print(f"{temp_vault_dir=}")
    test_settings = Settings(vault_dir=temp_vault_dir)

    def get_test_settings():
        return test_settings

    return get_test_settings

@pytest.fixture
def test_app(override_settings):
    """Create a temporary FastAPI app with only vault_router"""
    app = FastAPI()
    app.include_router(vault_router, prefix="/d")
    app.add_exception_handler(VaultError, vault_exception_handler)
    app.dependency_overrides[get_settings] = override_settings
    # app.dependency_overrides
    return app

@pytest.fixture
def client(test_app):
    """Fixture to provide a test client"""
    return TestClient(test_app)

def test_list_root_directory(client):
    """Test listing the root directory using isolated APIRouter"""
    response = client.get("/d")
    assert response.status_code == 200
    assert response.json()["type"] == "directory"
    assert "children" in response.json()

def test_create_file(client):
    """Test creating a new file"""
    response = client.post("/d/files/test.md", content="Hello, world!", headers={"Content-Type":"text/plain"})
    assert response.status_code == 200
    assert response.json()["path"] == "test.md"
    assert response.json()["content"] == "Hello, world!"

def test_create_existing_file_fails(client):
    """Test that creating an existing file raises an error"""
    client.post("/d/files/test.md", content="Hello!", headers={"Content-Type":"text/plain"})
    response = client.post("/d/files/test.md", content="New Content", headers={"Content-Type":"text/plain"})
    assert response.status_code == 409
    assert response.json()["detail"] == "File test.md already exists"

def test_create_directory(client):
    """Test creating a new directory"""
    response = client.post("/d/directories/new_dir")
    assert response.status_code == 200
    assert response.json()["path"] == "new_dir"
    assert response.json()["type"] == "directory"

def test_create_existing_directory_fails(client):
    """Test that creating an existing directory raises an error"""
    client.post("/d/directories/new_dir")
    response = client.post("/d/directories/new_dir")
    assert response.status_code == 409
    assert response.json()["detail"] == "Directory new_dir already exists"

def test_get_document(client):
    """Test retrieving a file"""
    client.post("/d/files/test.md", content="Hello, world!", headers={"Content-Type":"text/plain"})
    response = client.get("/d/test.md")
    assert response.status_code == 200
    assert response.json()["content"] == "Hello, world!"

def test_get_nonexistent_file(client):
    """Test retrieving a non-existent file returns 404"""
    response = client.get("/d/missing.md")
    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"

def test_update_file(client):
    """Test updating a file"""
    client.post("/d/files/test.md", content="Hello!", headers={"Content-Type":"text/plain"})
    response = client.put("/d/files/test.md", content="Updated content", headers={"Content-Type":"text/plain"})
    assert response.status_code == 200
    assert response.json()["content"] == "Updated content"

def test_update_nonexistent_file(client):
    """Test updating a non-existent file returns 404"""
    response = client.put("/d/files/missing.md", content="New content", headers={"Content-Type":"text/plain"})
    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"

def test_list_directory_with_max_depth(client):
    """Test listing directory with max depth"""
    client.post("/d/directories/parent")
    client.post("/d/files/parent/file.md", content="Hello!", headers={"Content-Type":"text/plain"})
    
    response = client.get("/d/parent?max_depth=0")
    assert response.status_code == 200
    assert len(response.json()["children"]) == 0  # No recursion

    response = client.get("/d/parent?max_depth=1")
    assert response.status_code == 200
    assert len(response.json()["children"]) == 1  # Includes "file.md"

def test_invalid_path_raises_error(client):
    """Test escaping vault directory raises 403"""
    response = client.get("/d/%2E%2E/outside.md")
    print(response.url)
    assert response.status_code == 403
    assert response.json()["detail"] == "Invalid path"

def test_unsupported_file_type_raises_error(client):
    """Test that unsupported file types return 400"""
    response = client.post("/d/files/test.txt", content="Unsupported content", headers={"Content-Type":"text/plain"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type"

if __name__ == "__main__":
    pytest.main()