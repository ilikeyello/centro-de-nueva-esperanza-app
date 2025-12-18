import { api } from "encore.dev/api";

export interface BibleTranslation {
  id: string;
  name: string;
  language: "en" | "es";
  license: string;
  attribution: string;
}

interface TranslationsResponse {
  translations: BibleTranslation[];
}

export const translations = api<void, TranslationsResponse>(
  { expose: true, method: "GET", path: "/bible/translations" },
  async () => {
    return {
      translations: [
        {
          id: "kjv",
          name: "King James Version",
          language: "en",
          license: "Public Domain",
          attribution: "King James Version (KJV), Public Domain.",
        },
        {
          id: "rv1909",
          name: "Reina-Valera 1909",
          language: "es",
          license: "Public Domain (US)",
          attribution: "Reina-Valera 1909 (RV1909), Public Domain in the United States.",
        },
        {
          id: "spnbes",
          name: "La Biblia en Español Sencillo",
          language: "es",
          license: "CC BY 4.0",
          attribution:
            "La Biblia en Español Sencillo. © 2018–2019 AudioBiblia.org / Irma Flores. Licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).",
        },
      ],
    };
  }
);
