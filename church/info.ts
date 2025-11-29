import { api } from "encore.dev/api";
import db from "../db";

interface ChurchInfo {
  nameEn: string;
  nameEs: string;
  address: string;
  phone: string;
  email: string;
  serviceTimesEn: string;
  serviceTimesEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  facebookPageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Retrieves church contact information and location.
export const info = api<void, ChurchInfo>(
  { expose: true, method: "GET", path: "/church/info" },
  async () => {
    const info = await db.queryRow<ChurchInfo>`
      SELECT 
        name_en as "nameEn",
        name_es as "nameEs",
        address,
        phone,
        email,
        service_times_en as "serviceTimesEn",
        service_times_es as "serviceTimesEs",
        description_en as "descriptionEn",
        description_es as "descriptionEs",
        facebook_page_url as "facebookPageUrl",
        latitude,
        longitude
      FROM church_info
      WHERE id = 1
    `;
    return info!;
  }
);
