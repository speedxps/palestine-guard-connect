import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Starting user deletion process for:', userId);

    // حذف السجلات المرتبطة أولاً لتجنب مشاكل foreign key
    
    // 1. حذف tickets
    const { error: ticketsError } = await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('user_id', userId);
    
    if (ticketsError) {
      console.error('Error deleting tickets:', ticketsError);
    }

    // 2. حذف activity logs
    const { error: activityError } = await supabaseAdmin
      .from('activity_logs')
      .delete()
      .eq('user_id', userId);
    
    if (activityError) {
      console.error('Error deleting activity logs:', activityError);
    }

    // 3. حذف user_roles
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error deleting user roles:', rolesError);
    }

    // 4. حذف news_reads
    const { error: newsReadsError } = await supabaseAdmin
      .from('news_reads')
      .delete()
      .eq('user_id', userId);
    
    if (newsReadsError) {
      console.error('Error deleting news reads:', newsReadsError);
    }

    // 5. حذف notification_views
    const { error: notificationViewsError } = await supabaseAdmin
      .from('notification_views')
      .delete()
      .eq('user_id', userId);
    
    if (notificationViewsError) {
      console.error('Error deleting notification views:', notificationViewsError);
    }

    // 6. حذف cybercrime_access
    const { error: cybercrimeAccessError } = await supabaseAdmin
      .from('cybercrime_access')
      .delete()
      .eq('user_id', userId);
    
    if (cybercrimeAccessError) {
      console.error('Error deleting cybercrime access:', cybercrimeAccessError);
    }

    // 7. حذف face_data
    const { error: faceDataError } = await supabaseAdmin
      .from('face_data')
      .delete()
      .eq('user_id', userId);
    
    if (faceDataError) {
      console.error('Error deleting face data:', faceDataError);
    }

    // 8. حذف profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // 9. أخيراً حذف المستخدم من auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User deleted successfully:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in delete-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});