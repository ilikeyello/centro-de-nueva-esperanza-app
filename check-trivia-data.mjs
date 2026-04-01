import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: "frontend/.env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const churchOrgId = process.env.VITE_CHURCH_ORG_ID?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

const { data: levels, error: lvlErr } = await supabase
  .from('trivia_levels')
  .select('*')
  .limit(5);

console.log('LEVELS (all cols):', JSON.stringify(levels, null, 2));
console.log('LEVELS error:', lvlErr?.message);
console.log('churchOrgId:', `"${churchOrgId}"`);

if (levels?.length) {
  const { data: questions } = await supabase
    .from('trivia_questions')
    .select('id, question_en, options_en, options_es, correct_answer')
    .eq('level_id', levels[0].id)
    .eq('church_id', churchOrgId)
    .limit(3);

  console.log('\nQUESTIONS (raw from DB):');
  questions?.forEach(q => {
    console.log(`\n  Q: ${q.question_en}`);
    console.log(`  options_en type: ${typeof q.options_en}, isArray: ${Array.isArray(q.options_en)}`);
    console.log(`  options_en value: ${JSON.stringify(q.options_en)}`);
    console.log(`  correct_answer: ${q.correct_answer} (type: ${typeof q.correct_answer})`);
    const opts = Array.isArray(q.options_en) ? q.options_en : JSON.parse(q.options_en || '[]');
    console.log(`  correctAnswerText (opts[0]): "${opts[0]}"`);
  });
}
