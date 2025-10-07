"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { OCRResponse } from "@/lib/ocr-api";

interface MarkdownRendererProps {
  data: OCRResponse;
}

export function MarkdownRenderer({ data }: MarkdownRendererProps) {
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert("Content copied to clipboard!");
    });
  };

  const downloadAsMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, "")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          OCR Results
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Backend: {data.backend} | Version: {data.version}
        </p>
      </div>

      {Object.entries(data.results).map(([filename, result]) => {
        const mdContent = result.md_content;

        return (
          <Card key={filename} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {filename}
              </h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(mdContent)}
                  className="flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadAsMarkdown(mdContent, filename)}
                  className="flex items-center space-x-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 overflow-hidden">
              <div className="prose prose-sm max-w-none dark:prose-invert break-anywhere">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto w-full">
                        <table
                          className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 table-auto"
                          {...props}
                        >
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children, ...props }) => (
                      <th
                        className="border border-gray-300 dark:border-gray-600 px-2 py-2 bg-gray-100 dark:bg-gray-700 font-medium text-left text-xs break-words max-w-xs"
                        {...props}
                      >
                        <div className="break-anywhere">{children}</div>
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td
                        className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs break-words max-w-xs"
                        {...props}
                      >
                        <div className="break-anywhere">{children}</div>
                      </td>
                    ),
                    tr: ({ children, ...props }) => (
                      <tr
                        className="even:bg-gray-50 dark:even:bg-gray-800/50"
                        {...props}
                      >
                        {children}
                      </tr>
                    ),
                    p: ({ children, ...props }) => (
                      <p className="break-anywhere" {...props}>
                        {children}
                      </p>
                    ),
                    pre: ({ children, ...props }) => (
                      <pre
                        className="overflow-x-auto whitespace-pre-wrap break-anywhere"
                        {...props}
                      >
                        {children}
                      </pre>
                    ),
                    code: ({ children, ...props }) => (
                      <code className="break-anywhere" {...props}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {mdContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Raw markdown content preview */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                View Raw Markdown
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded border text-sm font-mono overflow-hidden">
                <pre className="whitespace-pre-wrap break-anywhere">
                  {mdContent}
                </pre>
              </div>
            </details>
          </Card>
        );
      })}
    </div>
  );
}
