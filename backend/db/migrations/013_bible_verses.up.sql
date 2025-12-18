CREATE TABLE bible_verses (
  id BIGSERIAL PRIMARY KEY,
  translation TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (translation, book, chapter, verse)
);

CREATE INDEX bible_verses_lookup_idx
  ON bible_verses (translation, book, chapter, verse);
