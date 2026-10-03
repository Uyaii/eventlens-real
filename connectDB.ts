import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_S_KEY;
// Create a single supabase client for interacting with your database
if (!supabaseUrl || !supabaseKey) throw new Error("Check envs");
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
