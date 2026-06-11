import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnnonkey = import.meta.env.VITE_SUPABASE_ANNON_KEY;

const supabase = createClient(supabaseUrl,supabaseAnnonkey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        }
    }
})

export default supabase