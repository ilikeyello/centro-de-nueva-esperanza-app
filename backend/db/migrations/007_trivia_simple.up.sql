-- Trivia levels table
CREATE TABLE trivia_levels_simple (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  shuffle_questions BOOLEAN DEFAULT TRUE,
  time_limit INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trivia questions table
CREATE TABLE trivia_questions_simple (
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

-- Insert default trivia levels
INSERT INTO trivia_levels_simple (id, name, description, shuffle_questions, time_limit, passing_score)
VALUES 
  ('kids', 'Kids', 'For children ages 6-12', TRUE, 30, 70),
  ('youth', 'Youth', 'For teenagers and young adults', TRUE, 20, 80),
  ('adults', 'Adults', 'For adult church members', TRUE, 15, 85);

-- Insert sample trivia questions
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
   0, 'New Testament', 'adults');
