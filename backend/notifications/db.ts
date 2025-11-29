import { database } from "encore.dev/storage/sqldb";

// Reuse the main database connection
export default database("main");
