
const { createClient } = require("@supabase/supabase-js");
const { config } = require("./env");

function createUserSupabaseClient(accessToken) {
  const supabaseUrl = config?.supabase?.url || process.env.SUPABASE_URL;
  const supabaseAnonKey = config?.supabase?.anonKey || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  if (!accessToken) {
    throw new Error("User access token is required");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function createServiceSupabaseClient() {
  const supabaseUrl = config?.supabase?.url || process.env.SUPABASE_URL;
  const serviceRoleKey = config?.supabase?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service-role environment variables are missing");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

module.exports = {
  createUserSupabaseClient,
  createServiceSupabaseClient
};
