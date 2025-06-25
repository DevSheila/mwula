const API_BASE_URL = 'http://localhost:8000';

interface PDFResponse {
  status: string;
  number_of_pages: number;
  content: string | string[];
}

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

    const data = await response.json() as PDFResponse;

    // Check if the API returned a success status
    if (data.status !== 'success') {
      throw new Error('PDF extraction failed');
    }

    // Handle content that could be either a string or an array of strings
    let contentString: string;
    if (Array.isArray(data.content)) {
      contentString = data.content.join('\n');
    } else if (typeof data.content === 'string') {
      contentString = data.content;
    } else {
      console.error('Unexpected content type:', typeof data.content);
      throw new Error('PDF content is not in the expected format');
    }

    // Remove any null characters and normalize whitespace
    const cleanContent = contentString
      .replace(/\0/g, '') // Remove null characters
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Replace single \r with \n
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple consecutive newlines with double newlines
      .trim(); // Remove leading/trailing whitespace

    if (!cleanContent) {
      throw new Error('No content extracted from PDF');
    }

    return cleanContent;
  } catch (error) {
    console.error('Error extracting PDF content:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract PDF content');
  }
} 