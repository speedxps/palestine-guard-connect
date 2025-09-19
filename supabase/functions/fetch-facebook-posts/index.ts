import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacebookPost {
  id: string
  message?: string
  story?: string
  full_picture?: string
  created_time: string
  permalink_url?: string
}

async function fetchFacebookPosts() {
  try {
    // Try to get Facebook posts from Palestinian Police page
    // Note: This requires Facebook Graph API access token
    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN')
    
    if (!accessToken) {
      console.log('No Facebook access token found, returning mock data')
      // Return mock data if no access token
      return {
        data: [{
          id: 'mock_post_1',
          message: 'تعلن قيادة الشرطة الفلسطينية عن تفعيل الخطة الأمنية الشاملة خلال الأيام القادمة، وذلك لضمان الأمن والسلامة العامة. نرجو من المواطنين التعاون مع رجال الأمن والإبلاغ عن أي أمور مشبوهة.',
          full_picture: '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png',
          created_time: new Date().toISOString(),
          permalink_url: 'https://www.facebook.com/Palestinianpolice1'
        }]
      }
    }

    // Facebook Graph API call
    const pageId = 'Palestinianpolice1' // Palestinian Police Facebook page
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,story,full_picture,created_time,permalink_url&limit=1&access_token=${accessToken}`
    )

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Error fetching Facebook posts:', error)
    // Return fallback data
    return {
      data: [{
        id: 'fallback_post',
        message: 'تعلن قيادة الشرطة الفلسطينية عن تفعيل الخطة الأمنية الشاملة خلال الأيام القادمة، وذلك لضمان الأمن والسلامة العامة.',
        full_picture: '/lovable-uploads/b1560465-346a-4180-a2b3-7f08124d1116.png',
        created_time: new Date().toISOString(),
        permalink_url: 'https://www.facebook.com/Palestinianpolice1'
      }]
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const posts = await fetchFacebookPosts()
    
    return new Response(
      JSON.stringify(posts),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  } catch (error) {
    console.error('Error in function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})