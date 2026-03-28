const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = 'https://wreovuejotnudkpaaffz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZW92dWVqb3RudWRrcGFhZmZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4ODcwMzMsImV4cCI6MjA4NDQ2MzAzM30.tQRk6TrUpPFTlWTDq5q_7PVkDlSWvu7mAG3rk5fRHhQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTrivia() {
  const { data, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('--- Questions ---');
  data.forEach(q => {
    const options = typeof q.options_en === 'string' ? JSON.parse(q.options_en) : q.options_en;
    console.log(`Q: ${q.question_en}`);
    console.log(`Options: ${options}`);
    console.log(`Correct Index: ${q.correct_answer}`);
    console.log(`Correct Value: ${options[q.correct_answer]}`);
    console.log('---');
  });
}

checkTrivia();
