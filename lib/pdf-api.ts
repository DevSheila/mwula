const API_BASE_URL = 'http://localhost:8000';

export async function extractPdfContent(file: File, password?: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (password) {
      formData.append('password', password);
    }

    const response = await fetch(`${API_BASE_URL}/extract-pdf/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to extract PDF content');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    throw error;
  }
} 