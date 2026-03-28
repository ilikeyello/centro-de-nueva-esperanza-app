const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wreovuejotnudkpaaffz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZW92dWVqb3RudWRrcGFhZmZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4NzAzMywiZXhwIjoyMDg0NDYzMDMzfQ.pG-Nhxt-Hdm8AzJ5Z9qToTX_EWrlAlmCDO3RDtKW-P4' // service role
);

async function check() {
  const { data, error } = await supabase.from('push_subscriptions').select('*');
  console.log("Subscriptions:", JSON.stringify(data, null, 2));
  if (error) console.log("Error:", error);
}

check();
