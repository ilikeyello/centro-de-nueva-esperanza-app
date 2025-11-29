import { api, APIError } from "encore.dev/api";
import { mediaStorage } from "./storage";

interface UploadUrlRequest {
  fileName: string;
  contentType: string;
  passcode: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

// Generates a signed URL for uploading media files.
export const uploadUrl = api<UploadUrlRequest, UploadUrlResponse>(
  { expose: true, method: "POST", path: "/media/upload-url" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${req.fileName}`;

    const { url } = await mediaStorage.signedUploadUrl(fileName, {
      ttl: 3600,
    });

    const publicUrl = mediaStorage.publicUrl(fileName);

    return {
      uploadUrl: url,
      publicUrl,
    };
  }
);
