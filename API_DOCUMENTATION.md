# Ledger OCR API Documentation

## Base URL

```
https://ledger.futurixai.com/api/ocr
```

## Authentication

Currently, no authentication is required for this API.

## Endpoints

### POST /api/ocr

Processes a document file and extracts text, tables, and images using advanced OCR technology.

#### Request

**Method:** `POST`
**Content-Type:** `multipart/form-data`

#### Parameters

| Parameter | Type | Required | Description                  |
| --------- | ---- | -------- | ---------------------------- |
| `file`    | File | Yes      | The document file to process |

#### Supported File Types

- **PDFs:** `application/pdf`
- **Images:**
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`
  - `image/bmp`
  - `image/tiff`

#### File Size Limits

- Maximum file size: 4.5 MB
- Files larger than 4.5 MB will be rejected with a 400 error

## Response Format

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "backend": "vlm-vllm-async-engine",
    "version": "2.5.4",
    "results": {
      "filename.pdf": {
        "md_content": "# Document Title\n\n![](images/hash1.jpg)\n\nContent here...",
        "images": {
          "hash1.jpg": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
          "hash2.jpg": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
        }
      }
    }
  },
  "filename": "document.pdf",
  "fileSize": 1024000,
  "processedAt": "2024-01-15T10:30:00.000Z"
}
```

### Response Fields

| Field                               | Type    | Description                                  |
| ----------------------------------- | ------- | -------------------------------------------- |
| `success`                           | boolean | Indicates if the request was successful      |
| `data`                              | object  | Contains the OCR processing results          |
| `data.backend`                      | string  | OCR engine used for processing               |
| `data.version`                      | string  | Version of the OCR engine                    |
| `data.results`                      | object  | Processing results keyed by filename         |
| `data.results[filename].md_content` | string  | Extracted content in markdown format         |
| `data.results[filename].images`     | object  | Base64 encoded images referenced in markdown |
| `filename`                          | string  | Original filename of processed document      |
| `fileSize`                          | number  | Size of the uploaded file in bytes           |
| `processedAt`                       | string  | ISO timestamp of when processing completed   |

### Error Response

**Status Codes:** `400`, `500`

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": "Additional technical details (optional)"
}
```

#### Common Error Codes

| Status | Error                 | Description                                 |
| ------ | --------------------- | ------------------------------------------- |
| 400    | No file provided      | Request missing the required file parameter |
| 400    | Invalid file type     | Uploaded file type is not supported         |
| 400    | File too large        | File exceeds the 4.5 MB size limit          |
| 500    | OCR processing failed | External OCR service encountered an error   |
| 500    | Internal server error | Unexpected server error during processing   |

## Usage Examples

### JavaScript/TypeScript

```javascript
async function processDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/ocr", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(
        "Markdown content:",
        result.data.results[result.filename].md_content
      );
      console.log(
        "Available images:",
        Object.keys(result.data.results[result.filename].images || {})
      );
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("OCR processing failed:", error);
    throw error;
  }
}

// Usage with validation
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file size (4.5 MB = 4.5 * 1024 * 1024 bytes)
    const maxSize = 4.5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 4.5 MB.");
      return;
    }

    try {
      const result = await processDocument(file);
      // Handle successful result
    } catch (error) {
      // Handle error
    }
  }
});
```

### cURL

```bash
curl -X POST \
  https://ledger.futurixai.com/api/ocr \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@/path/to/your/document.pdf'
```

### Python

```python
import requests

def process_document(file_path):
    url = 'https://ledger.futurixai.com/api/ocr'

    with open(file_path, 'rb') as file:
        files = {'file': file}
        response = requests.post(url, files=files)

    if response.status_code == 200:
        result = response.json()
        if result['success']:
            return result['data']
        else:
            raise Exception(f"OCR failed: {result['error']}")
    else:
        raise Exception(f"HTTP error: {response.status_code}")

# Usage
try:
    result = process_document('document.pdf')
    filename = list(result['results'].keys())[0]
    markdown_content = result['results'][filename]['md_content']
    images = result['results'][filename].get('images', {})
    print(f"Processed {filename}")
    print(f"Content length: {len(markdown_content)}")
    print(f"Number of images: {len(images)}")
except Exception as e:
    print(f"Error: {e}")
```

## Image Handling

The API returns images in two ways:

1. **Image References in Markdown**: Images are referenced in the markdown content using the format `![](images/hash.jpg)`
2. **Base64 Image Data**: The actual image data is provided in the `images` object with the hash as the key

### Rendering Images

To properly render the markdown with images:

```javascript
function renderMarkdownWithImages(mdContent, images) {
  let processedContent = mdContent;

  Object.entries(images).forEach(([imageName, base64Data]) => {
    const imageRef = `images/${imageName}`;
    processedContent = processedContent.replace(
      new RegExp(`!\\[([^\\]]*)\\]\\(${imageRef}\\)`, "g"),
      `![\\$1](${base64Data})`
    );
  });

  return processedContent;
}
```

## Processing Options

The API automatically configures optimal settings for document processing:

- **Language Detection**: Automatic (primarily English)
- **Table Recognition**: Enabled
- **Formula Recognition**: Enabled
- **Parse Method**: Automatic detection
- **Page Range**: All pages (0 to 99999)
- **Output Format**: Markdown with embedded images

## Rate Limits

Currently, no rate limits are enforced, but we recommend:

- Maximum 10 concurrent requests per client
- Allow 30+ seconds for complex document processing
- Implement retry logic with exponential backoff

## Best Practices

### File Optimization

1. **PDF Quality**: Use high-resolution PDFs for better OCR accuracy
2. **Image Format**: PNG and JPEG provide best results
3. **File Size**: Keep files under 4.5 MB limit; compress large PDFs before uploading

### Error Handling

1. **Implement Timeouts**: Set appropriate request timeouts (60+ seconds)
2. **Retry Logic**: Implement exponential backoff for temporary failures
3. **Validation**: Validate file type and ensure file size is under 4.5 MB before uploading

### Performance

1. **Async Processing**: Use async/await patterns for non-blocking operations
2. **Progress Indicators**: Show upload and processing progress to users
3. **Result Caching**: Cache results for identical documents

## Troubleshooting

### Common Issues

1. **"No file provided"**: Ensure the file parameter is included in the form data
2. **"Invalid file type"**: Check that your file type is in the supported list
3. **"File too large"**: Compress your file to under 4.5 MB before uploading
4. **Processing timeout**: Large or complex documents may take longer to process

### Debug Information

Enable debug logging in your application to track:

- File upload success
- API response times
- Error details and stack traces

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Changelog

### Version 0.1.0

- Initial API release
- Support for PDF and image files
- Markdown output with embedded images
- Automatic table and formula recognition
