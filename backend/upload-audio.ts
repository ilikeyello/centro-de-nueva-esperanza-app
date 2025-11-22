import fs from "node:fs";
import path from "node:path";

const BACKEND_BASE = "https://prod-cne-sh82.encr.app";
const PASSCODE = "78598";

// Local folder where your audio files currently live
const LOCAL_AUDIO_DIR = path.join(
  __dirname,
  "..",
  "frontend",
  "public",
  "audio"
);

async function uploadFile(fileName: string) {
  const filePath = path.join(LOCAL_AUDIO_DIR, fileName);
  const fileBuffer = fs.readFileSync(filePath);

  // 1) Ask backend for a signed upload URL
  const res = await fetch(`${BACKEND_BASE}/media/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName,
      contentType: "audio/mpeg",
      passcode: PASSCODE,
    }),
  });

  if (!res.ok) {
    console.error("Failed to get upload URL for", fileName, res.status);
    return;
  }

  const data = (await res.json()) as { uploadUrl: string; publicUrl: string };
  console.log("Uploading", fileName, "to", data.uploadUrl);

  // 2) Upload the file to the signed URL
  const putRes = await fetch(data.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "audio/mpeg",
    },
    body: fileBuffer,
  });

  if (!putRes.ok) {
    console.error("Failed to upload", fileName, putRes.status);
    return;
  }

  console.log("Uploaded", fileName, "Public URL:", data.publicUrl);
}

async function main() {
  const files = fs
    .readdirSync(LOCAL_AUDIO_DIR)
    .filter((f) => f.toLowerCase().endsWith(".mp3"));

  if (files.length === 0) {
    console.log("No .mp3 files found in", LOCAL_AUDIO_DIR);
    return;
  }

  for (const file of files) {
    await uploadFile(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
