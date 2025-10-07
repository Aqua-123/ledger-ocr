"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { processFileAPI, APIResponse } from "@/lib/ocr-api";
import { FileUpload } from "@/components/file-upload";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function APIDemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setApiResponse(null);
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setApiResponse(null);

    try {
      const result = await processFileAPI(selectedFile);
      setApiResponse(result);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the file"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setApiResponse(null);
    setError(null);
    setIsProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                OCR API Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Test the OCR API endpoint and see the raw JSON response
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Upload and Controls */}
            <div className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={isProcessing}
              />

              {selectedFile && !isProcessing && !apiResponse && (
                <div className="text-center">
                  <Button
                    onClick={handleProcessFile}
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    Process File via API
                  </Button>
                </div>
              )}

              {isProcessing && (
                <LoadingSpinner message="Processing via API..." />
              )}

              {error && (
                <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">
                    API Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="mt-3"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </Card>
              )}

              {apiResponse && (
                <div className="text-center">
                  <Button variant="outline" onClick={handleReset} size="lg">
                    Process Another File
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column - API Response */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  API Usage Example
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      JavaScript/Fetch
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-hidden break-anywhere">
                      {`const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/ocr', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                      cURL
                    </h3>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-hidden break-anywhere">
                      {`curl -X POST \\
  ${
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000"
  }/api/ocr \\
  -F 'file=@document.pdf'`}
                    </pre>
                  </div>
                </div>
              </Card>

              {apiResponse && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      API Response
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(JSON.stringify(apiResponse, null, 2))
                      }
                    >
                      Copy JSON
                    </Button>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto overflow-x-hidden">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 break-anywhere">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </div>

                  {apiResponse.success && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Success!</strong> File "{apiResponse.filename}"
                        ({(apiResponse.fileSize / 1024).toFixed(1)} KB)
                        processed at{" "}
                        {new Date(apiResponse.processedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
