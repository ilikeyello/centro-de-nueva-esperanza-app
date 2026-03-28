const fetch = require('node-fetch'); // Next.js env or built-in fetch if Node 18+

async function runTest() {
  const url = 'https://wreovuejotnudkpaaffz.supabase.co/functions/v1/send-web-push';
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZW92dWVqb3RudWRrcGFhZmZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4NzAzMywiZXhwIjoyMDg0NDYzMDMzfQ.pG-Nhxt-Hdm8AzJ5Z9qToTX_EWrlAlmCDO3RDtKW-P4';
  
  const payload = {
    type: 'announcement',
    record: {
      titleEn: 'Test Push via script',
      org_id: 'org_38agxTQYvbrRSYd2jdxcfL5DGXf'
    }
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

runTest();
