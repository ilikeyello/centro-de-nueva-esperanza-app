import { api, APIError } from "encore.dev/api";
import { mediaStorageRemover } from "./storage";

interface DeleteRequest {
  name: string;
  passcode: string;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

export const deleteMedia = api<DeleteRequest, DeleteResponse>(
  { expose: true, method: "POST", path: "/media/delete" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    try {
      await mediaStorageRemover.remove(req.name);
      return {
        success: true,
        message: `Successfully deleted ${req.name}`,
      };
    } catch (error) {
      console.error("Delete error:", error);
      throw APIError.internal("failed to delete file");
    }
  }
);
