import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy endpoint to bypass CORS restrictions
 * Returns the image as base64 for caching in IndexedDB
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    const imageUrl = new URL(url);

    // Only allow certain domains for security
    const allowedDomains = [
      "image.tmdb.org",
      "upload.wikimedia.org",
      "commons.wikimedia.org",
      "en.wikipedia.org",
    ];

    if (!allowedDomains.some(domain => imageUrl.hostname.includes(domain))) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FMK-Game/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    // Get image as array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to base64
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl,
      contentType,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
