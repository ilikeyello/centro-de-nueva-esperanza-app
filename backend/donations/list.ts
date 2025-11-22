import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListDonationsRequest {
  limit: Query<number>;
}

interface Donation {
  id: number;
  userId: string;
  userName: string | null;
  amount: number;
  currency: string;
  status: string;
  donationType: string;
  message: string | null;
  createdAt: Date;
}

interface ListDonationsResponse {
  donations: Donation[];
  total: number;
}

// Lists completed donations.
export const list = api<ListDonationsRequest, ListDonationsResponse>(
  { expose: true, method: "GET", path: "/donations" },
  async (req) => {
    const limit = req.limit || 50;
    const donations = await db.queryAll<Donation>`
      SELECT 
        id, 
        user_id as "userId", 
        user_name as "userName", 
        amount, 
        currency, 
        status,
        donation_type as "donationType", 
        message, 
        created_at as "createdAt"
      FROM donations
      WHERE status = 'completed'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const totalResult = await db.queryRow<{ total: number }>`
      SELECT COALESCE(SUM(amount), 0)::DOUBLE PRECISION as total
      FROM donations
      WHERE status = 'completed'
    `;

    return { donations, total: totalResult?.total || 0 };
  }
);
