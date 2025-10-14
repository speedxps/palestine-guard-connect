import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TEST_USERS: Array<{ email: string; password: string; role: string; fullName: string }> = [
  { email: "admin@test.com",    password: "admin123",    role: "admin",             fullName: "مدير النظام" },
  { email: "traffic@test.com",  password: "traffic123",  role: "traffic_police",    fullName: "شرطة المرور" },
  { email: "cid@test.com",      password: "cid123",      role: "cid",               fullName: "المباحث الجنائية" },
  { email: "special@test.com",  password: "special123",  role: "special_police",    fullName: "الشرطة الخاصة" },
  { email: "cyber@test.com",    password: "cyber123",    role: "cybercrime",        fullName: "الجرائم الإلكترونية" },
  { email: "judicial@test.com", password: "judicial123", role: "judicial_police",   fullName: "الشرطة القضائية" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase service credentials" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const results: Array<any> = [];

  for (const u of TEST_USERS) {
    try {
      // Try create user
      let userId: string | null = null;
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.fullName }
      });

      if (createErr) {
        // If already exists, try to find by listing
        // Note: createUser returns an error like "User already registered"
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const found = list?.users?.find((x: any) => x.email?.toLowerCase() === u.email.toLowerCase());
        userId = found?.id ?? null;
      } else {
        userId = created?.user?.id ?? null;
      }

      if (!userId) {
        results.push({ email: u.email, status: "failed", reason: "cannot resolve user id" });
        continue;
      }

      // 1) Insert role into public.user_roles (idempotent)
      const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: u.role as any }).onConflict("user_id,role");
      if (roleErr && !String(roleErr.message || "").includes("duplicate")) {
        // Continue but note the error
        results.push({ email: u.email, status: "created", role_assigned: false, role_error: roleErr.message });
      }

      // 2) Ensure a profile exists and has a safe role value from user_role enum
      // user_role enum supports: admin, cid, cybercrime, officer, special_police, traffic_police, user
      const profileRole = ["admin","cid","cybercrime","special_police","traffic_police","officer","user"].includes(u.role)
        ? u.role
        : "officer";

      // Try select existing profile
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        await admin
          .from("profiles")
          .update({ email: u.email, username: u.email, full_name: u.fullName, role: profileRole })
          .eq("user_id", userId);
      } else {
        await admin
          .from("profiles")
          .insert({ user_id: userId, email: u.email, username: u.email, full_name: u.fullName, role: profileRole });
      }

      results.push({ email: u.email, status: "ok", user_id: userId, role: u.role, profile_role: profileRole });
    } catch (e) {
      results.push({ email: u.email, status: "failed", reason: e instanceof Error ? e.message : String(e) });
    }
  }

  const summary = {
    created: results.filter(r => r.status === "ok").map(r => r.email),
    failed: results.filter(r => r.status === "failed").map(r => ({ email: r.email, reason: r.reason })),
  };

  return new Response(JSON.stringify({ success: true, results, summary }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});