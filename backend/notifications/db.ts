import { SQLDatabase } from "encore.dev/storage/sqldb";

// Reuse the main database connection
export default new SQLDatabase("notifications", {
  migrations: "./migrations",
});
