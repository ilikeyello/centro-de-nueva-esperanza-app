import { api, APIError } from "encore.dev/api";
import { mediaStorage } from "./storage";

interface BrowserUploadRequest {
  fileName: string;
  contentType: string;
  base64Data: string;
  passcode: string;
}

interface BrowserUploadResponse {
  publicUrl: string;
  name: string;
}

export const browserUpload = api<BrowserUploadRequest, BrowserUploadResponse>(
  { expose: true, method: "POST", path: "/media/upload-browser" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    const timestamp = Date.now();
    const objectName = `${timestamp}-${req.fileName}`;

    const { url } = await mediaStorage.signedUploadUrl(objectName, {
      ttl: 3600,
    });

    const buffer = Buffer.from(req.base64Data, "base64");

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": req.contentType || "application/octet-stream",
      },
      body: buffer,
    });

    if (!putRes.ok) {
      throw APIError.internal("failed to upload to storage");
    }

    const publicUrl = mediaStorage.publicUrl(objectName);

    return {
      publicUrl,
      name: objectName,
    };
  }
);
