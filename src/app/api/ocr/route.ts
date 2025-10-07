import { NextRequest, NextResponse } from "next/server";

export interface OCRResponse {
  backend: string;
  version: string;
  results: {
    [filename: string]: {
      md_content: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or image file." },
        { status: 400 }
      );
    }

    // Create FormData for the external OCR API
    const ocrFormData = new FormData();

    // Add the file
    ocrFormData.append("files", file, file.name);

    // Add all the required parameters as per the API specification
    ocrFormData.append("return_middle_json", "false");
    ocrFormData.append("return_model_output", "false");
    ocrFormData.append("return_md", "true");
    ocrFormData.append("return_images", "true");
    ocrFormData.append("end_page_id", "99999");
    ocrFormData.append("parse_method", "auto");
    ocrFormData.append("start_page_id", "0");
    ocrFormData.append("lang_list", "en");
    ocrFormData.append("output_dir", "./output");
    ocrFormData.append("server_url", "string");
    ocrFormData.append("return_content_list", "false");
    ocrFormData.append("backend", "vlm-vllm-async-engine");
    ocrFormData.append("table_enable", "true");
    ocrFormData.append("response_format_zip", "false");
    ocrFormData.append("formula_enable", "true");

    // Call the external OCR API
    const ocrResponse = await fetch(
      "https://ocr_backend.futurixai.com/file_parse",
      {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: ocrFormData,
      }
    );

    if (!ocrResponse.ok) {
      console.error(
        "OCR API Error:",
        ocrResponse.status,
        ocrResponse.statusText
      );
      return NextResponse.json(
        {
          error: `OCR processing failed: ${ocrResponse.status} ${ocrResponse.statusText}`,
        },
        { status: 500 }
      );
    }

    const ocrData: OCRResponse = await ocrResponse.json();

    // Return the OCR result
    return NextResponse.json({
      success: true,
      data: ocrData,
      filename: file.name,
      fileSize: file.size,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error occurred while processing the file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
