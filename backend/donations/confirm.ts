import { api, APIError } from "encore.dev/api";
import db from "../db";

interface ConfirmDonationRequest {
  donationId: number;
  success: boolean;
}

interface ConfirmDonationResponse {
  success: boolean;
}

// Confirms a donation payment status.
export const confirm = api<ConfirmDonationRequest, ConfirmDonationResponse>(
  { expose: true, method: "POST", path: "/donations/:donationId/confirm" },
  async (req) => {
    const status = req.success ? "completed" : "failed";
    const result = await db.queryRow<{ id: number }>`
      UPDATE donations
      SET status = ${status}
      WHERE id = ${req.donationId}
      RETURNING id
    `;

    if (!result) {
      throw APIError.notFound("donation not found");
    }

    return { success: true };
  }
);
