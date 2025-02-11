const BASE_URL = '/api/v1'; // Adjust based on your API setup

const loadFile = async (filePath: string) => {
  try {
    const response = await fetch(`${BASE_URL}/d/${filePath}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error loading file: ${error.message}`);
  }
};

const loadFileContents = async (filePath: string) => {
    return (await loadFile(filePath)).content;
}

const saveFile = async (filePath: string, content: string) => {
  try {
    const response = await fetch(`${BASE_URL}/d/files/${filePath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: content
    });

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error saving file: ${error.message}`);
  }
};

export { loadFile, saveFile, loadFileContents };