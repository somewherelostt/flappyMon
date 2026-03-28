import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;

const UPLOAD_NODES = [
  "https://node.lighthouse.storage/api/v0/add",
  "https://node-1.lighthouse.storage/api/v0/add"
];

async function uploadToLighthouse(file: File): Promise<{ Hash: string } | null> {
  if (!LIGHTHOUSE_API_KEY) return null;
  
  for (const nodeUrl of UPLOAD_NODES) {
    try {
      console.log(`[Storage] Trying Lighthouse: ${nodeUrl}`);
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(nodeUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${LIGHTHOUSE_API_KEY}` },
        body: formData,
        signal: AbortSignal.timeout(30000)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`[Storage] ✅ Lighthouse success: ${result.Hash}`);
        return result;
      }
    } catch (err) {
      console.warn(`[Storage] ❌ ${nodeUrl} failed:`, err);
    }
  }
  return null;
}

async function uploadLocally(file: File): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "ads");
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  
  console.log(`[Storage] ✅ Local upload: /uploads/ads/${filename}`);
  return `/uploads/ads/${filename}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`[Storage] Received file: ${file.name} (${file.size} bytes)`);

    // Try Lighthouse first
    const lhResult = await uploadToLighthouse(file);
    
    if (lhResult) {
      return NextResponse.json({ Hash: lhResult.Hash });
    }

    // Fallback to local storage
    console.log("[Storage] Falling back to local storage...");
    const localPath = await uploadLocally(file);
    
    return NextResponse.json({ 
      Hash: localPath,
      isLocal: true
    });

  } catch (error) {
    console.error("[Storage] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}