# OCR API Usage Guide

This application provides a REST API endpoint for processing documents using OCR (Optical Character Recognition). The API accepts file uploads and returns the extracted content in markdown format.

## Endpoint

**POST** `/api/ocr`

## Request Format

The API accepts multipart/form-data with the following parameters:

- `file` (required): The file to process (PDF or image)

### Supported File Types

- **PDF**: `application/pdf`
- **Images**: JPEG, PNG, WebP, GIF, BMP, TIFF

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "backend": "vlm-vllm-async-engine",
    "version": "2.5.4",
    "results": {
      "filename": {
        "md_content": "<extracted markdown content>"
      }
    }
  },
  "filename": "uploaded_file.pdf",
  "fileSize": 1234567,
  "processedAt": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (400/500)

```json
{
  "error": "Error description",
  "details": "Additional error details (if available)"
}
```

## Usage Examples

### JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/ocr', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('OCR Result:', data.data);
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => console.error('Error:', error));
```

### cURL

```bash
curl -X POST \
  http://localhost:3000/api/ocr \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/document.pdf'
```

### Python (requests)

```python
import requests

url = 'http://localhost:3000/api/ocr'
files = {'file': open('/path/to/your/document.pdf', 'rb')}

response = requests.post(url, files=files)
result = response.json()

if result.get('success'):
    print("OCR Result:", result['data'])
else:
    print("Error:", result.get('error'))
```

### Node.js (with form-data)

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('file', fs.createReadStream('/path/to/your/document.pdf'));

fetch('http://localhost:3000/api/ocr', {
  method: 'POST',
  body: form,
  headers: form.getHeaders()
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('OCR Result:', data.data);
  } else {
    console.error('Error:', data.error);
  }
})
.catch(error => console.error('Error:', error));
```

## Error Codes

- **400 Bad Request**: Invalid file type or no file provided
- **500 Internal Server Error**: OCR processing failed or server error

## Rate Limits

Currently, there are no rate limits implemented. However, processing large files may take some time.

## File Size Limits

The API inherits Next.js default file size limits. For production use, you may want to configure custom limits in your `next.config.js`.

## CORS

The API includes basic CORS headers to allow cross-origin requests. For production use, configure appropriate CORS policies based on your requirements.
