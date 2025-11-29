import { api } from "encore.dev/api";
import db from "../db";

export const setupTriviaTables = api(
  { expose: true, path: "/trivia/setup-tables", method: "POST" },
  async (): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Starting trivia table setup...");
      
      // Create trivia_levels_simple table
      try {
        await db.query`
          CREATE TABLE IF NOT EXISTS trivia_levels_simple (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            shuffle_questions BOOLEAN DEFAULT TRUE,
            time_limit INTEGER DEFAULT 30,
            passing_score INTEGER DEFAULT 70,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        console.log("trivia_levels_simple table created or already exists");
      } catch (error) {
        console.error("Error creating trivia_levels_simple table:", error);
        throw error;
      }

      // Create trivia_questions_simple table
      try {
        await db.query`
          CREATE TABLE IF NOT EXISTS trivia_questions_simple (
            id BIGSERIAL PRIMARY KEY,
            question_en TEXT NOT NULL,
            question_es TEXT NOT NULL,
            options_en TEXT NOT NULL,
            options_es TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            category TEXT NOT NULL,
            level_id TEXT NOT NULL REFERENCES trivia_levels_simple(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        console.log("trivia_questions_simple table created or already exists");
      } catch (error) {
        console.error("Error creating trivia_questions_simple table:", error);
        throw error;
      }

      // Insert sample data if tables are empty
      try {
        const levelsCount = await db.query`SELECT COUNT(*) as count FROM trivia_levels_simple`;
        const countRows = [];
        for await (const row of levelsCount) {
          countRows.push(row);
        }
        const hasLevels = (countRows[0]?.count || 0) > 0;

        if (!hasLevels) {
          console.log("Inserting sample trivia levels...");
          
          await db.query`
            INSERT INTO trivia_levels_simple (id, name, description, shuffle_questions, time_limit, passing_score)
            VALUES 
              ('kids', 'Kids', 'For children ages 6-12', TRUE, 30, 70),
              ('youth', 'Youth', 'For teenagers and young adults', TRUE, 20, 80),
              ('adults', 'Adults', 'For adult church members', TRUE, 15, 85)
            ON CONFLICT (id) DO NOTHING;
          `;
          
          console.log("Sample trivia levels inserted");

          console.log("Inserting sample trivia questions...");
          await db.query`
            INSERT INTO trivia_questions_simple (question_en, question_es, options_en, options_es, correct_answer, category, level_id)
            VALUES 
              ('Who built the ark?', '¿Quién construyó el arca?', 
               '["Noah", "Moses", "Abraham", "David"]', 
               '["Noé", "Moisés", "Abraham", "David"]', 
               0, 'Old Testament', 'kids'),
               
              ('What was the name of the garden where Adam and Eve lived?', '¿Cuál era el nombre del jardín donde vivían Adán y Eva?', 
               '["Garden of Eden", "Garden of Gethsemane", "Garden of Olives", "Garden of Paradise"]', 
               '["Jardín del Edén", "Jardín de Getsemaní", "Jardín de los Olivos", "Jardín del Paraíso"]', 
               0, 'Old Testament', 'kids'),
               
              ('Who led the Israelites out of Egypt?', '¿Quién guio a los israelitas fuera de Egipto?', 
               '["Moses", "Abraham", "Jacob", "Joseph"]', 
               '["Moisés", "Abraham", "Jacob", "José"]', 
               0, 'Old Testament', 'youth'),
               
              ('What was the first plague in Egypt?', '¿Cuál fue la primera plaga en Egipto?', 
               '["Water to blood", "Frogs", "Lice", "Darkness"]', 
               '["Agua a sangre", "Ranas", "Piojos", "Oscuridad"]', 
               0, 'Old Testament', 'youth'),
               
              ('Who was the first king of Israel?', '¿Quién fue el primer rey de Israel?', 
               '["Saul", "David", "Solomon", "Samuel"]', 
               '["Saúl", "David", "Salomón", "Samuel"]', 
               0, 'Old Testament', 'adults'),
               
              ('What is the shortest book in the Bible?', '¿Cuál es el libro más corto de la Biblia?', 
               '["3 John", "2 John", "Philemon", "Jude"]', 
               '["3 Juan", "2 Juan", "Filemón", "Judas"]', 
               0, 'New Testament', 'adults')
            ON CONFLICT DO NOTHING;
          `;
          
          console.log("Sample trivia questions inserted");
        } else {
          console.log("Sample data already exists");
        }
      } catch (error) {
        console.error("Error inserting sample data:", error);
        // Don't throw here - tables might exist but sample data insertion failed
      }

      return { 
        success: true, 
        message: "Trivia database setup completed successfully!" 
      };
    } catch (error) {
      console.error('Setup error:', error);
      return { 
        success: false, 
        message: `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
);
