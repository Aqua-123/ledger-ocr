'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileUpload } from '@/components/file-upload';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { processFile, OCRResponse } from '@/lib/ocr-api';
import { AlertTriangle, Code } from 'lucide-react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setOcrResult(null);
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setOcrResult(null);

    try {
      const result = await processFile(selectedFile);
      setOcrResult(result);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setOcrResult(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header with API Demo Link */}
          <div className="flex justify-between items-center">
            <div></div>
            <Link href="/api-demo">
              <Button variant="outline" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>API Demo</span>
              </Button>
            </Link>
          </div>

          {/* File Upload Section */}
          <FileUpload 
            onFileSelect={handleFileSelect} 
            isProcessing={isProcessing}
          />

          {/* Process Button */}
          {selectedFile && !isProcessing && !ocrResult && (
            <div className="text-center">
              <Button 
                onClick={handleProcessFile}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Process File
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isProcessing && (
            <LoadingSpinner message="Processing your document with OCR..." />
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Processing Error
                </h3>
              </div>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
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
            </div>
          )}

          {/* Results Section */}
          {ocrResult && (
            <div className="space-y-4">
              <MarkdownRenderer data={ocrResult} />
              <div className="text-center">
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  size="lg"
                >
                  Process Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
