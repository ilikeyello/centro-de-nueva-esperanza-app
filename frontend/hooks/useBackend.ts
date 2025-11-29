import Client from "~backend/client";

const API_BASE =
  import.meta.env.VITE_CLIENT_TARGET ??
  (import.meta.env.DEV ? "http://localhost:4000" : "https://prod-cne-sh82.encr.app");

// Create a proper backend client instance
const backend = new Client(API_BASE);

export function useBackend() {
  return backend;
}
