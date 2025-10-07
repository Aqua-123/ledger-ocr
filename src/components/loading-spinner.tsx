'use client';

import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
}

export function LoadingSpinner({ 
  message = "Processing your file...",
  showProgress = true 
}: LoadingSpinnerProps) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            This may take a few moments...
          </p>
        </div>
        {showProgress && (
          <div className="w-full max-w-xs">
            <Progress value={undefined} className="w-full" />
          </div>
        )}
      </div>
    </Card>
  );
}
