import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking trivia_levels...");
  const { data: t1, error: e1 } = await supabase.from('trivia_levels').select('id').limit(1);
  if (e1) console.error("Error trivia_levels:", e1.message);
  else console.log("Success trivia_levels");

  console.log("Checking word_search_levels...");
  const { data: t2, error: e2 } = await supabase.from('word_search_levels').select('id').limit(1);
  if (e2) console.error("Error word_search_levels:", e2.message);
  else console.log("Success word_search_levels");
}

checkTables();
