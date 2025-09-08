import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: `أنت مساعد ذكي للشرطة السعودية. مهامك:
1. مساعدة الضباط في كتابة التقارير
2. الإجابة على استفسارات حول النظام
3. تقديم معلومات قانونية أساسية
4. مساعدة في تحليل الحوادث

تحدث بالعربية بشكل أساسي. كن مهنياً ومفيداً ومختصراً في إجاباتك.
لا تتجاوز 100 كلمة في الإجابة إلا إذا طُلب منك تفصيل أكثر.`
      },
      ...(history || []),
      { role: 'user', content: message }
    ];

    // Call OpenAI Chat API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Chat error:', errorText);
      throw new Error(`OpenAI Chat error: ${errorText}`);
    }

    const result = await response.json();
    const assistantMessage = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: assistantMessage,
        usage: result.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});