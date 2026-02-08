export type AppPage = "home" | "bible" | "media" | "news" | "bulletin" | "games";

export function pathFromPage(page: string): string {
  switch (page) {
    case "home":
      return "/";
    case "bible":
      return "/bible";
    case "media":
      return "/media";
    case "news":
      return "/news";
    case "bulletin":
      return "/bulletin";
    case "games":
      return "/games";
    default:
      return "/";
  }
}
