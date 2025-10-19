import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TEST_USERS: Array<{ email: string; password: string; role: string; fullName: string }> = [
  { email: "admin@test.com",         password: "admin123",    role: "admin",             fullName: "مدير النظام" },
  { email: "admin_ops@test.com",     password: "123123",      role: "operations_system", fullName: "مدير العمليات والجهاز" },
  { email: "traffic@test.com",       password: "traffic123",  role: "traffic_police",    fullName: "شرطة المرور" },
  { email: "cid@test.com",           password: "cid123",      role: "cid",               fullName: "المباحث الجنائية" },
  { email: "special@test.com",       password: "special123",  role: "special_police",    fullName: "الشرطة الخاصة" },
  { email: "cyber@test.com",         password: "cyber123",    role: "cybercrime",        fullName: "الجرائم الإلكترونية" },
  { email: "judicial@test.com",      password: "judicial123", role: "judicial_police",   fullName: "الشرطة القضائية" },
  { email: "border_admin@test.com",  password: "123123",      role: "borders",           fullName: "مدير المعابر والحدود" },
  { email: "tourism_admin@test.com", password: "123123",      role: "tourism_police",    fullName: "مدير الشرطة السياحية" },
  { email: "joint_admin@test.com",   password: "123123",      role: "joint_operations",  fullName: "مدير العمليات المشتركة" },
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

  // 1) Insert role into public.user_roles (idempotent) - add admin role for admin_ops
      let roleErr;
      
      // If user is admin_ops, give both operations_system AND admin roles
      if (u.email === 'admin_ops@test.com') {
        const { error: adminRoleErr } = await admin
          .from("user_roles")
          .upsert({ user_id: userId, role: 'admin' as any }, { onConflict: "user_id,role" });
        
        const { error: opsRoleErr } = await admin
          .from("user_roles")
          .upsert({ user_id: userId, role: u.role as any }, { onConflict: "user_id,role" });
          
        roleErr = adminRoleErr || opsRoleErr;
      } else {
        const { error: err } = await admin
          .from("user_roles")
          .upsert({ user_id: userId, role: u.role as any }, { onConflict: "user_id,role" });
        roleErr = err;
      }
      
      if (roleErr && !String(roleErr.message || "").includes("duplicate")) {
        results.push({ email: u.email, status: "created", role_assigned: false, role_error: roleErr.message });
        continue;
      }

      // 2) Ensure a profile exists (trigger should handle this, but double check)
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        // Update profile with latest info (without role)
        await admin
          .from("profiles")
          .update({ email: u.email, username: u.email, full_name: u.fullName })
          .eq("user_id", userId);
      } else {
        // Trigger should have created it, but if not, create it now
        await admin
          .from("profiles")
          .insert({ user_id: userId, email: u.email, username: u.email, full_name: u.fullName });
      }

      results.push({ email: u.email, status: "ok", user_id: userId, role: u.role });
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