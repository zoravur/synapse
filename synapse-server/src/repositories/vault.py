# vault.py
from pathlib import Path
from typing import Dict, List, Optional, Union, TypedDict
from datetime import datetime

class VaultError(Exception):
    """Base exception for vault operations"""
    pass

class PathNotFoundError(VaultError):
    pass

class InvalidPathError(VaultError):
    pass

class UnsupportedFileTypeError(VaultError):
    pass

class FileExistsError(VaultError):
    pass

class FileInfo(TypedDict):
    path: str
    type: str  # "file" or "directory"
    created_at: float
    modified_at: float
    size: int
    content: Optional[str]  # Only for files

class DirectoryInfo(TypedDict):
    path: str
    type: str
    created_at: float
    modified_at: float
    children: List[Union[FileInfo, 'DirectoryInfo']]

class VaultManager:
    """Manages file operations within a vault directory."""
    
    def __init__(self, vault_dir: Path):
        """Initialize the VaultManager with a vault directory.
        
        Args:
            vault_dir: Root directory for all vault operations
        """
        self.vault_dir = vault_dir
    
    def _get_safe_path(self, relative_path: str) -> Path:
        """Ensure the path doesn't escape the vault directory.
        
        Args:
            relative_path: Path relative to vault root
            
        Returns:
            Resolved absolute path
            
        Raises:
            InvalidPathError: If path attempts to escape vault
        """
        print(f'{relative_path=}')
        safe_path = (self.vault_dir / relative_path).resolve()
        if not str(safe_path).startswith(str(self.vault_dir.resolve())):
            raise InvalidPathError(f"Path {relative_path} attempts to escape vault")
        return safe_path

    def _validate_file_type(self, path: Path) -> None:
        """Validate file has supported extension.
        
        Args:
            path: Path to validate
            
        Raises:
            UnsupportedFileTypeError: If file type not supported
        """
        if not path.suffix in [".md", ".chat"]:
            raise UnsupportedFileTypeError(f"File type {path.suffix} not supported")

    def _get_path_info(self, path: Path, include_content: bool = True, max_depth: int = -1) -> Union[FileInfo, DirectoryInfo]:
        """Get metadata about a file or directory.
        
        Args:
            path: Path to get info for
            include_content: Whether to include file contents
            max_depth: Maximum recursion depth for directories (-1 for unlimited)
            
        Returns:
            Dictionary containing path metadata
        """
        stat = path.stat()
        base_info = {
            "path": str(path.relative_to(self.vault_dir)),
            "created_at": stat.st_ctime,
            "modified_at": stat.st_mtime,
        }
        
        if path.is_file():
            return FileInfo(
                **base_info,
                type="file",
                size=stat.st_size,
                content=path.read_text() if include_content else None
            )
        elif path.is_dir() and (max_depth != 0):
            children = []
            if max_depth != 0:
                for child in path.iterdir():
                    children.append(
                        self._get_path_info(
                            child, 
                            include_content=include_content,
                            max_depth=max_depth - 1 if max_depth > 0 else -1
                        )
                    )
            return DirectoryInfo(
                **base_info,
                type="directory",
                children=sorted(children, key=lambda x: x["path"])
            )

    def get_document(self, document_path: str) -> FileInfo:
        """Get a document and its metadata from the vault.
        
        Args:
            document_path: Path to document relative to vault root
            
        Returns:
            File info including content and metadata
            
        Raises:
            PathNotFoundError: If file doesn't exist
            UnsupportedFileTypeError: If file type not supported
        """
        file_location = self._get_safe_path(document_path)
        if not file_location.exists() or not file_location.is_file():
            raise PathNotFoundError(f"File {document_path} not found")
        self._validate_file_type(file_location)
        return self._get_path_info(file_location)

    def list_directory(self, dir_path: str = "", max_depth: int = -1) -> DirectoryInfo:
        """List contents of a directory recursively.
        
        Args:
            dir_path: Directory path relative to vault root
            max_depth: Maximum recursion depth (-1 for unlimited)
            
        Returns:
            Directory tree information
            
        Raises:
            PathNotFoundError: If directory doesn't exist
        """
        dir_location = self._get_safe_path(dir_path)
        if not dir_location.exists() or not dir_location.is_dir():
            raise PathNotFoundError(f"Directory {dir_path} not found")
        return self._get_path_info(dir_location, include_content=False, max_depth=max_depth)

    # ... existing create_file, create_directory, update_file methods stay the same
    # but should return FileInfo/DirectoryInfo instead of Path

    def create_file(self, file_path: str, content: str) -> FileInfo:
        """Create a new file in the vault.
        
        Args:
            file_path: Path to new file relative to vault root
            content: File contents
            
        Returns:
            File info including content and metadata
            
        Raises:
            FileExistsError: If file already exists
            UnsupportedFileTypeError: If file type not supported
        """
        safe_path = self._get_safe_path(file_path)
        self._validate_file_type(safe_path)
        
        if safe_path.exists():
            raise FileExistsError(f"File {file_path} already exists")
            
        safe_path.parent.mkdir(parents=True, exist_ok=True)
        safe_path.write_text(content, encoding="utf-8")
        return self._get_path_info(safe_path)

    def create_directory(self, dir_path: str) -> DirectoryInfo:
        """Create a new directory in the vault.
        
        Args:
            dir_path: Path to new directory relative to vault root
            
        Returns:
            Directory info including metadata
            
        Raises:
            FileExistsError: If directory already exists
        """
        safe_path = self._get_safe_path(dir_path)
        
        if safe_path.exists():
            raise FileExistsError(f"Directory {dir_path} already exists")
            
        safe_path.mkdir(parents=True, exist_ok=True)
        return self._get_path_info(safe_path)

    def update_file(self, file_path: str, content: str) -> FileInfo:
        """Update an existing file in the vault.
        
        Args:
            file_path: Path to file relative to vault root
            content: New file contents
            
        Returns:
            Updated file info including content and metadata
            
        Raises:
            PathNotFoundError: If file doesn't exist
            UnsupportedFileTypeError: If file type not supported
        """
        safe_path = self._get_safe_path(file_path)
        
        if not safe_path.exists() or not safe_path.is_file():
            raise PathNotFoundError(f"File {file_path} not found")
            
        self._validate_file_type(safe_path)
        safe_path.write_text(content, encoding="utf-8")
        return self._get_path_info(safe_path)