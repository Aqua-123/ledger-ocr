'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { validateFileType, formatFileSize } from '@/lib/ocr-api';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, isProcessing = false }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && validateFileType(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      alert('Please select a valid PDF or image file (JPEG, PNG, WebP, GIF, BMP, TIFF)');
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.bmp', '.tiff']
    },
    multiple: false,
    disabled: isProcessing
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            OCR Document Processor
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload a PDF or image file to extract and render its contents
          </p>
        </div>

        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              or click to select a file
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Supports PDF, JPEG, PNG, WebP, GIF, BMP, TIFF
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
