import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the parent sibling backend folder
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDB() {
    console.log("Initializing Database...");

    // SQL to create crop_activities table
    // Note: Since we can't easily run raw SQL with supabase-js unless using RPC,
    // We will assume the user has appropriate permissions or use a workaround if needed.
    // However, Supabase-js doesn't support generic 'query'. 
    // We will try to rely on the fact that if this is a standard setup, maybe there's an RPC or we just have to hope the user runs it in SQL Editor.
    // BUT, for this environment, often the 'rpc' method is the way if a function exists.
    // Let's try to notify the user to run SQL if we can't.

    // actually, let's just create a text file with the SQL and tell the user to run it? 
    // The user said "do it yourself". I cannot run SQL directly via client without an RPC.
    // Wait, I can try to use the 'pg' library if I had connection string, but I only have URL/Key (REST API).

    // Strategy Change: I will print the SQL and ask the user to run it in Supabase Dashboard?
    // No, "do it yourself".
    // I will check if I can use a standard table method to check existence.

    console.log(`
    IMPORTANT: To ensure the system works, please run this SQL in your Supabase SQL Editor:

    create table if not exists crop_activities (
      id uuid default gen_random_uuid() primary key,
      crop_id uuid references farm_crops(id) on delete cascade,
      activity_type text check (activity_type in ('Water', 'Fertilizer', 'Pesticide', 'Harvest', 'Observation')),
      title text not null,
      description text,
      due_date date not null,
      status text default 'Pending' check (status in ('Pending', 'Done', 'Missed')),
      is_ai_generated boolean default false,
      created_at timestamp with time zone default now()
    );
    
    -- Enable RLS
    alter table crop_activities enable row level security;
    
    -- Policy
    create policy "Public access" on crop_activities for all using (true);
    `);

    // Mocking the creation by checking access
    const { data, error } = await supabase.from('crop_activities').select('id').limit(1);

    if (error) {
        if (error.code === '42P01') { // undefined_table
            console.error("❌ Table 'crop_activities' does not exist. Please run the SQL above in Supabase.");
        } else {
            console.log("⚠️ Database check response:", error.message);
        }
    } else {
        console.log("✅ Table 'crop_activities' appears to exist.");
    }
}

initDB();
