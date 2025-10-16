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

    // أولاً: جلب profile.id من user_id
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profileData) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const profileId = profileData.id;
    console.log('Profile ID:', profileId);

    // حذف السجلات المرتبطة بـ profiles.id أولاً
    
    // 1. حذف incidents
    await supabaseAdmin.from('incidents').delete().eq('reporter_id', profileId);
    await supabaseAdmin.from('incidents').delete().eq('assigned_to', profileId);
    
    // 2. حذف cybercrime_reports
    await supabaseAdmin.from('cybercrime_reports').delete().eq('reporter_id', profileId);
    await supabaseAdmin.from('cybercrime_reports').delete().eq('assigned_to', profileId);
    
    // 3. حذف tasks
    await supabaseAdmin.from('tasks').delete().eq('assigned_by', profileId);
    await supabaseAdmin.from('tasks').delete().eq('assigned_to', profileId);
    
    // 4. حذف notifications
    await supabaseAdmin.from('notifications').delete().eq('sender_id', profileId);
    await supabaseAdmin.from('notifications').delete().eq('recipient_id', profileId);
    
    // 5. حذف chat_messages
    await supabaseAdmin.from('chat_messages').delete().eq('sender_id', profileId);
    await supabaseAdmin.from('chat_messages').delete().eq('recipient_id', profileId);
    
    // 6. حذف department_chat_messages
    await supabaseAdmin.from('department_chat_messages').delete().eq('sender_id', profileId);
    
    // 7. حذف chat_rooms
    await supabaseAdmin.from('chat_rooms').delete().eq('created_by', profileId);
    
    // 8. حذف chat_room_members (سيحذف تلقائياً مع CASCADE)
    await supabaseAdmin.from('chat_room_members').delete().eq('user_id', profileId);
    
    // 9. حذف incident_files
    await supabaseAdmin.from('incident_files').delete().eq('uploaded_by', profileId);
    
    // 10. حذف patrol_tracking
    await supabaseAdmin.from('patrol_tracking').delete().eq('officer_id', profileId);
    
    // 11. حذف reports
    await supabaseAdmin.from('reports').delete().eq('generated_by', profileId);
    
    // 12. حذف activity_logs (المرتبط بـ profile.id)
    await supabaseAdmin.from('activity_logs').delete().eq('user_id', profileId);
    
    // حذف السجلات المرتبطة بـ user_id
    
    // 13. حذف tickets
    await supabaseAdmin.from('tickets').delete().eq('user_id', userId);
    
    // 14. حذف user_roles
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    
    // 15. حذف news_reads
    await supabaseAdmin.from('news_reads').delete().eq('user_id', userId);
    
    // 16. حذف notification_views
    await supabaseAdmin.from('notification_views').delete().eq('user_id', userId);
    
    // 17. حذف cybercrime_access
    await supabaseAdmin.from('cybercrime_access').delete().eq('user_id', userId);
    
    // 18. حذف face_data
    await supabaseAdmin.from('face_data').delete().eq('user_id', userId);
    
    // السجلات مع CASCADE ستحذف تلقائياً: posts, post_comments, post_likes, 
    // cybercrime_comments, cybercrime_followers, duty_chat_messages
    
    // 19. أخيراً حذف profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete profile: ' + profileError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // 20. أخيراً حذف المستخدم من auth
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