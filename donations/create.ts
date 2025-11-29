import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface CreateDonationRequest {
  amount: number;
  donationType: "general" | "missions" | "building" | "other";
  message?: string;
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
  clientSecret: string;
}

// Creates a new donation and returns a payment intent.
export const create = api<CreateDonationRequest, Donation>(
  { expose: true, method: "POST", path: "/donations", auth: true },
  async (req) => {
    const auth = getAuthData()!;

    const donation = await db.queryRow<Omit<Donation, "clientSecret">>`
      INSERT INTO donations (user_id, user_name, amount, donation_type, message, payment_intent_id, status)
      VALUES (${auth.userID}, ${auth.email || "Anonymous"}, ${req.amount}, ${req.donationType}, ${req.message || null}, NULL, 'pending')
      RETURNING id, user_id as "userId", user_name as "userName", amount, currency, status, 
                donation_type as "donationType", message, created_at as "createdAt"
    `;

    return {
      ...donation!,
      clientSecret: "",
    };
  }
);
