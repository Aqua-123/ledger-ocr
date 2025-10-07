export interface OCRResponse {
  backend: string;
  version: string;
  results: {
    [filename: string]: {
      md_content: string;
    };
  };
}

export interface APIResponse {
  success: boolean;
  data: OCRResponse;
  filename: string;
  fileSize: number;
  processedAt: string;
  error?: string;
  details?: string;
}

export async function processFile(file: File): Promise<OCRResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status} ${response.statusText}`);
    }

    const apiResponse: APIResponse = await response.json();
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'OCR processing failed');
    }

    return apiResponse.data;
  } catch (error) {
    console.error('Error processing file with OCR:', error);
    throw error;
  }
}

// Direct API endpoint for external usage
export async function processFileAPI(file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    const data: APIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing file with OCR API:', error);
    throw error;
  }
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/tiff'
  ];
  
  return allowedTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
