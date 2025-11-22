
import { api } from "encore.dev/api";
import { Service } from "encore.dev/service";

export default new Service("frontend");

// Serve static files from the dist directory
export const staticAssets = api.static({
  path: "/assets/*path",
  dir: "./dist/assets",
});

// Serve the main HTML file for all other routes
export const index = api.static({
  path: "/*path",
  dir: "./dist",
  notFound: "./dist/index.html",
  notFoundStatus: 200,
});

// Serve the logo file
export const logo = api.static({
  path: "/cne_logo_black.svg",
  dir: "./dist",
});
